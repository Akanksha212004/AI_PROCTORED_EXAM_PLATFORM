/**
 * Handles the file upload for bulk question import (Question Bank).
 * Unlike uploadModelAnswer (diskStorage), this uses memoryStorage —
 * the file is parsed in-memory and discarded immediately after; it is
 * never persisted to disk or referenced by a DB row. Nothing here
 * writes to the database — that only happens via the separate
 * /bulk-import/confirm endpoint after examiner review.
 */
import multer from "multer";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

export const uploadBulkImportFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only PDF or DOCX files are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");