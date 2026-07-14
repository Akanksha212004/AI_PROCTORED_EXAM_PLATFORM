// // "use client";

// // import { Plus, Trash2, Search, X } from "lucide-react";
// // import { useEffect, useState } from "react";
// // import toast from "react-hot-toast";

// // import { Dialog } from "@/components/ui/Dialog";
// // import { Button } from "@/components/ui/Button";
// // import { Input } from "@/components/ui/Input";
// // import { Select } from "@/components/ui/Card";
// // import { examService } from "@/services/examService";
// // import { questionService } from "@/services/questionService";
// // import { extractExamErrorMessage } from "@/components/exams/examErrors";
// // import {
// //   GAZE_SENSITIVITIES,
// //   RANDOMIZATION_MODES,
// //   type Exam,
// //   type ExamFormPayload,
// //   type GazeSensitivity,
// //   type PoolQuestionRef,
// //   type RandomizationMode,
// //   type SelectionRule,
// // } from "@/types/exam";
// // import { DIFFICULTY_LEVELS, QUESTION_TYPES, type Question } from "@/types/question";
// // import { questionTypeLabel } from "@/components/ui/Badge";

// // interface Props {
// //   open: boolean;
// //   mode: "create" | "edit";
// //   initialExam?: Exam | null;
// //   onClose: () => void;
// //   onSaved: () => void;
// // }

// // interface FormState {
// //   title: string;
// //   subject: string;
// //   durationMinutes: string;
// //   startTime: string; // datetime-local string
// //   endTime: string;
// //   randomizationMode: RandomizationMode;
// //   negativeMarkingEnabled: boolean;
// //   webcamMonitoringEnabled: boolean;
// //   fullScreenModeEnabled: boolean;
// //   multiFaceDetectionEnabled: boolean;
// //   gazeSensitivity: GazeSensitivity;
// //   maxTabSwitchWarnings: string;
// // }

// // const EMPTY_FORM: FormState = {
// //   title: "",
// //   subject: "",
// //   durationMinutes: "60",
// //   startTime: "",
// //   endTime: "",
// //   randomizationMode: "PER_STUDENT_UNIQUE",
// //   negativeMarkingEnabled: true,
// //   webcamMonitoringEnabled: true,
// //   multiFaceDetectionEnabled: true,
// //   fullScreenModeEnabled: true,
// //   gazeSensitivity: "MEDIUM",
// //   maxTabSwitchWarnings: "3",
// // };

// // /** Converts an ISO string to the value <input type="datetime-local"> expects. */
// // function toDatetimeLocal(iso: string): string {
// //   const d = new Date(iso);
// //   const pad = (n: number) => String(n).padStart(2, "0");
// //   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// // }

// // function examToForm(e: Exam): FormState {
// //   return {
// //     title: e.title,
// //     subject: e.subject,
// //     durationMinutes: String(e.durationMinutes),
// //     startTime: toDatetimeLocal(e.startTime),
// //     endTime: toDatetimeLocal(e.endTime),
// //     randomizationMode: e.randomizationMode,
// //     negativeMarkingEnabled: e.negativeMarkingEnabled,
// //     webcamMonitoringEnabled: e.webcamMonitoringEnabled,
// //     multiFaceDetectionEnabled: e.multiFaceDetectionEnabled,
// //     fullScreenModeEnabled: e.fullScreenModeEnabled,
// //     gazeSensitivity: e.gazeSensitivity,
// //     maxTabSwitchWarnings: String(e.maxTabSwitchWarnings),
// //   };
// // }

// // export function ExamFormDialog({ open, mode, initialExam, onClose, onSaved }: Props) {
// //   const [form, setForm] = useState<FormState>(EMPTY_FORM);
// //   const [errors, setErrors] = useState<Record<string, string>>({});
// //   const [isSaving, setIsSaving] = useState(false);

// //   const [rules, setRules] = useState<SelectionRule[]>([]);

// //   // Create mode: locally staged picks, sent with the create payload.
// //   const [stagedQuestions, setStagedQuestions] = useState<Question[]>([]);
// //   // Edit mode: the exam's current pool (from the server), mutated via
// //   // immediate add/remove API calls since pool management is incremental.
// //   const [currentPool, setCurrentPool] = useState<PoolQuestionRef[]>([]);

// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [searchResults, setSearchResults] = useState<Question[]>([]);
// //   const [isSearching, setIsSearching] = useState(false);
// //   const [isMutatingPool, setIsMutatingPool] = useState(false);

// //   useEffect(() => {
// //     if (!open) return;
// //     setForm(initialExam ? examToForm(initialExam) : EMPTY_FORM);
// //     setRules(initialExam?.selectionRules ?? []);
// //     setCurrentPool(initialExam?.examQuestions ?? []);
// //     setStagedQuestions([]);
// //     setSearchTerm("");
// //     setSearchResults([]);
// //     setErrors({});
// //   }, [open, initialExam]);

// //   function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
// //     setForm((f) => ({ ...f, [key]: value }));
// //   }

// //   // ── Selection rules ──
// //   function addRule() {
// //     setRules((r) => [...r, { count: 1 }]);
// //   }
// //   function updateRule(index: number, patch: Partial<SelectionRule>) {
// //     setRules((r) => r.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
// //   }
// //   function removeRule(index: number) {
// //     setRules((r) => r.filter((_, i) => i !== index));
// //   }

// //   // ── Question pool search ──
// //   async function runSearch() {
// //     if (!searchTerm.trim()) {
// //       setSearchResults([]);
// //       return;
// //     }
// //     setIsSearching(true);
// //     try {
// //       const result = await questionService.list({ page: 1, limit: 100 });
// //       const term = searchTerm.trim().toLowerCase();
// //       const alreadyIn = new Set([
// //         ...stagedQuestions.map((q) => q.id),
// //         ...currentPool.map((p) => p.question.id),
// //       ]);
// //       setSearchResults(
// //         result.items.filter((q) => q.questionText.toLowerCase().includes(term) && !alreadyIn.has(q.id))
// //       );
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsSearching(false);
// //     }
// //   }

// //   async function handleAddQuestion(q: Question) {
// //     if (mode === "create") {
// //       setStagedQuestions((s) => [...s, q]);
// //       setSearchResults((r) => r.filter((x) => x.id !== q.id));
// //       return;
// //     }
// //     if (!initialExam) return;
// //     setIsMutatingPool(true);
// //     try {
// //       const updated = await examService.addPoolQuestions(initialExam.id, [q.id]);
// //       setCurrentPool(updated.examQuestions);
// //       setSearchResults((r) => r.filter((x) => x.id !== q.id));
// //       toast.success("Question added to pool");
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsMutatingPool(false);
// //     }
// //   }

// //   async function handleRemoveStaged(questionId: string) {
// //     setStagedQuestions((s) => s.filter((q) => q.id !== questionId));
// //   }

// //   async function handleRemoveFromPool(questionId: string) {
// //     if (!initialExam) return;
// //     setIsMutatingPool(true);
// //     try {
// //       const updated = await examService.removePoolQuestion(initialExam.id, questionId);
// //       setCurrentPool(updated.examQuestions);
// //       toast.success("Question removed from pool");
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsMutatingPool(false);
// //     }
// //   }

// //   function validate(): boolean {
// //     const next: Record<string, string> = {};
// //     if (!form.title.trim()) next.title = "Title is required";
// //     if (!form.subject.trim()) next.subject = "Subject is required";

// //     const duration = Number(form.durationMinutes);
// //     if (!Number.isInteger(duration) || duration <= 0) next.durationMinutes = "Must be a positive integer";

// //     if (!form.startTime) next.startTime = "Start time is required";
// //     if (!form.endTime) next.endTime = "End time is required";
// //     if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
// //       next.endTime = "End time must be after start time";
// //     }

// //     const maxWarnings = Number(form.maxTabSwitchWarnings);
// //     if (!Number.isInteger(maxWarnings) || maxWarnings <= 0) {
// //       next.maxTabSwitchWarnings = "Must be a positive integer";
// //     }

// //     rules.forEach((r, i) => {
// //       if (!Number.isInteger(r.count) || r.count <= 0) {
// //         next[`rule-${i}`] = "Count must be a positive integer";
// //       }
// //     });

// //     setErrors(next);
// //     return Object.keys(next).length === 0;
// //   }

// //   async function handleSubmit(e: React.FormEvent) {
// //     e.preventDefault();
// //     if (!validate()) return;

// //     const payload: ExamFormPayload = {
// //       title: form.title.trim(),
// //       subject: form.subject.trim(),
// //       durationMinutes: Number(form.durationMinutes),
// //       startTime: new Date(form.startTime).toISOString(),
// //       endTime: new Date(form.endTime).toISOString(),
// //       randomizationMode: form.randomizationMode,
// //       negativeMarkingEnabled: form.negativeMarkingEnabled,
// //       webcamMonitoringEnabled: form.webcamMonitoringEnabled,
// //       multiFaceDetectionEnabled: form.multiFaceDetectionEnabled,
// //       fullScreenModeEnabled: form.fullScreenModeEnabled,
// //       gazeSensitivity: form.gazeSensitivity,
// //       maxTabSwitchWarnings: Number(form.maxTabSwitchWarnings),
// //       selectionRules: rules,
// //     };
// //     if (mode === "create" && stagedQuestions.length > 0) {
// //       payload.questionIds = stagedQuestions.map((q) => q.id);
// //     }

// //     setIsSaving(true);
// //     try {
// //       if (mode === "create") {
// //         await examService.create(payload);
// //         toast.success("Exam created");
// //       } else {
// //         await examService.update(initialExam!.id, payload);
// //         toast.success("Exam updated");
// //       }
// //       onSaved();
// //       onClose();
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   }

// //   const poolList: { id: string; label: string; subject: string }[] =
// //     mode === "create"
// //       ? stagedQuestions.map((q) => ({ id: q.id, label: q.questionText, subject: q.subject }))
// //       : currentPool.map((p) => ({ id: p.question.id, label: p.question.questionText, subject: p.question.subject }));

// //   return (
// //     <Dialog open={open} onClose={onClose} title={mode === "create" ? "Create Exam" : "Edit Exam"} size="lg">
// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //           <Input label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} error={errors.title} />
// //           <Input label="Subject" value={form.subject} onChange={(e) => setField("subject", e.target.value)} error={errors.subject} />
// //           <Input
// //             label="Duration (minutes)"
// //             type="number"
// //             min={1}
// //             value={form.durationMinutes}
// //             onChange={(e) => setField("durationMinutes", e.target.value)}
// //             error={errors.durationMinutes}
// //           />
// //           <Select
// //             label="Randomization Mode"
// //             value={form.randomizationMode}
// //             onChange={(e) => setField("randomizationMode", e.target.value as RandomizationMode)}
// //           >
// //             {RANDOMIZATION_MODES.map((m) => (
// //               <option key={m} value={m}>
// //                 {m.replace(/_/g, " ")}
// //               </option>
// //             ))}
// //           </Select>
// //           <Input
// //             label="Start Time"
// //             type="datetime-local"
// //             value={form.startTime}
// //             onChange={(e) => setField("startTime", e.target.value)}
// //             error={errors.startTime}
// //           />
// //           <Input
// //             label="End Time"
// //             type="datetime-local"
// //             value={form.endTime}
// //             onChange={(e) => setField("endTime", e.target.value)}
// //             error={errors.endTime}
// //           />
// //         </div>

// //         {/* ── Proctoring & marking settings ── */}
// //         <div className="rounded-xl border border-border p-4">
// //           <p className="mb-3 text-sm font-medium text-paper">Proctoring & Marking</p>
// //           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.negativeMarkingEnabled}
// //                 onChange={(e) => setField("negativeMarkingEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Negative marking enabled
// //             </label>
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.webcamMonitoringEnabled}
// //                 onChange={(e) => setField("webcamMonitoringEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Webcam monitoring enabled
// //             </label>
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.multiFaceDetectionEnabled}
// //                 onChange={(e) => setField("multiFaceDetectionEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Multi-face detection enabled
// //             </label>
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.fullScreenModeEnabled}
// //                 onChange={(e) => setField("fullScreenModeEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Full-screen mode enforced
// //             </label>

// //             <Select
// //               label="Gaze Sensitivity"
// //               value={form.gazeSensitivity}
// //               onChange={(e) => setField("gazeSensitivity", e.target.value as GazeSensitivity)}
// //             >
// //               {GAZE_SENSITIVITIES.map((g) => (
// //                 <option key={g} value={g}>
// //                   {g.charAt(0) + g.slice(1).toLowerCase()}
// //                 </option>
// //               ))}
// //             </Select>
// //             <Input
// //               label="Max Tab-Switch Warnings"
// //               type="number"
// //               min={1}
// //               value={form.maxTabSwitchWarnings}
// //               onChange={(e) => setField("maxTabSwitchWarnings", e.target.value)}
// //               error={errors.maxTabSwitchWarnings}
// //             />
// //           </div>
// //         </div>

// //         {/* ── Selection rule builder ── */}
// //         <div className="rounded-xl border border-border p-4">
// //           <div className="mb-3 flex items-center justify-between">
// //             <p className="text-sm font-medium text-paper">Auto-Selection Rules</p>
// //             <button
// //               type="button"
// //               onClick={addRule}
// //               className="flex items-center gap-1 text-xs font-medium text-accent-sky hover:text-accent-skyHover"
// //             >
// //               <Plus className="h-3.5 w-3.5" /> Add rule
// //             </button>
// //           </div>
// //           <p className="mb-3 text-xs text-muted">
// //             e.g. &quot;Pick 5 EASY MCQs from Data Structures&quot; — leave any field blank to match any value.
// //           </p>

// //           {rules.length === 0 ? (
// //             <p className="py-3 text-center text-xs text-muted">No rules yet — add one, or use the curated pool below instead.</p>
// //           ) : (
// //             <div className="space-y-2">
// //               {rules.map((rule, i) => (
// //                 <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_1fr_90px_36px]">
// //                   <input
// //                     value={rule.subject ?? ""}
// //                     onChange={(e) => updateRule(i, { subject: e.target.value || undefined })}
// //                     placeholder="Any subject"
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
// //                   />
// //                   <select
// //                     value={rule.questionType ?? ""}
// //                     onChange={(e) => updateRule(i, { questionType: (e.target.value || undefined) as SelectionRule["questionType"] })}
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
// //                   >
// //                     <option value="">Any type</option>
// //                     {QUESTION_TYPES.map((t) => (
// //                       <option key={t} value={t}>
// //                         {questionTypeLabel(t)}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   <select
// //                     value={rule.difficultyLevel ?? ""}
// //                     onChange={(e) => updateRule(i, { difficultyLevel: (e.target.value || undefined) as SelectionRule["difficultyLevel"] })}
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
// //                   >
// //                     <option value="">Any difficulty</option>
// //                     {DIFFICULTY_LEVELS.map((d) => (
// //                       <option key={d} value={d}>
// //                         {d.charAt(0) + d.slice(1).toLowerCase()}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   <input
// //                     type="number"
// //                     min={1}
// //                     value={rule.count}
// //                     onChange={(e) => updateRule(i, { count: Number(e.target.value) })}
// //                     placeholder="Count"
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-3 text-sm text-paper focus:border-accent-sky focus:outline-none"
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => removeRule(i)}
// //                     aria-label="Remove rule"
// //                     className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-white/5 hover:text-accent-rose"
// //                   >
// //                     <Trash2 className="h-4 w-4" />
// //                   </button>
// //                   {errors[`rule-${i}`] && (
// //                     <p className="col-span-full text-xs font-medium text-accent-rose">{errors[`rule-${i}`]}</p>
// //                   )}
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>

// //         {/* ── Curated question pool ── */}
// //         <div className="rounded-xl border border-border p-4">
// //           <p className="mb-3 text-sm font-medium text-paper">Curated Question Pool (optional)</p>

// //           <div className="flex gap-2">
// //             <div className="relative flex-1">
// //               <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
// //               <input
// //                 value={searchTerm}
// //                 onChange={(e) => setSearchTerm(e.target.value)}
// //                 onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())}
// //                 placeholder="Search questions by text..."
// //                 className="h-10 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
// //               />
// //             </div>
// //             <Button type="button" variant="secondary" onClick={runSearch} isLoading={isSearching} className="w-auto px-4">
// //               Search
// //             </Button>
// //           </div>

// //           {searchResults.length > 0 && (
// //             <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
// //               {searchResults.map((q) => (
// //                 <button
// //                   key={q.id}
// //                   type="button"
// //                   onClick={() => handleAddQuestion(q)}
// //                   disabled={isMutatingPool}
// //                   className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm text-paper hover:bg-white/5 disabled:opacity-50"
// //                 >
// //                   <span className="truncate">{q.questionText}</span>
// //                   <span className="shrink-0 text-xs text-muted">{q.subject}</span>
// //                 </button>
// //               ))}
// //             </div>
// //           )}

// //           <div className="mt-3 space-y-1.5">
// //             {poolList.length === 0 ? (
// //               <p className="py-2 text-center text-xs text-muted">No questions added to the curated pool yet.</p>
// //             ) : (
// //               poolList.map((p) => (
// //                 <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
// //                   <span className="truncate text-sm text-paper">{p.label}</span>
// //                   <div className="flex shrink-0 items-center gap-2">
// //                     <span className="text-xs text-muted">{p.subject}</span>
// //                     <button
// //                       type="button"
// //                       onClick={() => (mode === "create" ? handleRemoveStaged(p.id) : handleRemoveFromPool(p.id))}
// //                       disabled={isMutatingPool}
// //                       aria-label="Remove from pool"
// //                       className="rounded-md p-1 text-muted hover:bg-white/5 hover:text-accent-rose disabled:opacity-50"
// //                     >
// //                       <X className="h-3.5 w-3.5" />
// //                     </button>
// //                   </div>
// //                 </div>
// //               ))
// //             )}
// //           </div>

// //           {mode === "edit" && (
// //             <p className="mt-2 text-xs text-muted">
// //               Pool changes here save immediately (not on &quot;Save Changes&quot; below).
// //             </p>
// //           )}
// //         </div>

// //         <div className="flex justify-end gap-3 border-t border-border pt-5">
// //           <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto px-4">
// //             Cancel
// //           </Button>
// //           <Button type="submit" isLoading={isSaving} className="w-auto px-5">
// //             {mode === "create" ? "Create Exam" : "Save Changes"}
// //           </Button>
// //         </div>
// //       </form>
// //     </Dialog>
// //   );
// // }






// // "use client";

// // import { Plus, Trash2, Search, X } from "lucide-react";
// // import { useEffect, useState } from "react";
// // import toast from "react-hot-toast";

// // import { Dialog } from "@/components/ui/Dialog";
// // import { Button } from "@/components/ui/Button";
// // import { Input } from "@/components/ui/Input";
// // import { Select } from "@/components/ui/Card";
// // import { SubjectCombobox } from "@/components/exams/SubjectCombobox";
// // import { examService } from "@/services/examService";
// // import { questionService } from "@/services/questionService";
// // import { useQuestionStats } from "@/hooks/useQuestionStats";
// // import { extractExamErrorMessage } from "@/components/exams/examErrors";
// // import {
// //   GAZE_SENSITIVITIES,
// //   RANDOMIZATION_MODES,
// //   type Exam,
// //   type ExamFormPayload,
// //   type GazeSensitivity,
// //   type PoolQuestionRef,
// //   type RandomizationMode,
// //   type SelectionRule,
// // } from "@/types/exam";
// // import { DIFFICULTY_LEVELS, QUESTION_TYPES, type Question } from "@/types/question";
// // import { questionTypeLabel } from "@/components/ui/Badge";

// // interface Props {
// //   open: boolean;
// //   mode: "create" | "edit";
// //   initialExam?: Exam | null;
// //   onClose: () => void;
// //   onSaved: () => void;
// // }

// // interface FormState {
// //   title: string;
// //   subject: string;
// //   durationMinutes: string;
// //   startTime: string; // datetime-local string
// //   endTime: string;
// //   randomizationMode: RandomizationMode;
// //   negativeMarkingEnabled: boolean;
// //   webcamMonitoringEnabled: boolean;
// //   fullScreenModeEnabled: boolean;
// //   multiFaceDetectionEnabled: boolean;
// //   audioMonitoringEnabled: boolean;
// //   gazeSensitivity: GazeSensitivity;
// //   maxTabSwitchWarnings: string;
// // }

// // const EMPTY_FORM: FormState = {
// //   title: "",
// //   subject: "",
// //   durationMinutes: "60",
// //   startTime: "",
// //   endTime: "",
// //   randomizationMode: "PER_STUDENT_UNIQUE",
// //   negativeMarkingEnabled: true,
// //   webcamMonitoringEnabled: true,
// //   multiFaceDetectionEnabled: true,
// //   fullScreenModeEnabled: true,
// //   audioMonitoringEnabled: false,
// //   gazeSensitivity: "MEDIUM",
// //   maxTabSwitchWarnings: "3",
// // };

// // /** Converts an ISO string to the value <input type="datetime-local"> expects. */
// // function toDatetimeLocal(iso: string): string {
// //   const d = new Date(iso);
// //   const pad = (n: number) => String(n).padStart(2, "0");
// //   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// // }

// // function examToForm(e: Exam): FormState {
// //   return {
// //     title: e.title,
// //     subject: e.subject,
// //     durationMinutes: String(e.durationMinutes),
// //     startTime: toDatetimeLocal(e.startTime),
// //     endTime: toDatetimeLocal(e.endTime),
// //     randomizationMode: e.randomizationMode,
// //     negativeMarkingEnabled: e.negativeMarkingEnabled,
// //     webcamMonitoringEnabled: e.webcamMonitoringEnabled,
// //     multiFaceDetectionEnabled: e.multiFaceDetectionEnabled,
// //     fullScreenModeEnabled: e.fullScreenModeEnabled,
// //     audioMonitoringEnabled: e.audioMonitoringEnabled,
// //     gazeSensitivity: e.gazeSensitivity,
// //     maxTabSwitchWarnings: String(e.maxTabSwitchWarnings),
// //   };
// // }

// // export function ExamFormDialog({ open, mode, initialExam, onClose, onSaved }: Props) {
// //   const [form, setForm] = useState<FormState>(EMPTY_FORM);
// //   const [errors, setErrors] = useState<Record<string, string>>({});
// //   const [isSaving, setIsSaving] = useState(false);

// //   // Reused from the Question Bank module (same source the Question
// //   // Bank subject filter dropdown uses) — no duplicate subject query.
// //   const { stats: questionStats } = useQuestionStats();
// //   const subjectOptions = questionStats?.subjects ?? [];

// //   const [rules, setRules] = useState<SelectionRule[]>([]);

// //   const [stagedQuestions, setStagedQuestions] = useState<Question[]>([]);
// //   const [currentPool, setCurrentPool] = useState<PoolQuestionRef[]>([]);

// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [searchResults, setSearchResults] = useState<Question[]>([]);
// //   const [isSearching, setIsSearching] = useState(false);
// //   const [isMutatingPool, setIsMutatingPool] = useState(false);

// //   useEffect(() => {
// //     if (!open) return;
// //     setForm(initialExam ? examToForm(initialExam) : EMPTY_FORM);
// //     setRules(initialExam?.selectionRules ?? []);
// //     setCurrentPool(initialExam?.examQuestions ?? []);
// //     setStagedQuestions([]);
// //     setSearchTerm("");
// //     setSearchResults([]);
// //     setErrors({});
// //   }, [open, initialExam]);

// //   function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
// //     setForm((f) => ({ ...f, [key]: value }));
// //   }

// //   function addRule() {
// //     setRules((r) => [...r, { count: 1 }]);
// //   }
// //   function updateRule(index: number, patch: Partial<SelectionRule>) {
// //     setRules((r) => r.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
// //   }
// //   function removeRule(index: number) {
// //     setRules((r) => r.filter((_, i) => i !== index));
// //   }

// //   async function runSearch() {
// //     if (!searchTerm.trim()) {
// //       setSearchResults([]);
// //       return;
// //     }
// //     setIsSearching(true);
// //     try {
// //       const result = await questionService.list({ page: 1, limit: 100 });
// //       const term = searchTerm.trim().toLowerCase();
// //       const alreadyIn = new Set([
// //         ...stagedQuestions.map((q) => q.id),
// //         ...currentPool.map((p) => p.question.id),
// //       ]);
// //       setSearchResults(
// //         result.items.filter((q) => q.questionText.toLowerCase().includes(term) && !alreadyIn.has(q.id))
// //       );
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsSearching(false);
// //     }
// //   }

// //   async function handleAddQuestion(q: Question) {
// //     if (mode === "create") {
// //       setStagedQuestions((s) => [...s, q]);
// //       setSearchResults((r) => r.filter((x) => x.id !== q.id));
// //       return;
// //     }
// //     if (!initialExam) return;
// //     setIsMutatingPool(true);
// //     try {
// //       const updated = await examService.addPoolQuestions(initialExam.id, [q.id]);
// //       setCurrentPool(updated.examQuestions);
// //       setSearchResults((r) => r.filter((x) => x.id !== q.id));
// //       toast.success("Question added to pool");
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsMutatingPool(false);
// //     }
// //   }

// //   async function handleRemoveStaged(questionId: string) {
// //     setStagedQuestions((s) => s.filter((q) => q.id !== questionId));
// //   }

// //   async function handleRemoveFromPool(questionId: string) {
// //     if (!initialExam) return;
// //     setIsMutatingPool(true);
// //     try {
// //       const updated = await examService.removePoolQuestion(initialExam.id, questionId);
// //       setCurrentPool(updated.examQuestions);
// //       toast.success("Question removed from pool");
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsMutatingPool(false);
// //     }
// //   }

// //   function validate(): boolean {
// //     const next: Record<string, string> = {};
// //     if (!form.title.trim()) next.title = "Title is required";
// //     if (!form.subject.trim()) next.subject = "Subject is required";

// //     const duration = Number(form.durationMinutes);
// //     if (!Number.isInteger(duration) || duration <= 0) next.durationMinutes = "Must be a positive integer";

// //     if (!form.startTime) next.startTime = "Start time is required";
// //     if (!form.endTime) next.endTime = "End time is required";
// //     if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
// //       next.endTime = "End time must be after start time";
// //     }

// //     const maxWarnings = Number(form.maxTabSwitchWarnings);
// //     if (!Number.isInteger(maxWarnings) || maxWarnings <= 0) {
// //       next.maxTabSwitchWarnings = "Must be a positive integer";
// //     }

// //     rules.forEach((r, i) => {
// //       if (!Number.isInteger(r.count) || r.count <= 0) {
// //         next[`rule-${i}`] = "Count must be a positive integer";
// //       }
// //     });

// //     setErrors(next);
// //     return Object.keys(next).length === 0;
// //   }

// //   async function handleSubmit(e: React.FormEvent) {
// //     e.preventDefault();
// //     if (!validate()) return;

// //     const payload: ExamFormPayload = {
// //       title: form.title.trim(),
// //       subject: form.subject.trim(),
// //       durationMinutes: Number(form.durationMinutes),
// //       startTime: new Date(form.startTime).toISOString(),
// //       endTime: new Date(form.endTime).toISOString(),
// //       randomizationMode: form.randomizationMode,
// //       negativeMarkingEnabled: form.negativeMarkingEnabled,
// //       webcamMonitoringEnabled: form.webcamMonitoringEnabled,
// //       multiFaceDetectionEnabled: form.multiFaceDetectionEnabled,
// //       fullScreenModeEnabled: form.fullScreenModeEnabled,
// //       audioMonitoringEnabled: form.audioMonitoringEnabled,
// //       gazeSensitivity: form.gazeSensitivity,
// //       maxTabSwitchWarnings: Number(form.maxTabSwitchWarnings),
// //       selectionRules: rules,
// //     };
// //     if (mode === "create" && stagedQuestions.length > 0) {
// //       payload.questionIds = stagedQuestions.map((q) => q.id);
// //     }

// //     setIsSaving(true);
// //     try {
// //       if (mode === "create") {
// //         await examService.create(payload);
// //         toast.success("Exam created");
// //       } else {
// //         await examService.update(initialExam!.id, payload);
// //         toast.success("Exam updated");
// //       }
// //       onSaved();
// //       onClose();
// //     } catch (err) {
// //       toast.error(extractExamErrorMessage(err));
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   }

// //   const poolList: { id: string; label: string; subject: string }[] =
// //     mode === "create"
// //       ? stagedQuestions.map((q) => ({ id: q.id, label: q.questionText, subject: q.subject }))
// //       : currentPool.map((p) => ({ id: p.question.id, label: p.question.questionText, subject: p.question.subject }));

// //   return (
// //     <Dialog open={open} onClose={onClose} title={mode === "create" ? "Create Exam" : "Edit Exam"} size="lg">
// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //           <Input label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} error={errors.title} />
// //           <SubjectCombobox
// //             label="Subject"
// //             value={form.subject}
// //             onChange={(v) => setField("subject", v)}
// //             subjects={subjectOptions}
// //             error={errors.subject}
// //           />
// //           <Input
// //             label="Duration (minutes)"
// //             type="number"
// //             min={1}
// //             value={form.durationMinutes}
// //             onChange={(e) => setField("durationMinutes", e.target.value)}
// //             error={errors.durationMinutes}
// //           />
// //           <Select
// //             label="Randomization Mode"
// //             value={form.randomizationMode}
// //             onChange={(e) => setField("randomizationMode", e.target.value as RandomizationMode)}
// //           >
// //             {RANDOMIZATION_MODES.map((m) => (
// //               <option key={m} value={m}>
// //                 {m.replace(/_/g, " ")}
// //               </option>
// //             ))}
// //           </Select>
// //           <Input
// //             label="Start Time"
// //             type="datetime-local"
// //             value={form.startTime}
// //             onChange={(e) => setField("startTime", e.target.value)}
// //             error={errors.startTime}
// //           />
// //           <Input
// //             label="End Time"
// //             type="datetime-local"
// //             value={form.endTime}
// //             onChange={(e) => setField("endTime", e.target.value)}
// //             error={errors.endTime}
// //           />
// //         </div>

// //         {/* ── Proctoring & marking settings ── */}
// //         <div className="rounded-xl border border-border p-4">
// //           <p className="mb-3 text-sm font-medium text-paper">Proctoring & Marking</p>
// //           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.negativeMarkingEnabled}
// //                 onChange={(e) => setField("negativeMarkingEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Negative marking enabled
// //             </label>
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.webcamMonitoringEnabled}
// //                 onChange={(e) => setField("webcamMonitoringEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Webcam monitoring enabled
// //             </label>
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.multiFaceDetectionEnabled}
// //                 onChange={(e) => setField("multiFaceDetectionEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Multi-face detection enabled
// //             </label>
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.fullScreenModeEnabled}
// //                 onChange={(e) => setField("fullScreenModeEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Full-screen mode enforced
// //             </label>
// //             <label className="flex items-center gap-2.5 text-sm text-paper/80">
// //               <input
// //                 type="checkbox"
// //                 checked={form.audioMonitoringEnabled}
// //                 onChange={(e) => setField("audioMonitoringEnabled", e.target.checked)}
// //                 className="h-4 w-4 rounded border-border accent-accent-sky"
// //               />
// //               Audio monitoring enabled{" "}
// //               <span className="text-xs italic text-muted">(coming soon — setting only, not yet active)</span>
// //             </label>

// //             <Select
// //               label="Gaze Sensitivity"
// //               value={form.gazeSensitivity}
// //               onChange={(e) => setField("gazeSensitivity", e.target.value as GazeSensitivity)}
// //             >
// //               {GAZE_SENSITIVITIES.map((g) => (
// //                 <option key={g} value={g}>
// //                   {g.charAt(0) + g.slice(1).toLowerCase()}
// //                 </option>
// //               ))}
// //             </Select>
// //             <Input
// //               label="Max Tab-Switch Warnings"
// //               type="number"
// //               min={1}
// //               value={form.maxTabSwitchWarnings}
// //               onChange={(e) => setField("maxTabSwitchWarnings", e.target.value)}
// //               error={errors.maxTabSwitchWarnings}
// //             />
// //           </div>
// //         </div>

// //         {/* ── Selection rule builder ── */}
// //         <div className="rounded-xl border border-border p-4">
// //           <div className="mb-3 flex items-center justify-between">
// //             <p className="text-sm font-medium text-paper">Auto-Selection Rules</p>
// //             <button
// //               type="button"
// //               onClick={addRule}
// //               className="flex items-center gap-1 text-xs font-medium text-accent-sky hover:text-accent-skyHover"
// //             >
// //               <Plus className="h-3.5 w-3.5" /> Add rule
// //             </button>
// //           </div>
// //           <p className="mb-3 text-xs text-muted">
// //             e.g. &quot;Pick 5 EASY MCQs from Data Structures&quot; — leave any field blank to match any value.
// //           </p>

// //           {rules.length === 0 ? (
// //             <p className="py-3 text-center text-xs text-muted">No rules yet — add one, or use the curated pool below instead.</p>
// //           ) : (
// //             <div className="space-y-2">
// //               {rules.map((rule, i) => (
// //                 <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_1fr_90px_36px]">
// //                   <input
// //                     value={rule.subject ?? ""}
// //                     onChange={(e) => updateRule(i, { subject: e.target.value || undefined })}
// //                     placeholder="Any subject"
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
// //                   />
// //                   <select
// //                     value={rule.questionType ?? ""}
// //                     onChange={(e) => updateRule(i, { questionType: (e.target.value || undefined) as SelectionRule["questionType"] })}
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
// //                   >
// //                     <option value="">Any type</option>
// //                     {QUESTION_TYPES.map((t) => (
// //                       <option key={t} value={t}>
// //                         {questionTypeLabel(t)}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   <select
// //                     value={rule.difficultyLevel ?? ""}
// //                     onChange={(e) => updateRule(i, { difficultyLevel: (e.target.value || undefined) as SelectionRule["difficultyLevel"] })}
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
// //                   >
// //                     <option value="">Any difficulty</option>
// //                     {DIFFICULTY_LEVELS.map((d) => (
// //                       <option key={d} value={d}>
// //                         {d.charAt(0) + d.slice(1).toLowerCase()}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   <input
// //                     type="number"
// //                     min={1}
// //                     value={rule.count}
// //                     onChange={(e) => updateRule(i, { count: Number(e.target.value) })}
// //                     placeholder="Count"
// //                     className="h-9 rounded-lg border border-border bg-surface-muted px-3 text-sm text-paper focus:border-accent-sky focus:outline-none"
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => removeRule(i)}
// //                     aria-label="Remove rule"
// //                     className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-white/5 hover:text-accent-rose"
// //                   >
// //                     <Trash2 className="h-4 w-4" />
// //                   </button>
// //                   {errors[`rule-${i}`] && (
// //                     <p className="col-span-full text-xs font-medium text-accent-rose">{errors[`rule-${i}`]}</p>
// //                   )}
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>

// //         {/* ── Curated question pool ── */}
// //         <div className="rounded-xl border border-border p-4">
// //           <p className="mb-3 text-sm font-medium text-paper">Curated Question Pool (optional)</p>

// //           <div className="flex gap-2">
// //             <div className="relative flex-1">
// //               <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
// //               <input
// //                 value={searchTerm}
// //                 onChange={(e) => setSearchTerm(e.target.value)}
// //                 onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())}
// //                 placeholder="Search questions by text..."
// //                 className="h-10 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
// //               />
// //             </div>
// //             <Button type="button" variant="secondary" onClick={runSearch} isLoading={isSearching} className="w-auto px-4">
// //               Search
// //             </Button>
// //           </div>

// //           {searchResults.length > 0 && (
// //             <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
// //               {searchResults.map((q) => (
// //                 <button
// //                   key={q.id}
// //                   type="button"
// //                   onClick={() => handleAddQuestion(q)}
// //                   disabled={isMutatingPool}
// //                   className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm text-paper hover:bg-white/5 disabled:opacity-50"
// //                 >
// //                   <span className="truncate">{q.questionText}</span>
// //                   <span className="shrink-0 text-xs text-muted">{q.subject}</span>
// //                 </button>
// //               ))}
// //             </div>
// //           )}

// //           <div className="mt-3 space-y-1.5">
// //             {poolList.length === 0 ? (
// //               <p className="py-2 text-center text-xs text-muted">No questions added to the curated pool yet.</p>
// //             ) : (
// //               poolList.map((p) => (
// //                 <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
// //                   <span className="truncate text-sm text-paper">{p.label}</span>
// //                   <div className="flex shrink-0 items-center gap-2">
// //                     <span className="text-xs text-muted">{p.subject}</span>
// //                     <button
// //                       type="button"
// //                       onClick={() => (mode === "create" ? handleRemoveStaged(p.id) : handleRemoveFromPool(p.id))}
// //                       disabled={isMutatingPool}
// //                       aria-label="Remove from pool"
// //                       className="rounded-md p-1 text-muted hover:bg-white/5 hover:text-accent-rose disabled:opacity-50"
// //                     >
// //                       <X className="h-3.5 w-3.5" />
// //                     </button>
// //                   </div>
// //                 </div>
// //               ))
// //             )}
// //           </div>

// //           {mode === "edit" && (
// //             <p className="mt-2 text-xs text-muted">
// //               Pool changes here save immediately (not on &quot;Save Changes&quot; below).
// //             </p>
// //           )}
// //         </div>

// //         <div className="flex justify-end gap-3 border-t border-border pt-5">
// //           <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto px-4">
// //             Cancel
// //           </Button>
// //           <Button type="submit" isLoading={isSaving} className="w-auto px-5">
// //             {mode === "create" ? "Create Exam" : "Save Changes"}
// //           </Button>
// //         </div>
// //       </form>
// //     </Dialog>
// //   );
// // }




// "use client";

// import { Plus, Trash2, Search, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// import { Dialog } from "@/components/ui/Dialog";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Select } from "@/components/ui/Card";
// import { SubjectCombobox } from "@/components/exams/SubjectCombobox";
// import { examService } from "@/services/examService";
// import { questionService } from "@/services/questionService";
// import { useQuestionStats } from "@/hooks/useQuestionStats";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import {
//   GAZE_SENSITIVITIES,
//   RANDOMIZATION_MODES,
//   type Exam,
//   type ExamFormPayload,
//   type GazeSensitivity,
//   type PoolQuestionRef,
//   type RandomizationMode,
//   type SelectionRule,
// } from "@/types/exam";
// import { DIFFICULTY_LEVELS, QUESTION_TYPES, type Question } from "@/types/question";
// import { questionTypeLabel } from "@/components/ui/Badge";

// interface Props {
//   open: boolean;
//   mode: "create" | "edit";
//   initialExam?: Exam | null;
//   onClose: () => void;
//   onSaved: () => void;
// }

// interface FormState {
//   title: string;
//   subject: string;
//   durationMinutes: string;
//   startTime: string; // datetime-local string
//   endTime: string;
//   randomizationMode: RandomizationMode;
//   negativeMarkingEnabled: boolean;
//   webcamMonitoringEnabled: boolean;
//   fullScreenModeEnabled: boolean;
//   multiFaceDetectionEnabled: boolean;
//   audioMonitoringEnabled: boolean;
//   gazeSensitivity: GazeSensitivity;
//   maxTabSwitchWarnings: string;
// }

// const EMPTY_FORM: FormState = {
//   title: "",
//   subject: "",
//   durationMinutes: "60",
//   startTime: "",
//   endTime: "",
//   randomizationMode: "PER_STUDENT_UNIQUE",
//   negativeMarkingEnabled: true,
//   webcamMonitoringEnabled: true,
//   multiFaceDetectionEnabled: true,
//   fullScreenModeEnabled: true,
//   audioMonitoringEnabled: false,
//   gazeSensitivity: "MEDIUM",
//   maxTabSwitchWarnings: "3",
// };

// /** Converts an ISO string to the value <input type="datetime-local"> expects. */
// function toDatetimeLocal(iso: string): string {
//   const d = new Date(iso);
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// }

// function examToForm(e: Exam): FormState {
//   return {
//     title: e.title,
//     subject: e.subject,
//     durationMinutes: String(e.durationMinutes),
//     startTime: toDatetimeLocal(e.startTime),
//     endTime: toDatetimeLocal(e.endTime),
//     randomizationMode: e.randomizationMode,
//     negativeMarkingEnabled: e.negativeMarkingEnabled,
//     webcamMonitoringEnabled: e.webcamMonitoringEnabled,
//     multiFaceDetectionEnabled: e.multiFaceDetectionEnabled,
//     fullScreenModeEnabled: e.fullScreenModeEnabled,
//     audioMonitoringEnabled: e.audioMonitoringEnabled,
//     gazeSensitivity: e.gazeSensitivity,
//     maxTabSwitchWarnings: String(e.maxTabSwitchWarnings),
//   };
// }

// export function ExamFormDialog({ open, mode, initialExam, onClose, onSaved }: Props) {
//   const [form, setForm] = useState<FormState>(EMPTY_FORM);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isSaving, setIsSaving] = useState(false);

//   // Reused from the Question Bank module (same source the Question
//   // Bank subject filter dropdown uses) — no duplicate subject query.
//   const { stats: questionStats } = useQuestionStats();
//   const subjectOptions = questionStats?.subjects ?? [];

//   const [rules, setRules] = useState<SelectionRule[]>([]);

//   const [stagedQuestions, setStagedQuestions] = useState<Question[]>([]);
//   const [currentPool, setCurrentPool] = useState<PoolQuestionRef[]>([]);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchResults, setSearchResults] = useState<Question[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isMutatingPool, setIsMutatingPool] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setForm(initialExam ? examToForm(initialExam) : EMPTY_FORM);
//     setRules(initialExam?.selectionRules ?? []);
//     setCurrentPool(initialExam?.examQuestions ?? []);
//     setStagedQuestions([]);
//     setSearchTerm("");
//     setSearchResults([]);
//     setErrors({});
//   }, [open, initialExam]);

//   function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
//     setForm((f) => ({ ...f, [key]: value }));
//   }

//   function addRule() {
//     setRules((r) => [...r, { count: 1 }]);
//   }
//   function updateRule(index: number, patch: Partial<SelectionRule>) {
//     setRules((r) => r.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
//   }
//   function removeRule(index: number) {
//     setRules((r) => r.filter((_, i) => i !== index));
//   }

//   async function runSearch() {
//     if (!searchTerm.trim()) {
//       setSearchResults([]);
//       return;
//     }
//     setIsSearching(true);
//     try {
//       const result = await questionService.list({ page: 1, limit: 100 });
//       const term = searchTerm.trim().toLowerCase();
//       const alreadyIn = new Set([
//         ...stagedQuestions.map((q) => q.id),
//         ...currentPool.map((p) => p.question.id),
//       ]);
//       setSearchResults(
//         result.items.filter((q) => q.questionText.toLowerCase().includes(term) && !alreadyIn.has(q.id))
//       );
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsSearching(false);
//     }
//   }

//   async function handleAddQuestion(q: Question) {
//     if (mode === "create") {
//       setStagedQuestions((s) => [...s, q]);
//       setSearchResults((r) => r.filter((x) => x.id !== q.id));
//       return;
//     }
//     if (!initialExam) return;
//     setIsMutatingPool(true);
//     try {
//       const updated = await examService.addPoolQuestions(initialExam.id, [q.id]);
//       setCurrentPool(updated.examQuestions);
//       setSearchResults((r) => r.filter((x) => x.id !== q.id));
//       toast.success("Question added to pool");
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsMutatingPool(false);
//     }
//   }

//   async function handleRemoveStaged(questionId: string) {
//     setStagedQuestions((s) => s.filter((q) => q.id !== questionId));
//   }

//   async function handleRemoveFromPool(questionId: string) {
//     if (!initialExam) return;
//     setIsMutatingPool(true);
//     try {
//       const updated = await examService.removePoolQuestion(initialExam.id, questionId);
//       setCurrentPool(updated.examQuestions);
//       toast.success("Question removed from pool");
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsMutatingPool(false);
//     }
//   }

//   function validate(): boolean {
//     const next: Record<string, string> = {};
//     if (!form.title.trim()) next.title = "Title is required";
//     if (!form.subject.trim()) next.subject = "Subject is required";

//     const duration = Number(form.durationMinutes);
//     if (!Number.isInteger(duration) || duration <= 0) next.durationMinutes = "Must be a positive integer";

//     if (!form.startTime) next.startTime = "Start time is required";
//     if (!form.endTime) next.endTime = "End time is required";
//     if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
//       next.endTime = "End time must be after start time";
//     }

//     const maxWarnings = Number(form.maxTabSwitchWarnings);
//     if (!Number.isInteger(maxWarnings) || maxWarnings <= 0) {
//       next.maxTabSwitchWarnings = "Must be a positive integer";
//     }

//     rules.forEach((r, i) => {
//       if (!Number.isInteger(r.count) || r.count <= 0) {
//         next[`rule-${i}`] = "Count must be a positive integer";
//       }
//     });

//     setErrors(next);
//     return Object.keys(next).length === 0;
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!validate()) return;

//     const payload: ExamFormPayload = {
//       title: form.title.trim(),
//       subject: form.subject.trim(),
//       durationMinutes: Number(form.durationMinutes),
//       startTime: new Date(form.startTime).toISOString(),
//       endTime: new Date(form.endTime).toISOString(),
//       randomizationMode: form.randomizationMode,
//       negativeMarkingEnabled: form.negativeMarkingEnabled,
//       webcamMonitoringEnabled: form.webcamMonitoringEnabled,
//       multiFaceDetectionEnabled: form.multiFaceDetectionEnabled,
//       fullScreenModeEnabled: form.fullScreenModeEnabled,
//       audioMonitoringEnabled: form.audioMonitoringEnabled,
//       gazeSensitivity: form.gazeSensitivity,
//       maxTabSwitchWarnings: Number(form.maxTabSwitchWarnings),
//       selectionRules: rules,
//     };
//     if (mode === "create" && stagedQuestions.length > 0) {
//       payload.questionIds = stagedQuestions.map((q) => q.id);
//     }

//     setIsSaving(true);
//     try {
//       if (mode === "create") {
//         await examService.create(payload);
//         toast.success("Exam created");
//       } else {
//         await examService.update(initialExam!.id, payload);
//         toast.success("Exam updated");
//       }
//       onSaved();
//       onClose();
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   const poolList: { id: string; label: string; subject: string }[] =
//     mode === "create"
//       ? stagedQuestions.map((q) => ({ id: q.id, label: q.questionText, subject: q.subject }))
//       : currentPool.map((p) => ({ id: p.question.id, label: p.question.questionText, subject: p.question.subject }));

//   return (
//     <Dialog open={open} onClose={onClose} title={mode === "create" ? "Create Exam" : "Edit Exam"} size="lg">
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <Input label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} error={errors.title} />
//           <SubjectCombobox
//             label="Subject"
//             value={form.subject}
//             onChange={(v) => setField("subject", v)}
//             subjects={subjectOptions}
//             error={errors.subject}
//           />
//           <Input
//             label="Duration (minutes)"
//             type="number"
//             min={1}
//             value={form.durationMinutes}
//             onChange={(e) => setField("durationMinutes", e.target.value)}
//             error={errors.durationMinutes}
//           />
//           <Select
//             label="Randomization Mode"
//             value={form.randomizationMode}
//             onChange={(e) => setField("randomizationMode", e.target.value as RandomizationMode)}
//           >
//             {RANDOMIZATION_MODES.map((m) => (
//               <option key={m} value={m}>
//                 {m.replace(/_/g, " ")}
//               </option>
//             ))}
//           </Select>
//           <Input
//             label="Start Time"
//             type="datetime-local"
//             value={form.startTime}
//             onChange={(e) => setField("startTime", e.target.value)}
//             error={errors.startTime}
//           />
//           <Input
//             label="End Time"
//             type="datetime-local"
//             value={form.endTime}
//             onChange={(e) => setField("endTime", e.target.value)}
//             error={errors.endTime}
//           />
//         </div>

//         {/* ── Proctoring & marking settings ── */}
//         <div className="rounded-xl border border-border p-4">
//           <p className="mb-3 text-sm font-medium text-paper">Proctoring & Marking</p>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <label className="flex items-center gap-2.5 text-sm text-paper/80">
//               <input
//                 type="checkbox"
//                 checked={form.negativeMarkingEnabled}
//                 onChange={(e) => setField("negativeMarkingEnabled", e.target.checked)}
//                 className="h-4 w-4 rounded border-border accent-accent-sky"
//               />
//               Negative marking enabled
//             </label>
//             <label className="flex items-center gap-2.5 text-sm text-paper/80">
//               <input
//                 type="checkbox"
//                 checked={form.webcamMonitoringEnabled}
//                 onChange={(e) => setField("webcamMonitoringEnabled", e.target.checked)}
//                 className="h-4 w-4 rounded border-border accent-accent-sky"
//               />
//               Webcam monitoring enabled
//             </label>
//             <label className="flex items-center gap-2.5 text-sm text-paper/80">
//               <input
//                 type="checkbox"
//                 checked={form.multiFaceDetectionEnabled}
//                 onChange={(e) => setField("multiFaceDetectionEnabled", e.target.checked)}
//                 className="h-4 w-4 rounded border-border accent-accent-sky"
//               />
//               Multi-face detection enabled
//             </label>
//             <label className="flex items-center gap-2.5 text-sm text-paper/80">
//               <input
//                 type="checkbox"
//                 checked={form.fullScreenModeEnabled}
//                 onChange={(e) => setField("fullScreenModeEnabled", e.target.checked)}
//                 className="h-4 w-4 rounded border-border accent-accent-sky"
//               />
//               Full-screen mode enforced
//             </label>
//             <label className="flex items-center gap-2.5 text-sm text-paper/80">
//               <input
//                 type="checkbox"
//                 checked={form.audioMonitoringEnabled}
//                 onChange={(e) => setField("audioMonitoringEnabled", e.target.checked)}
//                 className="h-4 w-4 rounded border-border accent-accent-sky"
//               />
//               Audio monitoring enabled
//             </label>

//             <Select
//               label="Gaze Sensitivity"
//               value={form.gazeSensitivity}
//               onChange={(e) => setField("gazeSensitivity", e.target.value as GazeSensitivity)}
//             >
//               {GAZE_SENSITIVITIES.map((g) => (
//                 <option key={g} value={g}>
//                   {g.charAt(0) + g.slice(1).toLowerCase()}
//                 </option>
//               ))}
//             </Select>
//             <Input
//               label="Max Tab-Switch Warnings"
//               type="number"
//               min={1}
//               value={form.maxTabSwitchWarnings}
//               onChange={(e) => setField("maxTabSwitchWarnings", e.target.value)}
//               error={errors.maxTabSwitchWarnings}
//             />
//           </div>

//           {form.audioMonitoringEnabled && (
//             <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
//               Audio monitoring is a setting-only toggle for now — no audio-processing pipeline exists yet, so this
//               won&apos;t actually do anything during the exam.
//             </p>
//           )}
//         </div>

//         {/* ── Selection rule builder ── */}
//         <div className="rounded-xl border border-border p-4">
//           <div className="mb-3 flex items-center justify-between">
//             <p className="text-sm font-medium text-paper">Auto-Selection Rules</p>
//             <button
//               type="button"
//               onClick={addRule}
//               className="flex items-center gap-1 text-xs font-medium text-accent-sky hover:text-accent-skyHover"
//             >
//               <Plus className="h-3.5 w-3.5" /> Add rule
//             </button>
//           </div>
//           <p className="mb-3 text-xs text-muted">
//             e.g. &quot;Pick 5 EASY MCQs from Data Structures&quot; — leave any field blank to match any value.
//           </p>

//           {rules.length === 0 ? (
//             <p className="py-3 text-center text-xs text-muted">No rules yet — add one, or use the curated pool below instead.</p>
//           ) : (
//             <div className="space-y-2">
//               {rules.map((rule, i) => (
//                 <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_1fr_90px_36px]">
//                   <select
//                     value={rule.subject ?? ""}
//                     onChange={(e) => updateRule(i, { subject: e.target.value || undefined })}
//                     className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
//                   >
//                     <option value="">Any subject</option>
//                     {subjectOptions.map((s) => (
//                       <option key={s} value={s}>
//                         {s}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     value={rule.questionType ?? ""}
//                     onChange={(e) => updateRule(i, { questionType: (e.target.value || undefined) as SelectionRule["questionType"] })}
//                     className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
//                   >
//                     <option value="">Any type</option>
//                     {QUESTION_TYPES.map((t) => (
//                       <option key={t} value={t}>
//                         {questionTypeLabel(t)}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     value={rule.difficultyLevel ?? ""}
//                     onChange={(e) => updateRule(i, { difficultyLevel: (e.target.value || undefined) as SelectionRule["difficultyLevel"] })}
//                     className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
//                   >
//                     <option value="">Any difficulty</option>
//                     {DIFFICULTY_LEVELS.map((d) => (
//                       <option key={d} value={d}>
//                         {d.charAt(0) + d.slice(1).toLowerCase()}
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     type="number"
//                     min={1}
//                     value={rule.count}
//                     onChange={(e) => updateRule(i, { count: Number(e.target.value) })}
//                     placeholder="Count"
//                     className="h-9 rounded-lg border border-border bg-surface-muted px-3 text-sm text-paper focus:border-accent-sky focus:outline-none"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeRule(i)}
//                     aria-label="Remove rule"
//                     className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-white/5 hover:text-accent-rose"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                   {errors[`rule-${i}`] && (
//                     <p className="col-span-full text-xs font-medium text-accent-rose">{errors[`rule-${i}`]}</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* ── Curated question pool ── */}
//         <div className="rounded-xl border border-border p-4">
//           <p className="mb-3 text-sm font-medium text-paper">Curated Question Pool (optional)</p>

//           <div className="flex gap-2">
//             <div className="relative flex-1">
//               <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//               <input
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())}
//                 placeholder="Search questions by text..."
//                 className="h-10 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
//               />
//             </div>
//             <Button type="button" variant="secondary" onClick={runSearch} isLoading={isSearching} className="w-auto px-4">
//               Search
//             </Button>
//           </div>

//           {searchResults.length > 0 && (
//             <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
//               {searchResults.map((q) => (
//                 <button
//                   key={q.id}
//                   type="button"
//                   onClick={() => handleAddQuestion(q)}
//                   disabled={isMutatingPool}
//                   className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm text-paper hover:bg-white/5 disabled:opacity-50"
//                 >
//                   <span className="truncate">{q.questionText}</span>
//                   <span className="shrink-0 text-xs text-muted">{q.subject}</span>
//                 </button>
//               ))}
//             </div>
//           )}

//           <div className="mt-3 space-y-1.5">
//             {poolList.length === 0 ? (
//               <p className="py-2 text-center text-xs text-muted">No questions added to the curated pool yet.</p>
//             ) : (
//               poolList.map((p) => (
//                 <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
//                   <span className="truncate text-sm text-paper">{p.label}</span>
//                   <div className="flex shrink-0 items-center gap-2">
//                     <span className="text-xs text-muted">{p.subject}</span>
//                     <button
//                       type="button"
//                       onClick={() => (mode === "create" ? handleRemoveStaged(p.id) : handleRemoveFromPool(p.id))}
//                       disabled={isMutatingPool}
//                       aria-label="Remove from pool"
//                       className="rounded-md p-1 text-muted hover:bg-white/5 hover:text-accent-rose disabled:opacity-50"
//                     >
//                       <X className="h-3.5 w-3.5" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {mode === "edit" && (
//             <p className="mt-2 text-xs text-muted">
//               Pool changes here save immediately (not on &quot;Save Changes&quot; below).
//             </p>
//           )}
//         </div>

//         <div className="flex justify-end gap-3 border-t border-border pt-5">
//           <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto px-4">
//             Cancel
//           </Button>
//           <Button type="submit" isLoading={isSaving} className="w-auto px-5">
//             {mode === "create" ? "Create Exam" : "Save Changes"}
//           </Button>
//         </div>
//       </form>
//     </Dialog>
//   );
// }






"use client";

import { Plus, Trash2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Card";
import { SubjectCombobox } from "@/components/exams/SubjectCombobox";
import { examService } from "@/services/examService";
import { questionService } from "@/services/questionService";
import { useQuestionStats } from "@/hooks/useQuestionStats";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import {
  EXAM_STATUSES,
  GAZE_SENSITIVITIES,
  RANDOMIZATION_MODES,
  type Exam,
  type ExamFormPayload,
  type ExamStatus,
  type GazeSensitivity,
  type PoolQuestionRef,
  type RandomizationMode,
  type SelectionRule,
} from "@/types/exam";
import { DIFFICULTY_LEVELS, QUESTION_TYPES, type Question } from "@/types/question";
import { questionTypeLabel } from "@/components/ui/Badge";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialExam?: Exam | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  subject: string;
  durationMinutes: string;
  totalMarks: string;
  passingMarks: string;
  status: ExamStatus;
  startTime: string; // datetime-local string
  endTime: string;
  randomizationMode: RandomizationMode;
  negativeMarkingEnabled: boolean;
  webcamMonitoringEnabled: boolean;
  fullScreenModeEnabled: boolean;
  multiFaceDetectionEnabled: boolean;
  audioMonitoringEnabled: boolean;
  gazeSensitivity: GazeSensitivity;
  maxTabSwitchWarnings: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  subject: "",
  durationMinutes: "60",
  totalMarks: "100",
  passingMarks: "40",
  status: "DRAFT",
  startTime: "",
  endTime: "",
  randomizationMode: "PER_STUDENT_UNIQUE",
  negativeMarkingEnabled: true,
  webcamMonitoringEnabled: true,
  multiFaceDetectionEnabled: true,
  fullScreenModeEnabled: true,
  audioMonitoringEnabled: false,
  gazeSensitivity: "MEDIUM",
  maxTabSwitchWarnings: "3",
};

/** Converts an ISO string to the value <input type="datetime-local"> expects. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function examToForm(e: Exam): FormState {
  return {
    title: e.title,
    subject: e.subject,
    durationMinutes: String(e.durationMinutes),
    totalMarks: String(e.totalMarks),
    passingMarks: String(e.passingMarks),
    status: e.status,
    startTime: toDatetimeLocal(e.startTime),
    endTime: toDatetimeLocal(e.endTime),
    randomizationMode: e.randomizationMode,
    negativeMarkingEnabled: e.negativeMarkingEnabled,
    webcamMonitoringEnabled: e.webcamMonitoringEnabled,
    multiFaceDetectionEnabled: e.multiFaceDetectionEnabled,
    fullScreenModeEnabled: e.fullScreenModeEnabled,
    audioMonitoringEnabled: e.audioMonitoringEnabled,
    gazeSensitivity: e.gazeSensitivity,
    maxTabSwitchWarnings: String(e.maxTabSwitchWarnings),
  };
}

export function ExamFormDialog({ open, mode, initialExam, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reused from the Question Bank module (same source the Question
  // Bank subject filter dropdown uses) — no duplicate subject query.
  const { stats: questionStats } = useQuestionStats();
  const subjectOptions = questionStats?.subjects ?? [];

  const [rules, setRules] = useState<SelectionRule[]>([]);

  const [stagedQuestions, setStagedQuestions] = useState<Question[]>([]);
  const [currentPool, setCurrentPool] = useState<PoolQuestionRef[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMutatingPool, setIsMutatingPool] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initialExam ? examToForm(initialExam) : EMPTY_FORM);
    // setRules(initialExam?.selectionRules ?? []);
    setRules(
      (initialExam?.selectionRules ?? []).map(rule => ({
        ...rule,
        questionType: rule.questionType ?? undefined,
        difficultyLevel: rule.difficultyLevel ?? undefined,
        subject: rule.subject ?? undefined,
      }))
    );
    setCurrentPool(initialExam?.examQuestions ?? []);
    setStagedQuestions([]);
    setSearchTerm("");
    setSearchResults([]);
    setErrors({});
  }, [open, initialExam]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addRule() {
    setRules((r) => [...r, { count: 1 }]);
  }
  function updateRule(index: number, patch: Partial<SelectionRule>) {
    setRules((r) => r.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  }
  function removeRule(index: number) {
    setRules((r) => r.filter((_, i) => i !== index));
  }

  async function runSearch() {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const result = await questionService.list({ page: 1, limit: 100 });
      const term = searchTerm.trim().toLowerCase();
      const alreadyIn = new Set([
        ...stagedQuestions.map((q) => q.id),
        ...currentPool.map((p) => p.question.id),
      ]);
      setSearchResults(
        result.items.filter((q) => q.questionText.toLowerCase().includes(term) && !alreadyIn.has(q.id))
      );
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddQuestion(q: Question) {
    if (mode === "create") {
      setStagedQuestions((s) => [...s, q]);
      setSearchResults((r) => r.filter((x) => x.id !== q.id));
      return;
    }
    if (!initialExam) return;
    setIsMutatingPool(true);
    try {
      const updated = await examService.addPoolQuestions(initialExam.id, [q.id]);
      setCurrentPool(updated.examQuestions);
      setSearchResults((r) => r.filter((x) => x.id !== q.id));
      toast.success("Question added to pool");
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsMutatingPool(false);
    }
  }

  async function handleRemoveStaged(questionId: string) {
    setStagedQuestions((s) => s.filter((q) => q.id !== questionId));
  }

  async function handleRemoveFromPool(questionId: string) {
    if (!initialExam) return;
    setIsMutatingPool(true);
    try {
      const updated = await examService.removePoolQuestion(initialExam.id, questionId);
      setCurrentPool(updated.examQuestions);
      toast.success("Question removed from pool");
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsMutatingPool(false);
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.subject.trim()) next.subject = "Subject is required";

    const duration = Number(form.durationMinutes);
    if (!Number.isInteger(duration) || duration <= 0) next.durationMinutes = "Must be a positive integer";

    const totalMarks = Number(form.totalMarks);
    if (!Number.isInteger(totalMarks) || totalMarks <= 0) next.totalMarks = "Must be a positive integer";

    const passingMarks = Number(form.passingMarks);
    if (!Number.isInteger(passingMarks) || passingMarks < 0) next.passingMarks = "Cannot be negative";
    else if (passingMarks > totalMarks) next.passingMarks = "Cannot exceed total marks";

    if (!form.startTime) next.startTime = "Start time is required";
    if (!form.endTime) next.endTime = "End time is required";
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
      next.endTime = "End time must be after start time";
    }

    const maxWarnings = Number(form.maxTabSwitchWarnings);
    if (!Number.isInteger(maxWarnings) || maxWarnings <= 0) {
      next.maxTabSwitchWarnings = "Must be a positive integer";
    }

    rules.forEach((r, i) => {
      if (!Number.isInteger(r.count) || r.count <= 0) {
        next[`rule-${i}`] = "Count must be a positive integer";
      }
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // const payload: ExamFormPayload = {
    //   title: form.title.trim(),
    //   subject: form.subject.trim(),
    //   durationMinutes: Number(form.durationMinutes),
    //   totalMarks: Number(form.totalMarks),
    //   passingMarks: Number(form.passingMarks),
    //   status: form.status,
    //   startTime: new Date(form.startTime).toISOString(),
    //   endTime: new Date(form.endTime).toISOString(),
    //   randomizationMode: form.randomizationMode,
    //   negativeMarkingEnabled: form.negativeMarkingEnabled,
    //   webcamMonitoringEnabled: form.webcamMonitoringEnabled,
    //   multiFaceDetectionEnabled: form.multiFaceDetectionEnabled,
    //   fullScreenModeEnabled: form.fullScreenModeEnabled,
    //   audioMonitoringEnabled: form.audioMonitoringEnabled,
    //   gazeSensitivity: form.gazeSensitivity,
    //   maxTabSwitchWarnings: Number(form.maxTabSwitchWarnings),
    //   selectionRules: rules,
    // };

    const payload: ExamFormPayload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      durationMinutes: Number(form.durationMinutes),
      totalMarks: Number(form.totalMarks),
      passingMarks: Number(form.passingMarks),
      status: form.status,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      randomizationMode: form.randomizationMode,
      negativeMarkingEnabled: form.negativeMarkingEnabled,
      webcamMonitoringEnabled: form.webcamMonitoringEnabled,
      multiFaceDetectionEnabled: form.multiFaceDetectionEnabled,
      fullScreenModeEnabled: form.fullScreenModeEnabled,
      audioMonitoringEnabled: form.audioMonitoringEnabled,
      gazeSensitivity: form.gazeSensitivity,
      maxTabSwitchWarnings: Number(form.maxTabSwitchWarnings),

      selectionRules: rules.map(rule => ({
        ...(rule.subject ? { subject: rule.subject } : {}),
        ...(rule.questionType ? { questionType: rule.questionType } : {}),
        ...(rule.difficultyLevel ? { difficultyLevel: rule.difficultyLevel } : {}),
        count: rule.count,
      })),
    };
    if (mode === "create" && stagedQuestions.length > 0) {
      payload.questionIds = stagedQuestions.map((q) => q.id);
    }

    setIsSaving(true);
    try {
      if (mode === "create") {
        await examService.create(payload);
        toast.success("Exam created");
      } else {
        await examService.update(initialExam!.id, payload);
        toast.success("Exam updated");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  const poolList: { id: string; label: string; subject: string }[] =
    mode === "create"
      ? stagedQuestions.map((q) => ({ id: q.id, label: q.questionText, subject: q.subject }))
      : currentPool.map((p) => ({ id: p.question.id, label: p.question.questionText, subject: p.question.subject }));

  return (
    <Dialog open={open} onClose={onClose} title={mode === "create" ? "Create Exam" : "Edit Exam"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} error={errors.title} />
          <SubjectCombobox
            label="Subject"
            value={form.subject}
            onChange={(v) => setField("subject", v)}
            subjects={subjectOptions}
            error={errors.subject}
          />
          <Input
            label="Duration (minutes)"
            type="number"
            min={1}
            value={form.durationMinutes}
            onChange={(e) => setField("durationMinutes", e.target.value)}
            error={errors.durationMinutes}
          />
          <Input
            label="Total Marks"
            type="number"
            min={1}
            value={form.totalMarks}
            onChange={(e) => setField("totalMarks", e.target.value)}
            error={errors.totalMarks}
          />
          <Input
            label="Passing Marks"
            type="number"
            min={0}
            value={form.passingMarks}
            onChange={(e) => setField("passingMarks", e.target.value)}
            error={errors.passingMarks}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value as ExamStatus)}
          >
            {EXAM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
          <Select
            label="Randomization Mode"
            value={form.randomizationMode}
            onChange={(e) => setField("randomizationMode", e.target.value as RandomizationMode)}
          >
            {RANDOMIZATION_MODES.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <Input
            label="Start Time"
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setField("startTime", e.target.value)}
            error={errors.startTime}
          />
          <Input
            label="End Time"
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setField("endTime", e.target.value)}
            error={errors.endTime}
          />
        </div>

        {form.status === "DRAFT" && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            This exam is a Draft — students won&apos;t see it until you set Status to &quot;Published&quot;.
          </p>
        )}

        {/* ── Proctoring & marking settings ── */}
        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 text-sm font-medium text-paper">Proctoring & Marking</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2.5 text-sm text-paper/80">
              <input
                type="checkbox"
                checked={form.negativeMarkingEnabled}
                onChange={(e) => setField("negativeMarkingEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-sky"
              />
              Negative marking enabled
            </label>
            <label className="flex items-center gap-2.5 text-sm text-paper/80">
              <input
                type="checkbox"
                checked={form.webcamMonitoringEnabled}
                onChange={(e) => setField("webcamMonitoringEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-sky"
              />
              Webcam monitoring enabled
            </label>
            <label className="flex items-center gap-2.5 text-sm text-paper/80">
              <input
                type="checkbox"
                checked={form.multiFaceDetectionEnabled}
                onChange={(e) => setField("multiFaceDetectionEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-sky"
              />
              Multi-face detection enabled
            </label>
            <label className="flex items-center gap-2.5 text-sm text-paper/80">
              <input
                type="checkbox"
                checked={form.fullScreenModeEnabled}
                onChange={(e) => setField("fullScreenModeEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-sky"
              />
              Full-screen mode enforced
            </label>
            <label className="flex items-center gap-2.5 text-sm text-paper/80">
              <input
                type="checkbox"
                checked={form.audioMonitoringEnabled}
                onChange={(e) => setField("audioMonitoringEnabled", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent-sky"
              />
              Audio monitoring enabled
            </label>

            <Select
              label="Gaze Sensitivity"
              value={form.gazeSensitivity}
              onChange={(e) => setField("gazeSensitivity", e.target.value as GazeSensitivity)}
            >
              {GAZE_SENSITIVITIES.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0) + g.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
            <Input
              label="Max Tab-Switch Warnings"
              type="number"
              min={1}
              value={form.maxTabSwitchWarnings}
              onChange={(e) => setField("maxTabSwitchWarnings", e.target.value)}
              error={errors.maxTabSwitchWarnings}
            />
          </div>

          {form.audioMonitoringEnabled && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
              Audio monitoring is a setting-only toggle for now — no audio-processing pipeline exists yet, so this
              won&apos;t actually do anything during the exam.
            </p>
          )}
        </div>

        {/* ── Selection rule builder ── */}
        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-paper">Auto-Selection Rules</p>
            <button
              type="button"
              onClick={addRule}
              className="flex items-center gap-1 text-xs font-medium text-accent-sky hover:text-accent-skyHover"
            >
              <Plus className="h-3.5 w-3.5" /> Add rule
            </button>
          </div>
          <p className="mb-3 text-xs text-muted">
            e.g. &quot;Pick 5 EASY MCQs from Data Structures&quot; — leave any field blank to match any value.
          </p>

          {rules.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted">No rules yet — add one, or use the curated pool below instead.</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_1fr_90px_36px]">
                  <select
                    value={rule.subject ?? ""}
                    onChange={(e) => updateRule(i, { subject: e.target.value || undefined })}
                    className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
                  >
                    <option value="">Any subject</option>
                    {subjectOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.questionType ?? ""}
                    onChange={(e) => updateRule(i, { questionType: (e.target.value || undefined) as SelectionRule["questionType"] })}
                    className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
                  >
                    <option value="">Any type</option>
                    {QUESTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {questionTypeLabel(t)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.difficultyLevel ?? ""}
                    onChange={(e) => updateRule(i, { difficultyLevel: (e.target.value || undefined) as SelectionRule["difficultyLevel"] })}
                    className="h-9 rounded-lg border border-border bg-surface-muted px-2 text-sm text-paper focus:border-accent-sky focus:outline-none"
                  >
                    <option value="">Any difficulty</option>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0) + d.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={rule.count}
                    onChange={(e) => updateRule(i, { count: Number(e.target.value) })}
                    placeholder="Count"
                    className="h-9 rounded-lg border border-border bg-surface-muted px-3 text-sm text-paper focus:border-accent-sky focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(i)}
                    aria-label="Remove rule"
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-white/5 hover:text-accent-rose"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {errors[`rule-${i}`] && (
                    <p className="col-span-full text-xs font-medium text-accent-rose">{errors[`rule-${i}`]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Curated question pool ── */}
        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 text-sm font-medium text-paper">Curated Question Pool (optional)</p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())}
                placeholder="Search questions by text..."
                className="h-10 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
              />
            </div>
            <Button type="button" variant="secondary" onClick={runSearch} isLoading={isSearching} className="w-auto px-4">
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {searchResults.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleAddQuestion(q)}
                  disabled={isMutatingPool}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm text-paper hover:bg-white/5 disabled:opacity-50"
                >
                  <span className="truncate">{q.questionText}</span>
                  <span className="shrink-0 text-xs text-muted">{q.subject}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 space-y-1.5">
            {poolList.length === 0 ? (
              <p className="py-2 text-center text-xs text-muted">No questions added to the curated pool yet.</p>
            ) : (
              poolList.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
                  <span className="truncate text-sm text-paper">{p.label}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted">{p.subject}</span>
                    <button
                      type="button"
                      onClick={() => (mode === "create" ? handleRemoveStaged(p.id) : handleRemoveFromPool(p.id))}
                      disabled={isMutatingPool}
                      aria-label="Remove from pool"
                      className="rounded-md p-1 text-muted hover:bg-white/5 hover:text-accent-rose disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {mode === "edit" && (
            <p className="mt-2 text-xs text-muted">
              Pool changes here save immediately (not on &quot;Save Changes&quot; below).
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} className="w-auto px-4">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} className="w-auto px-5">
            {mode === "create" ? "Create Exam" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
