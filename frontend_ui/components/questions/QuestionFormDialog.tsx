"use client";

import { Plus, Trash2, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { questionService } from "@/services/questionService";
import { extractQuestionErrorMessage } from "@/lib/questionErrors";
import {
    DIFFICULTY_LEVELS,
    QUESTION_TYPES,
    type DifficultyLevel,
    type Question,
    type QuestionFormPayload,
    type QuestionOption,
    type QuestionType,
} from "@/types/question";
import { questionTypeLabel } from "@/components/ui/Badge";

import { getFileUrl } from "@/lib/utils";

interface Props {
    open: boolean;
    mode: "create" | "edit";
    initialQuestion?: Question | null;
    onClose: () => void;
    onSaved: () => void;
}

interface FormState {
    questionText: string;
    subject: string;
    questionType: QuestionType;
    difficultyLevel: DifficultyLevel;
    marks: string;
    negativeMarks: string;
    options: QuestionOption[];
    modelAnswerText: string;
}

const EMPTY_FORM: FormState = {
    questionText: "",
    subject: "",
    questionType: "MCQ",
    difficultyLevel: "MEDIUM",
    marks: "1",
    negativeMarks: "0",
    options: [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
    ],
    modelAnswerText: "",
};

function questionToForm(q: Question): FormState {
    return {
        questionText: q.questionText,
        subject: q.subject,
        questionType: q.questionType,
        difficultyLevel: q.difficultyLevel,
        marks: String(q.marks),
        negativeMarks: String(q.negativeMarks),
        options:
            q.options.length > 0
                ? q.options
                : [
                    { optionText: "", isCorrect: true },
                    { optionText: "", isCorrect: false },
                ],
        modelAnswerText: q.modelAnswerText ?? "",
    };
}

const OPTION_BEARING = ["MCQ", "MULTI_SELECT"];
const TEXT_ANSWER = ["SHORT_ANSWER", "LONG_ANSWER"];

/**
 * Resolves the backend's *origin* (protocol + host + port) from
 * NEXT_PUBLIC_API_BASE_URL, regardless of whatever path suffix that
 * env var carries (e.g. "/api/v1"). Uploaded files are served as static
 * assets directly off the backend origin (e.g. "/uploads/..."), not
 * under the API path prefix, so we can't just concatenate the raw env
 * value with the file path — we need the origin on its own.
 *
 * Using the URL API here (instead of a regex string-strip) means this
 * keeps working correctly no matter what the API base path looks like
 * (/api/v1, /api/v2, no path at all, trailing slash or not, etc.).
 */
function resolveBackendOrigin(): string {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) return "";
    try {
        return new URL(base).origin;
    } catch {
        // Malformed env value — fail safe rather than building a broken URL.
        return "";
    }
}

export function QuestionFormDialog({ open, mode, initialQuestion, onClose, onSaved }: Props) {
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null | undefined>(null);

    const fileUrl = uploadedFileUrl
        ? `${resolveBackendOrigin()}${uploadedFileUrl}`
        : null;

    useEffect(() => {
        if (open) {
            setForm(initialQuestion ? questionToForm(initialQuestion) : EMPTY_FORM);
            setErrors({});
            setSelectedFile(null);
            setUploadedFileUrl(initialQuestion?.modelAnswerFileUrl ?? null);
        }
    }, [open, initialQuestion]);

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    function handleTypeChange(type: QuestionType) {
        setForm((f) => ({
            ...f,
            questionType: type,
            options: OPTION_BEARING.includes(type)
                ? f.options.length >= 2
                    ? f.options
                    : [
                        { optionText: "", isCorrect: true },
                        { optionText: "", isCorrect: false },
                    ]
                : f.options,
        }));
    }

    function updateOption(index: number, patch: Partial<QuestionOption>) {
        setForm((f) => ({
            ...f,
            options: f.options.map((o, i) => (i === index ? { ...o, ...patch } : o)),
        }));
    }

    function toggleCorrect(index: number) {
        setForm((f) => ({
            ...f,
            options: f.options.map((o, i) =>
                f.questionType === "MCQ"
                    ? { ...o, isCorrect: i === index } // radio behaviour: only one true
                    : i === index
                        ? { ...o, isCorrect: !o.isCorrect } // checkbox behaviour
                        : o
            ),
        }));
    }

    function addOption() {
        setForm((f) => ({ ...f, options: [...f.options, { optionText: "", isCorrect: false }] }));
    }

    function removeOption(index: number) {
        setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) }));
    }

    /** Mirrors the backend's zod cross-field rules so users get instant feedback. */
    function validate(): boolean {
        const next: Record<string, string> = {};

        if (!form.questionText.trim()) next.questionText = "Question text is required";
        if (!form.subject.trim()) next.subject = "Subject is required";

        const marksNum = Number(form.marks);
        if (!Number.isInteger(marksNum) || marksNum <= 0) next.marks = "Marks must be a positive integer";

        const negMarksNum = Number(form.negativeMarks);
        if (Number.isNaN(negMarksNum) || negMarksNum < 0) next.negativeMarks = "Cannot be negative";

        if (OPTION_BEARING.includes(form.questionType)) {
            const filled = form.options.filter((o) => o.optionText.trim());
            if (filled.length < 2) next.options = `${questionTypeLabel(form.questionType)} requires at least 2 options`;
            const correctCount = filled.filter((o) => o.isCorrect).length;
            if (form.questionType === "MCQ" && correctCount !== 1) {
                next.options = "MCQ must have exactly one correct option";
            }
            if (form.questionType === "MULTI_SELECT" && correctCount < 1) {
                next.options = "Select at least one correct option";
            }
        }

        if (TEXT_ANSWER.includes(form.questionType) && !form.modelAnswerText.trim()) {
            next.modelAnswerText = "Model answer is required for this question type";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleUploadNow(questionId: string) {
        if (!selectedFile) return;
        setIsUploadingFile(true);
        try {
            const updated = await questionService.uploadModelAnswer(questionId, selectedFile);
            setUploadedFileUrl(updated.modelAnswerFileUrl);
            setSelectedFile(null);
            toast.success("Reference solution uploaded");
        } catch (err) {
            toast.error(extractQuestionErrorMessage(err));
        } finally {
            setIsUploadingFile(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        const payload: QuestionFormPayload = {
            questionText: form.questionText.trim(),
            subject: form.subject.trim(),
            questionType: form.questionType,
            difficultyLevel: form.difficultyLevel,
            marks: Number(form.marks),
            negativeMarks: Number(form.negativeMarks),
        };

        if (OPTION_BEARING.includes(form.questionType)) {
            payload.options = form.options.filter((o) => o.optionText.trim());
        }
        if (TEXT_ANSWER.includes(form.questionType)) {
            payload.modelAnswerText = form.modelAnswerText.trim();
        }

        setIsSaving(true);
        try {
            if (mode === "create") {
                const created = await questionService.create(payload);
                toast.success("Question created");
                if (form.questionType === "IMAGE_UPLOAD" && selectedFile) {
                    await questionService.uploadModelAnswer(created.id, selectedFile);
                    toast.success("Reference solution uploaded");
                }
            } else if (initialQuestion) {
                await questionService.update(initialQuestion.id, payload);
                toast.success("Question updated");
            }
            onSaved();
            onClose();
        } catch (err) {
            toast.error(extractQuestionErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={mode === "create" ? "Create Question" : "Edit Question"}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <Textarea
                    label="Question Text"
                    value={form.questionText}
                    onChange={(e) => setField("questionText", e.target.value)}
                    error={errors.questionText}
                    rows={3}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Subject"
                        value={form.subject}
                        onChange={(e) => setField("subject", e.target.value)}
                        error={errors.subject}
                        placeholder="e.g. Data Structures"
                    />
                    <Select
                        label="Question Type"
                        value={form.questionType}
                        onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                    >
                        {QUESTION_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {questionTypeLabel(t)}
                            </option>
                        ))}
                    </Select>
                    <Select
                        label="Difficulty Level"
                        value={form.difficultyLevel}
                        onChange={(e) => setField("difficultyLevel", e.target.value as DifficultyLevel)}
                    >
                        {DIFFICULTY_LEVELS.map((d) => (
                            <option key={d} value={d}>
                                {d.charAt(0) + d.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </Select>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Marks"
                            type="number"
                            min={1}
                            value={form.marks}
                            onChange={(e) => setField("marks", e.target.value)}
                            error={errors.marks}
                        />
                        <Input
                            label="Negative Marks"
                            type="number"
                            min={0}
                            step="0.5"
                            value={form.negativeMarks}
                            onChange={(e) => setField("negativeMarks", e.target.value)}
                            error={errors.negativeMarks}
                        />
                    </div>
                </div>

                {/* ── Dynamic section, based on questionType ── */}

                {OPTION_BEARING.includes(form.questionType) && (
                    <div className="rounded-xl border border-border p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-medium text-paper">
                                {form.questionType === "MCQ" ? "Options (select the one correct answer)" : "Options (select all correct answers)"}
                            </p>
                            <button
                                type="button"
                                onClick={addOption}
                                className="flex items-center gap-1 text-xs font-medium text-accent-sky hover:text-accent-skyHover"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add option
                            </button>
                        </div>

                        <div className="space-y-2">
                            {form.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleCorrect(i)}
                                        aria-label={opt.isCorrect ? "Marked correct" : "Mark as correct"}
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${opt.isCorrect
                                                ? "border-accent-teal bg-accent-teal/15 text-accent-teal"
                                                : "border-border text-muted hover:bg-white/5"
                                            } ${form.questionType === "MCQ" ? "rounded-full" : "rounded-lg"}`}
                                    >
                                        {opt.isCorrect ? "✓" : ""}
                                    </button>
                                    <input
                                        value={opt.optionText}
                                        onChange={(e) => updateOption(i, { optionText: e.target.value })}
                                        placeholder={`Option ${i + 1}`}
                                        className="h-9 flex-1 rounded-lg border border-border bg-surface-muted px-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
                                    />
                                    {form.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(i)}
                                            aria-label="Remove option"
                                            className="rounded-md p-2 text-muted hover:bg-white/5 hover:text-accent-rose"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.options && <p className="mt-2 text-xs font-medium text-accent-rose">{errors.options}</p>}
                    </div>
                )}

                {form.questionType === "SHORT_ANSWER" && (
                    <Textarea
                        label="Model Answer"
                        value={form.modelAnswerText}
                        onChange={(e) => setField("modelAnswerText", e.target.value)}
                        error={errors.modelAnswerText}
                        rows={2}
                        hint="Used by the AI auto-evaluator and shown to examiners during review."
                    />
                )}

                {form.questionType === "LONG_ANSWER" && (
                    <Textarea
                        label="Model Answer"
                        value={form.modelAnswerText}
                        onChange={(e) => setField("modelAnswerText", e.target.value)}
                        error={errors.modelAnswerText}
                        rows={6}
                        hint="Plain text for now — a rich-text editor wasn't already in this project's dependencies, so one wasn't added per the 'no new libraries' constraint. Say the word and I'll wire one in."
                    />
                )}

                {form.questionType === "IMAGE_UPLOAD" && (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-muted" />
                        <p className="mt-2 text-sm text-paper">Reference solution upload</p>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
                            Upload the examiner-provided reference solution (image or PDF). Students never see this file.
                        </p>

                        {uploadedFileUrl && !selectedFile && (
                            <a
                                href={getFileUrl(uploadedFileUrl) ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block text-xs font-medium text-accent-sky underline underline-offset-4"
                            >
                                View current reference solution
                            </a>
                        )}

                        <div className="mt-4 flex flex-col items-center gap-3">
                            <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-paper transition-colors hover:bg-white/5">
                                {selectedFile ? selectedFile.name : "Choose file"}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,application/pdf"
                                    className="hidden"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                />
                            </label>

                            {mode === "edit" && initialQuestion && selectedFile && (
                                <Button
                                    type="button"
                                    isLoading={isUploadingFile}
                                    onClick={() => handleUploadNow(initialQuestion.id)}
                                    className="w-auto px-4"
                                >
                                    Upload now
                                </Button>
                            )}

                            {mode === "create" && selectedFile && (
                                <p className="text-xs text-muted">
                                    This file uploads automatically once you click &quot;Create Question&quot; below.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-border pt-5">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto px-4">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSaving} className="w-auto px-5">
                        {mode === "create" ? "Create Question" : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
