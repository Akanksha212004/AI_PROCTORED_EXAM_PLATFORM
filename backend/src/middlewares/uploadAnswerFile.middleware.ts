// src/middlewares/uploadAnswerFile.middleware.ts
//
// Mirrors upload.middleware.ts's exact pattern (destination dir,
// filename strategy, size/type limits) but for student answer uploads
// instead of examiner model-answer uploads. Separate folder
// (uploads/answers/) keeps the two clearly apart on disk.
//
// NOTE: doc says "thumbnail generated server-side" for IMAGE_UPLOAD
// answers — deliberately NOT implemented in this basic pass (would
// need a new dependency like `sharp`, which wasn't already in
// package.json). Original file is stored as-is; thumbnailing can be
// added as a follow-up without changing this upload contract.

import fs from "fs";
import multer from "multer";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "answers");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

export const uploadAnswerFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only PNG, JPEG, WEBP, or PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");
