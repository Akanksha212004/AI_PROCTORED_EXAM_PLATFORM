// /**
//  * Extracts raw text from an uploaded PDF or DOCX buffer.
//  * Kept separate from bulkImportParser.service.ts (which turns raw
//  * text into DraftQuestion objects) so the two concerns — "read the
//  * file format" vs "interpret the content" — stay independently
//  * testable and swappable.
//  */
// import pdfParse from "pdf-parse";
// import mammoth from "mammoth";
// import { ApiError } from "../utils/apiError";
 
// const PDF_MIME = "application/pdf";
// const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
 
// export async function extractRawText(buffer: Buffer, mimetype: string): Promise<string> {
//   if (mimetype === PDF_MIME) {
//     const result = await pdfParse(buffer);
//     return result.text;
//   }
 
//   if (mimetype === DOCX_MIME) {
//     const result = await mammoth.extractRawText({ buffer });
//     return result.value;
//   }
 
//   // Should be unreachable — uploadBulkImportFile's fileFilter already
//   // rejects anything else — but guard defensively rather than silently
//   // returning empty text.
//   throw new ApiError(400, `Unsupported file type: ${mimetype}`);
// }



import { randomUUID } from "crypto";
import type { DraftQuestion } from "../schemas/bulkImport.schema";
import type { DIFFICULTY_LEVELS, QUESTION_TYPES } from "../schemas/question.schema";

const SHORT_ANSWER_WORD_LIMIT = 40;
const DEFAULT_MARKS = 1;
const DEFAULT_DIFFICULTY = "MEDIUM" as const;

const QUESTION_BOUNDARY_RE = /^(Q(?:uestion)?\.?\s*\d+[.):]?)\s*/i;
const OPTION_LINE_RE = /^([A-Da-d])[.)]\s+(.*)$/;
const SUBJECT_LABEL_RE = /^Subject\s*:\s*(.+)$/im;
const DIFFICULTY_LABEL_RE = /^Difficulty\s*:\s*(EASY|MEDIUM|HARD)\s*$/im;
const TYPE_LABEL_RE = /^Type\s*:\s*(MCQ|MULTI_SELECT|SHORT_ANSWER|LONG_ANSWER|IMAGE_UPLOAD)\s*$/im;
const MARKS_LABEL_RE = /^Marks\s*:\s*(\d+)\s*$/im;
const ANSWER_LABEL_RE = /^(?:Answer|Correct)\s*:\s*([A-Da-d](?:\s*,\s*[A-Da-d])*)\s*$/im;

function splitIntoQuestionBlocks(rawText: string): string[] {
  const lines = rawText.split(/\r?\n/);
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (QUESTION_BOUNDARY_RE.test(line.trim()) && current.length > 0) {
      blocks.push(current.join("\n").trim());
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join("\n").trim());

  return blocks.filter((b) => b.trim().length > 0);
}

function matchSubjectToExisting(rawSubject: string, existingSubjects: string[]): string {
  const normalized = rawSubject.trim().toLowerCase();
  const found = existingSubjects.find((s) => s.toLowerCase() === normalized);
  return found ?? rawSubject.trim();
}

function parseBlock(block: string, existingSubjects: string[]): DraftQuestion {
  const lines = block.split(/\r?\n/);

  const firstLine = lines[0].replace(QUESTION_BOUNDARY_RE, "").trim();
  const textLines: string[] = [firstLine];

  const options: { optionText: string; isCorrect: boolean }[] = [];
  let correctLetters: string[] = [];
  let explicitSubject: string | undefined;
  let explicitDifficulty: (typeof DIFFICULTY_LEVELS)[number] | undefined;
  let explicitType: (typeof QUESTION_TYPES)[number] | undefined;
  let explicitMarks: number | undefined;

  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const optionMatch = trimmed.match(OPTION_LINE_RE);
    const subjectMatch = trimmed.match(SUBJECT_LABEL_RE);
    const difficultyMatch = trimmed.match(DIFFICULTY_LABEL_RE);
    const typeMatch = trimmed.match(TYPE_LABEL_RE);
    const marksMatch = trimmed.match(MARKS_LABEL_RE);
    const answerMatch = trimmed.match(ANSWER_LABEL_RE);

    if (optionMatch) {
      options.push({ optionText: optionMatch[2].trim(), isCorrect: false });
    } else if (subjectMatch) {
      explicitSubject = subjectMatch[1].trim();
    } else if (difficultyMatch) {
      explicitDifficulty = difficultyMatch[1].toUpperCase() as typeof explicitDifficulty;
    } else if (typeMatch) {
      explicitType = typeMatch[1].toUpperCase() as typeof explicitType;
    } else if (marksMatch) {
      explicitMarks = Number(marksMatch[1]);
    } else if (answerMatch) {
      correctLetters = answerMatch[1].split(",").map((l) => l.trim().toUpperCase());
    } else if (options.length === 0) {
      textLines.push(trimmed);
    }
  }

  correctLetters.forEach((letter) => {
    const idx = letter.charCodeAt(0) - "A".charCodeAt(0);
    if (options[idx]) options[idx].isCorrect = true;
  });

  const hasOptions = options.length >= 2;
  const questionType =
    explicitType ??
    (hasOptions ? (correctLetters.length > 1 ? "MULTI_SELECT" : "MCQ") : inferSubjectiveType(textLines.join(" ")));

  const rawSubject = explicitSubject ?? "General";

  return {
    tempId: randomUUID(),
    questionText: textLines.join(" ").trim(),
    questionType,
    subject: matchSubjectToExisting(rawSubject, existingSubjects),
    difficultyLevel: explicitDifficulty ?? DEFAULT_DIFFICULTY,
    marks: explicitMarks ?? DEFAULT_MARKS,
    negativeMarks: 0,
    options: hasOptions ? options : undefined,
    sourceExcerpt: block.trim(),
  };
}

function inferSubjectiveType(text: string): "SHORT_ANSWER" | "LONG_ANSWER" {
  const wordCount = text.trim().split(/\s+/).length;
  return wordCount > SHORT_ANSWER_WORD_LIMIT ? "LONG_ANSWER" : "SHORT_ANSWER";
}

export function parseRawTextToDrafts(rawText: string, existingSubjects: string[]): DraftQuestion[] {
  const blocks = splitIntoQuestionBlocks(rawText);
  return blocks.map((block) => parseBlock(block, existingSubjects));
}