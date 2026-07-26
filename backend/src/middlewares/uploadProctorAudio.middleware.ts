// src/middlewares/uploadProctorAudio.middleware.ts
//
// Mirrors uploadProctorSnapshot.middleware.ts. Separate temp folder —
// unlike snapshots, audio clips are NOT kept after analysis (privacy:
// no reason to retain raw recorded audio once we've extracted a
// voice-activity verdict from it). See proctorEvent.service.ts
// submitAudioClip, which always deletes the file after forwarding it
// to ai-service, success or failure.

import fs from "fs";
import multer from "multer";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "proctor-audio-tmp");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["audio/wav", "audio/wave", "audio/x-wav"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".wav";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

export const uploadProctorAudio = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // a few seconds of 16-bit mono PCM WAV is small
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only WAV audio clips are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");
