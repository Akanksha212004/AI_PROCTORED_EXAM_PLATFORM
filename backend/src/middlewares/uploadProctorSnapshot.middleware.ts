// src/middlewares/uploadProctorSnapshot.middleware.ts
//
// Mirrors upload.middleware.ts / uploadAnswerFile.middleware.ts exactly
// — same destination-dir + filename strategy, separate folder.

import fs from "fs";
import multer from "multer";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "proctor-snapshots");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

export const uploadProctorSnapshot = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // snapshots are small, low-res
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only PNG, JPEG, or WEBP snapshots are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");
