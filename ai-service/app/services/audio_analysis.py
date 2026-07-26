# app/services/audio_analysis.py
#
# Voice Activity Detection (VAD) using webrtcvad — the same VAD
# algorithm used inside WebRTC/Chrome itself for muting silence during
# calls. This is a real, purpose-built speech-vs-non-speech classifier
# (trained to reject steady noise like fans/AC/traffic hum), which is
# a genuine step up from a plain RMS-volume threshold: volume alone
# can't tell a loud cough or a running fan apart from actual talking;
# webrtcvad's spectral analysis can, much more often.
#
# HONEST LIMITATIONS:
# - It answers "is there voiced human speech in this frame", not "is
#   the enrolled student speaking" — it can't do speaker verification.
#   A second person talking near the mic still counts as voice
#   activity, same as before; that's inherent to volume/VAD-only
#   approaches without a speaker-ID model.
# - Expects clean-ish 16-bit PCM mono audio at 8/16/32/48kHz. The
#   frontend downsamples to 16kHz before uploading (see
#   useAudioMonitoring.ts) specifically to satisfy this.

import wave
from dataclasses import dataclass
from io import BytesIO

import webrtcvad

from app.core.config import settings

_SUPPORTED_SAMPLE_RATES = (8000, 16000, 32000, 48000)
_FRAME_DURATION_MS = 30  # webrtcvad only accepts 10, 20, or 30ms frames


@dataclass
class AudioAnalysisResult:
    voiced_frame_ratio: float  # 0..1 — fraction of frames classified as speech
    is_speech_detected: bool  # voiced_frame_ratio past the sustained-activity threshold
    frame_count: int


def analyze_audio_clip(wav_bytes: bytes) -> AudioAnalysisResult:
    with wave.open(BytesIO(wav_bytes), "rb") as wav_file:
        channels = wav_file.getnchannels()
        sample_width = wav_file.getsampwidth()
        sample_rate = wav_file.getframerate()
        pcm_data = wav_file.readframes(wav_file.getnframes())

    if channels != 1:
        raise ValueError("Audio must be mono")
    if sample_width != 2:
        raise ValueError("Audio must be 16-bit PCM")
    if sample_rate not in _SUPPORTED_SAMPLE_RATES:
        raise ValueError(f"Unsupported sample rate {sample_rate}; expected one of {_SUPPORTED_SAMPLE_RATES}")

    vad = webrtcvad.Vad(settings.audio_vad_aggressiveness)

    bytes_per_frame = int(sample_rate * (_FRAME_DURATION_MS / 1000.0)) * sample_width
    frame_count = 0
    voiced_count = 0

    for offset in range(0, len(pcm_data) - bytes_per_frame + 1, bytes_per_frame):
        frame = pcm_data[offset : offset + bytes_per_frame]
        frame_count += 1
        if vad.is_speech(frame, sample_rate):
            voiced_count += 1

    if frame_count == 0:
        return AudioAnalysisResult(voiced_frame_ratio=0.0, is_speech_detected=False, frame_count=0)

    ratio = voiced_count / frame_count
    return AudioAnalysisResult(
        voiced_frame_ratio=round(ratio, 3),
        is_speech_detected=ratio >= settings.audio_voiced_frame_ratio_threshold,
        frame_count=frame_count,
    )
