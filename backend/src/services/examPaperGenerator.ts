// src/services/examPaperGenerator.ts
//
// PURE function — no Prisma, no I/O. This is deliberately separated
// from examSession.service.ts so it can be unit-tested directly (per
// the doc's "randomized paper generation determinism" requirement)
// without a database.
//
// RandomizationMode semantics:
//   FIXED              -> same question SET, same ORDER, for every student
//   SHUFFLED_ORDER      -> same question SET, ORDER shuffled per student
//   PER_STUDENT_UNIQUE  -> question SET itself may differ per student
//                          (each selection-rule samples independently
//                          per student), order also shuffled per student
//
// Determinism: seed is derived from studentId + examId (+ a per-rule
// offset), so calling this twice with identical inputs always returns
// an identical array; a different studentId almost always returns a
// different order (and, in PER_STUDENT_UNIQUE mode, likely a different
// selection too, given a reasonably-sized candidate pool).

import type { RandomizationMode } from "@prisma/client";
import { hashStringToSeed, seededPick, seededShuffle } from "../utils/seededRandom";

export interface CandidateQuestion {
  id: string;
  marks: number;
}

export interface RuleWithCandidates {
  count: number;
  candidates: CandidateQuestion[];
}

export interface PoolQuestion {
  questionId: string;
  marksOverride: number | null;
  marks: number;
}

export interface PaperGenerationInput {
  examId: string;
  studentId: string;
  randomizationMode: RandomizationMode;
  poolQuestions: PoolQuestion[];
  rules: RuleWithCandidates[];
}

export interface GeneratedPaperItem {
  questionId: string;
  marksAllocated: number;
}

export function generateSessionPaper(input: PaperGenerationInput): GeneratedPaperItem[] {
  const { examId, studentId, randomizationMode, poolQuestions, rules } = input;

  // Curated pool questions are always included, in full.
  const poolItems: GeneratedPaperItem[] = poolQuestions.map((p) => ({
    questionId: p.questionId,
    marksAllocated: p.marksOverride ?? p.marks,
  }));
  const usedIds = new Set(poolItems.map((p) => p.questionId));

  // Which questions get selected per rule: examId-only seed for FIXED
  // and SHUFFLED_ORDER (same set for everyone), studentId+examId seed
  // for PER_STUDENT_UNIQUE (each student samples independently).
  const selectionSeed =
    randomizationMode === "PER_STUDENT_UNIQUE"
      ? hashStringToSeed(`${studentId}:${examId}:select`)
      : hashStringToSeed(`${examId}:select`);

  const ruleItems: GeneratedPaperItem[] = [];
  rules.forEach((rule, index) => {
    const available = rule.candidates.filter((c) => !usedIds.has(c.id));
    const picked = seededPick(available, rule.count, selectionSeed + index);
    picked.forEach((q) => {
      usedIds.add(q.id);
      ruleItems.push({ questionId: q.id, marksAllocated: q.marks });
    });
  });

  const combined = [...poolItems, ...ruleItems];

  if (randomizationMode === "FIXED") {
    return combined; // same set AND order for everyone — no shuffle
  }

  // SHUFFLED_ORDER and PER_STUDENT_UNIQUE both shuffle final order
  // per-student (their question SETS may or may not differ, per above).
  const orderSeed = hashStringToSeed(`${studentId}:${examId}:order`);
  return seededShuffle(combined, orderSeed);
}
