/**
 * Handles the file upload for a question's handwritten model answer.
 * Access to the route this is mounted on is restricted to
 * EXAMINER/ADMIN via `requireRoles` — this middleware only deals with
 * storage and file-type/size limits.
 *
 * Files are saved to disk under `uploads/model-answers/` and served
 * back via `express.static` (see `app.ts`). Swap `diskStorage` for an
 * S3/GCS adapter later without touching any calling code — the
 * controller only ever sees `req.file.path`/`filename`.
 */
import fs from "fs";
import multer from "multer";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "model-answers");
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

export const uploadModelAnswer = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only PNG, JPEG, WEBP, or PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
}).single("file");
