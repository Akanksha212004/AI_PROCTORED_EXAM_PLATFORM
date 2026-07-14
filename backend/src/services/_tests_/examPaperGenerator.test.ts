// src/services/__tests__/examPaperGenerator.test.ts
import { describe, expect, it } from "vitest";
import { generateSessionPaper, type PaperGenerationInput } from "../examPaperGenerator";

function makeCandidates(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}`, marks: 2 }));
}

const baseInput: PaperGenerationInput = {
  examId: "exam-1",
  studentId: "student-1",
  randomizationMode: "PER_STUDENT_UNIQUE",
  poolQuestions: [],
  rules: [{ count: 5, candidates: makeCandidates("q", 30) }],
};

describe("generateSessionPaper determinism", () => {
  it("returns an IDENTICAL question set/order for the same studentId + examId on repeated calls", () => {
    const first = generateSessionPaper(baseInput);
    const second = generateSessionPaper(baseInput);
    expect(second).toEqual(first);
  });

  it("returns a DIFFERENT order/selection for a different studentId against the same exam", () => {
    const forStudentA = generateSessionPaper(baseInput);
    const forStudentB = generateSessionPaper({ ...baseInput, studentId: "student-2" });
    // With a 30-question pool sampled down to 5, an exact collision is
    // statistically implausible — asserting inequality is safe.
    expect(forStudentB).not.toEqual(forStudentA);
  });

  it("FIXED mode gives every student the same set AND order", () => {
    const input: PaperGenerationInput = { ...baseInput, randomizationMode: "FIXED" };
    const forStudentA = generateSessionPaper({ ...input, studentId: "student-1" });
    const forStudentB = generateSessionPaper({ ...input, studentId: "student-2" });
    expect(forStudentB).toEqual(forStudentA);
  });

  it("SHUFFLED_ORDER gives the same question SET but can differ in order", () => {
    const input: PaperGenerationInput = { ...baseInput, randomizationMode: "SHUFFLED_ORDER" };
    const forStudentA = generateSessionPaper({ ...input, studentId: "student-1" });
    const forStudentB = generateSessionPaper({ ...input, studentId: "student-2" });

    const idsA = new Set(forStudentA.map((q) => q.questionId));
    const idsB = new Set(forStudentB.map((q) => q.questionId));
    expect(idsA).toEqual(idsB); // same set

    const orderA = forStudentA.map((q) => q.questionId).join(",");
    const orderB = forStudentB.map((q) => q.questionId).join(",");
    expect(orderA).not.toEqual(orderB); // different order (statistically)
  });

  it("always includes curated pool questions in full, regardless of rules", () => {
    const input: PaperGenerationInput = {
      ...baseInput,
      poolQuestions: [
        { questionId: "pool-1", marksOverride: 10, marks: 5 },
        { questionId: "pool-2", marksOverride: null, marks: 4 },
      ],
    };
    const paper = generateSessionPaper(input);
    const poolIds = paper.filter((p) => p.questionId.startsWith("pool-"));
    expect(poolIds).toHaveLength(2);
    expect(poolIds.find((p) => p.questionId === "pool-1")?.marksAllocated).toBe(10); // override applied
    expect(poolIds.find((p) => p.questionId === "pool-2")?.marksAllocated).toBe(4); // falls back to question.marks
  });

  it("never double-picks a question already in the curated pool", () => {
    const shared = makeCandidates("q", 10);
    const input: PaperGenerationInput = {
      examId: "exam-1",
      studentId: "student-1",
      randomizationMode: "PER_STUDENT_UNIQUE",
      poolQuestions: [{ questionId: shared[0].id, marksOverride: null, marks: shared[0].marks }],
      rules: [{ count: 10, candidates: shared }], // asks for all 10, but 1 is already in the pool
    };
    const paper = generateSessionPaper(input);
    const ids = paper.map((p) => p.questionId);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
    expect(ids).toHaveLength(10); // pool's 1 + rule's remaining 9
  });
});
