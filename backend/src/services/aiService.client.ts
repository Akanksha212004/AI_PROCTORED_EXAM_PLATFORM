// src/services/aiService.client.ts
//
// Thin client for the internal ai-service (Python/FastAPI/MediaPipe).
// Never called from the browser — only from proctorEvent.service.ts,
// server-to-server, over the internal network, with a shared secret.

import fs from "fs/promises";
import path from "path";
import { GazeSensitivity } from "@prisma/client";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "";
const AI_SERVICE_INTERNAL_KEY = process.env.AI_SERVICE_INTERNAL_KEY ?? "";
const REQUEST_TIMEOUT_MS = 8000;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export interface GazeThresholds {
  near: number;
  far: number;
}

/**
 * Maps the exam's configured gazeSensitivity to actual offset
 * thresholds. HIGH = narrower bands = flags sooner. LOW = wider bands
 * = more lenient. MEDIUM mirrors ai-service's own internal defaults.
 */
export function thresholdsForSensitivity(sensitivity: GazeSensitivity): GazeThresholds {
  switch (sensitivity) {
    case GazeSensitivity.HIGH:
      return { near: 0.05, far: 0.10 };
    case GazeSensitivity.LOW:
      return { near: 0.12, far: 0.22 };
    case GazeSensitivity.MEDIUM:
    default:
      return { near: 0.08, far: 0.16 };
  }
}

export interface AiAnalysisResult {
  faceCount: number;
  gazeDirection: "CENTER" | "LEFT" | "RIGHT" | "AWAY" | null;
  gazeConfidence: number | null;
}

/**
 * Sends a saved snapshot to ai-service for analysis. Returns null
 * (rather than throwing) on any failure — network error, timeout,
 * non-2xx — so a CV hiccup never blocks exam submission flow. The
 * caller falls back to a plain WEBCAM_SNAPSHOT row when this is null.
 */
export async function analyzeSnapshot(
  filePath: string,
  thresholds: GazeThresholds
): Promise<AiAnalysisResult | null> {
  if (!AI_SERVICE_URL || !AI_SERVICE_INTERNAL_KEY) {
    // eslint-disable-next-line no-console
    console.error("aiService.client: AI_SERVICE_URL or AI_SERVICE_INTERNAL_KEY not configured");
    return null;
  }

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_BY_EXTENSION[ext] ?? "image/jpeg";

    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mimeType }), path.basename(filePath));
    form.append("near_threshold", String(thresholds.near));
    form.append("far_threshold", String(thresholds.far));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
        method: "POST",
        headers: { "X-Internal-Api-Key": AI_SERVICE_INTERNAL_KEY },
        body: form,
        signal: controller.signal,
      });

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error(`aiService.client: /analyze returned ${response.status}`);
        return null;
      }

      const data = (await response.json()) as AiAnalysisResult;
      return data;
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("aiService.client: analyze request failed", err);
    return null;
  }
}