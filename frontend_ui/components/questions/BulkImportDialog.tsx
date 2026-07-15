"use client";

import { Loader2, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Card";
import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
import { questionService } from "@/services/questionService";
import { extractQuestionErrorMessage } from "@/lib/questionErrors";
import { DIFFICULTY_LEVELS } from "@/types/question";
import type { DifficultyLevel, QuestionFormPayload, QuestionOption, QuestionType } from "@/types/question";
import type { DraftQuestion } from "@/types/bulkImport";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

// Bulk-import review only supports question types the text parser can
// actually produce and that don't require a per-question file upload.
// IMAGE_UPLOAD questions need an attached reference file per question
// (see attachModelAnswer), which has no equivalent in a parsed
// PDF/DOCX — so it's intentionally left out of this dropdown to avoid
// letting an examiner switch a draft into an unsavable state.
const REVIEW_QUESTION_TYPES: QuestionType[] = ["MCQ", "MULTI_SELECT", "SHORT_ANSWER", "LONG_ANSWER"];

const OPTION_BEARING = new Set<QuestionType>(["MCQ", "MULTI_SELECT"]);
const TEXT_ANSWER = new Set<QuestionType>(["SHORT_ANSWER", "LONG_ANSWER"]);

type Step = "upload" | "review";

function emptyOption(): QuestionOption {
  return { optionText: "", isCorrect: false };
}

export function BulkImportDialog({ open, onClose, onImported }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setDrafts([]);
    setIsParsing(false);
    setIsSaving(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFileSelected(file: File) {
    const validExt = /\.(pdf|docx)$/i.test(file.name);
    if (!validExt) {
      toast.error("Only PDF or DOCX files are supported");
      return;
    }
    setIsParsing(true);
    try {
      const parsed = await questionService.bulkImportParse(file);
      if (parsed.length === 0) {
        toast.error("No questions could be identified in this file");
        return;
      }
      setDrafts(parsed);
      setStep("review");
      toast.success(`Found ${parsed.length} question(s) — review before saving`);
    } catch (err) {
      toast.error(extractQuestionErrorMessage(err));
    } finally {
      setIsParsing(false);
    }
  }

  function updateDraft(tempId: string, patch: Partial<DraftQuestion>) {
    setDrafts((prev) => prev.map((d) => (d.tempId === tempId ? { ...d, ...patch } : d)));
  }

  function removeDraft(tempId: string) {
    setDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
  }

  function handleTypeChange(tempId: string, nextType: QuestionType) {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.tempId !== tempId) return d;
        const patch: Partial<DraftQuestion> = { questionType: nextType };
        if (OPTION_BEARING.has(nextType) && (!d.options || d.options.length < 2)) {
          patch.options = [emptyOption(), emptyOption()];
        }
        if (!OPTION_BEARING.has(nextType)) {
          patch.options = undefined;
        }
        return { ...d, ...patch };
      })
    );
  }

  function updateOption(tempId: string, index: number, patch: Partial<QuestionOption>) {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.tempId !== tempId || !d.options) return d;
        const options = d.options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt));
        return { ...d, options };
      })
    );
  }

  function setSingleCorrectOption(tempId: string, index: number) {
    // MCQ: exactly one correct — selecting one clears the rest.
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.tempId !== tempId || !d.options) return d;
        const options = d.options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
        return { ...d, options };
      })
    );
  }

  function addOption(tempId: string) {
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, options: [...(d.options ?? []), emptyOption()] } : d))
    );
  }

  function removeOption(tempId: string, index: number) {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.tempId !== tempId || !d.options) return d;
        return { ...d, options: d.options.filter((_, i) => i !== index) };
      })
    );
  }

  function validateDrafts(): string | null {
    for (const [i, d] of drafts.entries()) {
      if (!d.questionText.trim()) return `Question ${i + 1}: question text is required`;
      if (!d.subject.trim()) return `Question ${i + 1}: subject is required`;
      if (OPTION_BEARING.has(d.questionType)) {
        const opts = d.options ?? [];
        if (opts.length < 2) return `Question ${i + 1}: needs at least 2 options`;
        if (opts.some((o) => !o.optionText.trim())) return `Question ${i + 1}: all options need text`;
        const correctCount = opts.filter((o) => o.isCorrect).length;
        if (d.questionType === "MCQ" && correctCount !== 1)
          return `Question ${i + 1}: MCQ needs exactly one correct option`;
        if (d.questionType === "MULTI_SELECT" && correctCount < 1)
          return `Question ${i + 1}: needs at least one correct option`;
      }
      if (TEXT_ANSWER.has(d.questionType) && !d.modelAnswerText?.trim()) {
        return `Question ${i + 1}: model answer text is required for ${questionTypeLabel(d.questionType)}`;
      }
    }
    return null;
  }

  async function handleConfirm() {
    if (drafts.length === 0) {
      toast.error("No questions left to import");
      return;
    }
    const validationError = validateDrafts();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: QuestionFormPayload[] = drafts.map((d) => ({
      questionText: d.questionText.trim(),
      questionType: d.questionType,
      subject: d.subject.trim(),
      difficultyLevel: d.difficultyLevel,
      marks: d.marks,
      negativeMarks: d.negativeMarks,
      options: OPTION_BEARING.has(d.questionType) ? d.options : undefined,
      modelAnswerText: TEXT_ANSWER.has(d.questionType) ? d.modelAnswerText?.trim() : undefined,
    }));

    setIsSaving(true);
    try {
      const saved = await questionService.bulkImportConfirm(payload);
      toast.success(`Imported ${saved.length} question(s) into the Question Bank`);
      onImported();
      handleClose();
    } catch (err) {
      toast.error(extractQuestionErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={step === "upload" ? "Bulk Import Questions" : `Review ${drafts.length} Question(s)`}
      description={
        step === "upload"
          ? "Upload a PDF or DOCX file of questions to auto-generate drafts."
          : "Nothing is saved yet — edit, remove, then confirm to add these to the Question Bank."
      }
      size="lg"
    >
      {step === "upload" && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface-muted/40 px-6 py-12 text-center transition-colors hover:border-accent-sky/50 hover:bg-surface-muted disabled:opacity-60"
          >
            {isParsing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-accent-sky" />
                <p className="text-sm text-paper">Parsing file...</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-muted" />
                <div>
                  <p className="text-sm font-medium text-paper">Click to upload PDF or DOCX</p>
                  <p className="mt-1 text-xs text-muted">
                    Questions are best-guess parsed — you'll review and edit every field before saving.
                  </p>
                </div>
              </>
            )}
          </button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
            {drafts.map((d, i) => (
              <div key={d.tempId} className="space-y-3 rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">Q{i + 1}</Badge>
                    <Badge tone="sky">{questionTypeLabel(d.questionType)}</Badge>
                    <Badge tone={difficultyTone(d.difficultyLevel)}>
                      {d.difficultyLevel.charAt(0) + d.difficultyLevel.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <button
                    onClick={() => removeDraft(d.tempId)}
                    aria-label="Discard this question"
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="text-xs text-muted">Question text</label>
                  <textarea
                    value={d.questionText}
                    onChange={(e) => updateDraft(d.tempId, { questionText: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Input
                    label="Subject"
                    value={d.subject}
                    onChange={(e) => updateDraft(d.tempId, { subject: e.target.value })}
                  />
                  <Select
                    label="Type"
                    value={d.questionType}
                    onChange={(e) => handleTypeChange(d.tempId, e.target.value as QuestionType)}
                  >
                    {REVIEW_QUESTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {questionTypeLabel(t)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Difficulty"
                    value={d.difficultyLevel}
                    onChange={(e) =>
                      updateDraft(d.tempId, { difficultyLevel: e.target.value as DifficultyLevel })
                    }
                  >
                    {DIFFICULTY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Marks"
                      type="number"
                      min={1}
                      value={d.marks}
                      onChange={(e) => updateDraft(d.tempId, { marks: Number(e.target.value) })}
                    />
                    <Input
                      label="Neg. marks"
                      type="number"
                      min={0}
                      value={d.negativeMarks}
                      onChange={(e) => updateDraft(d.tempId, { negativeMarks: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {OPTION_BEARING.has(d.questionType) && (
                  <div className="space-y-2">
                    <label className="text-xs text-muted">
                      Options {d.questionType === "MCQ" ? "(select the one correct answer)" : "(check all correct answers)"}
                    </label>
                    {(d.options ?? []).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type={d.questionType === "MCQ" ? "radio" : "checkbox"}
                          checked={opt.isCorrect}
                          onChange={() =>
                            d.questionType === "MCQ"
                              ? setSingleCorrectOption(d.tempId, oi)
                              : updateOption(d.tempId, oi, { isCorrect: !opt.isCorrect })
                          }
                          className="h-4 w-4 shrink-0 accent-accent-teal"
                        />
                        <input
                          value={opt.optionText}
                          onChange={(e) => updateOption(d.tempId, oi, { optionText: e.target.value })}
                          placeholder={`Option ${oi + 1}`}
                          className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
                        />
                        <button
                          onClick={() => removeOption(d.tempId, oi)}
                          aria-label="Remove option"
                          className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(d.tempId)}
                      className="flex items-center gap-1 text-xs text-accent-sky hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add option
                    </button>
                  </div>
                )}

                {TEXT_ANSWER.has(d.questionType) && (
                  <div>
                    <label className="text-xs text-muted">Model answer (required)</label>
                    <textarea
                      value={d.modelAnswerText ?? ""}
                      onChange={(e) => updateDraft(d.tempId, { modelAnswerText: e.target.value })}
                      rows={2}
                      placeholder="Reference answer for grading..."
                      className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
            {drafts.length === 0 && (
              <p className="py-10 text-center text-sm text-muted">
                All questions discarded. Go back and upload another file, or close this dialog.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="secondary" onClick={() => setStep("upload")} className="w-auto px-4">
              Upload different file
            </Button>
            <Button
              onClick={handleConfirm}
              isLoading={isSaving}
              disabled={drafts.length === 0}
              className="w-auto bg-accent-teal px-5 hover:bg-accent-teal/90"
            >
              Import {drafts.length > 0 ? `${drafts.length} ` : ""}Question(s)
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
