/**
 * Extracts raw text from an uploaded PDF or DOCX buffer.
 * Kept separate from bulkImportParser.service.ts (which turns raw
 * text into DraftQuestion objects) so the two concerns — "read the
 * file format" vs "interpret the content" — stay independently
 * testable and swappable.
 */
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { ApiError } from "../utils/apiError";
 
const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
 
export async function extractRawText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === PDF_MIME) {
    const result = await pdfParse(buffer);
    return result.text;
  }
 
  if (mimetype === DOCX_MIME) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
 
  // Should be unreachable — uploadBulkImportFile's fileFilter already
  // rejects anything else — but guard defensively rather than silently
  // returning empty text.
  throw new ApiError(400, `Unsupported file type: ${mimetype}`);
}