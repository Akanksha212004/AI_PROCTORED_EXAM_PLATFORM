"use client";

// hooks/useAudioMonitoring.ts
//
// Captures the mic, downsamples to 16kHz mono, and every CLIP_DURATION_MS
// encodes what it has into a short WAV clip and uploads it to
// proctorEventService.submitAudioClip — the Node backend forwards that to
// ai-service, which runs real Voice Activity Detection (webrtcvad, the same
// VAD used inside WebRTC/Chrome) and returns a verdict. The server's
// response (isFlagged on the created event) is the actual signal used for
// proctoring; this hook doesn't decide "is this speech" itself anymore.
//
// The `level` value returned here (for a live UI meter) IS still computed
// locally, instantly, from raw sample amplitude — that's just a responsive
// visual meter, not a proctoring decision, so there's no accuracy concern
// keeping it client-side.
//
// Uses a ScriptProcessorNode rather than an AudioWorklet: it's a
// deprecated API, but it remains universally supported (including
// Safari) and is far simpler for a small, low-rate use case like this;
// an AudioWorklet would be the "correct" modern choice for anything
// performance-sensitive, which this isn't (a few KB every few seconds).

import { useCallback, useEffect, useRef, useState } from "react";
import { proctorEventService } from "@/services/proctorEventService";

const TARGET_SAMPLE_RATE = 16000; // one of webrtcvad's supported rates
const CLIP_DURATION_MS = 3000;
const PROCESSOR_BUFFER_SIZE = 4096;

export type MonitoringStatus = "idle" | "loading" | "active" | "denied" | "error";

/** Simple linear-interpolation downsampler — good enough for VAD, which
 *  only needs coarse speech/silence structure, not audiophile fidelity. */
function downsampleBuffer(buffer: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (toRate === fromRate) return buffer;
  const ratio = fromRate / toRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const lower = Math.floor(srcIndex);
    const upper = Math.min(lower + 1, buffer.length - 1);
    const frac = srcIndex - lower;
    result[i] = buffer[lower] * (1 - frac) + buffer[upper] * frac;
  }
  return result;
}

function encodeWavMono16(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (mono, 16-bit)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export function useAudioMonitoring(sessionId: string, enabled: boolean) {
  const [status, setStatus] = useState<MonitoringStatus>("idle");
  const [level, setLevel] = useState(0); // live 0–1 meter, purely local/instant
  const [isSpeaking, setIsSpeaking] = useState(false); // reflects the last SERVER verdict
  const [flagCount, setFlagCount] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const chunkStartedAtRef = useRef(0);
  const isUploadingRef = useRef(false);

  const flushClip = useCallback(async () => {
    if (isUploadingRef.current || chunksRef.current.length === 0) return;
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const chunks = chunksRef.current;
    chunksRef.current = [];
    isUploadingRef.current = true;

    try {
      const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const downsampled = downsampleBuffer(merged, audioContext.sampleRate, TARGET_SAMPLE_RATE);
      const wavBlob = encodeWavMono16(downsampled, TARGET_SAMPLE_RATE);

      const event = await proctorEventService.submitAudioClip(sessionId, wavBlob);
      if (event?.isFlagged) {
        setIsSpeaking(true);
        setFlagCount((c) => c + 1);
      } else {
        setIsSpeaking(false);
      }
    } catch {
      // Transient upload failure — the next clip cycle will simply try again.
    } finally {
      isUploadingRef.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function start() {
      setStatus("loading");
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setStatus("error");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const AudioContextCtor =
          window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextCtor();
        const source = audioContext.createMediaStreamSource(stream);
        // ScriptProcessorNode is deprecated but universally supported —
        // see file header for why that tradeoff is fine here.
        const processor = audioContext.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);

        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);

          // Live meter (local, instant) — RMS of this callback's samples.
          let sumSquares = 0;
          for (let i = 0; i < input.length; i++) sumSquares += input[i] * input[i];
          setLevel(Math.sqrt(sumSquares / input.length));

          chunksRef.current.push(new Float32Array(input));

          const elapsed = performance.now() - chunkStartedAtRef.current;
          if (elapsed >= CLIP_DURATION_MS) {
            chunkStartedAtRef.current = performance.now();
            flushClip();
          }
        };

        source.connect(processor);
        // A ScriptProcessorNode must be connected to a destination to fire
        // onaudioprocess in most browsers; route to a silent/muted gain
        // node rather than speakers so the student doesn't hear themselves.
        const silentGain = audioContext.createGain();
        silentGain.gain.value = 0;
        processor.connect(silentGain);
        silentGain.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        sourceRef.current = source;
        processorRef.current = processor;
        chunkStartedAtRef.current = performance.now();

        setStatus("active");
      } catch (err) {
        if ((err as DOMException)?.name === "NotAllowedError") {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
      processorRef.current = null;
      sourceRef.current = null;
      chunksRef.current = [];
    };
  }, [enabled, flushClip]);

  return { status, level, isSpeaking, flagCount };
}
