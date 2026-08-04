
// "use client";

// import { ImageIcon, Upload } from "lucide-react";
// import { useRef, useState } from "react";

// import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
// import { useI18n } from "@/hooks/useI18n";
// import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
// import { STATIC_FILE_ORIGIN } from "@/lib/axios";
// import { FilePreviewModal } from "@/components/exam-taking/FilePreviewModal";
// import type { SessionQuestionView } from "@/types/examSession";

// interface Props {
//   question: SessionQuestionView;
//   index: number;
//   total: number;
//   onSelectOptions: (optionIds: string[]) => void;
//   onTextChange: (text: string) => void;
//   onFileUpload: (file: File) => void;
//   onBeforeFilePick?: () => void; // call right before opening the native file dialog
//   onFilePicked?: () => void; // call right after a file is chosen (still a trusted user gesture — best chance to re-enter fullscreen)
// }

// export function QuestionPanel({
//   question,
//   index,
//   total,
//   onSelectOptions,
//   onTextChange,
//   onFileUpload,
//   onBeforeFilePick,
//   onFilePicked,
// }: Props) {
//   const { t } = useI18n();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const selectedIds = new Set(question.answer?.selectedOptionIds ?? []);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   // Dynamic (examiner-authored) content — machine-translated at render
//   // time into whichever of the 5 languages the student picked. This is
//   // separate from the static UI strings above/below, which come from
//   // the fixed lib/i18n dictionaries via t().
//   const optionTexts = question.options?.map((opt) => opt.optionText) ?? [];
//   const { translated } = useTranslatedTexts([question.questionText, ...optionTexts]);
//   const translatedQuestionText = translated[0] ?? question.questionText;
//   const translatedOptionTexts = translated.slice(1);

//   function toggleMcq(optionId: string) {
//     onSelectOptions([optionId]);
//   }

//   function toggleMultiSelect(optionId: string) {
//     const next = new Set(selectedIds);
//     if (next.has(optionId)) next.delete(optionId);
//     else next.add(optionId);
//     onSelectOptions([...next]);
//   }

//   function openFilePicker() {
//     onBeforeFilePick?.();
//     fileInputRef.current?.click();
//   }

//   const submittedFileUrl = question.answer?.submittedFileUrl;
//   const fullFileUrl = submittedFileUrl ? `${STATIC_FILE_ORIGIN}${submittedFileUrl}` : null;
//   const isPdf = submittedFileUrl?.toLowerCase().endsWith(".pdf") ?? false;

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-wrap items-center gap-2">
//         <Badge tone="neutral">
//           {t("examTaking.questionOf", { current: index + 1, total })}
//         </Badge>
//         <Badge tone="sky">{questionTypeLabel(question.questionType)}</Badge>
//         <Badge tone={difficultyTone(question.difficultyLevel)}>{question.difficultyLevel}</Badge>
//         <Badge tone="neutral">
//           {question.marksAllocated} {t("examTaking.marks")}
//         </Badge>
//       </div>

//       <p className="whitespace-pre-wrap text-lg text-paper">{translatedQuestionText}</p>

//       {question.questionType === "MCQ" && (
//         <div className="space-y-2">
//           {question.options?.map((opt, optIndex) => (
//             <label
//               key={opt.id}
//               className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
//                 selectedIds.has(opt.id)
//                   ? "border-accent-sky bg-accent-sky/10 text-paper"
//                   : "border-border text-paper/80 hover:bg-white/5"
//               }`}
//             >
//               <input
//                 type="radio"
//                 name={question.questionId}
//                 checked={selectedIds.has(opt.id)}
//                 onChange={() => toggleMcq(opt.id)}
//                 className="h-4 w-4 accent-accent-sky"
//               />
//               {translatedOptionTexts[optIndex] ?? opt.optionText}
//             </label>
//           ))}
//         </div>
//       )}

//       {question.questionType === "MULTI_SELECT" && (
//         <div className="space-y-2">
//           {question.options?.map((opt, optIndex) => (
//             <label
//               key={opt.id}
//               className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
//                 selectedIds.has(opt.id)
//                   ? "border-accent-sky bg-accent-sky/10 text-paper"
//                   : "border-border text-paper/80 hover:bg-white/5"
//               }`}
//             >
//               <input
//                 type="checkbox"
//                 checked={selectedIds.has(opt.id)}
//                 onChange={() => toggleMultiSelect(opt.id)}
//                 className="h-4 w-4 rounded accent-accent-sky"
//               />
//               {translatedOptionTexts[optIndex] ?? opt.optionText}
//             </label>
//           ))}
//         </div>
//       )}

//       {(question.questionType === "SHORT_ANSWER" || question.questionType === "LONG_ANSWER") && (
//         <textarea
//           value={question.answer?.submittedText ?? ""}
//           onChange={(e) => onTextChange(e.target.value)}
//           rows={question.questionType === "LONG_ANSWER" ? 10 : 4}
//           placeholder={t("examTaking.typeAnswer")}
//           className="w-full rounded-lg border border-border bg-surface-muted p-4 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
//         />
//       )}

//       {question.questionType === "IMAGE_UPLOAD" && (
//         <div>
//           {fullFileUrl ? (
//             <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-4 py-3">
//               <button
//                 onClick={() => setPreviewUrl(fullFileUrl)}
//                 className="flex items-center gap-2 text-sm text-accent-sky underline"
//               >
//                 <ImageIcon className="h-4 w-4" /> {t("examTaking.viewUploadedAnswer")}
//               </button>
//               <button onClick={openFilePicker} className="text-xs font-medium text-muted hover:text-paper">
//                 {t("examTaking.replace")}
//               </button>
//             </div>
//           ) : (
//             <div
//               onClick={openFilePicker}
//               className="cursor-pointer rounded-xl border border-dashed border-border p-8 text-center transition-colors hover:border-accent-sky/50"
//             >
//               <Upload className="mx-auto h-8 w-8 text-muted" />
//               <p className="mt-2 text-sm text-paper">{t("examTaking.uploadHandwritten")}</p>
//               <p className="mt-1 text-xs text-muted">{t("examTaking.uploadHint")}</p>
//             </div>
//           )}
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/png,image/jpeg,image/webp,application/pdf"
//             className="hidden"
//             onChange={(e) => {
//               const file = e.target.files?.[0];
//               if (file) {
//                 // Still within the trusted user-gesture chain from picking
//                 // the file (unlike the async fullscreenchange handler), so
//                 // this has a real chance of succeeding if the native
//                 // dialog knocked us out of fullscreen.
//                 onFilePicked?.();
//                 onFileUpload(file);
//               }
//             }}
//           />
//         </div>
//       )}

//       <FilePreviewModal url={previewUrl} isPdf={isPdf} onClose={() => setPreviewUrl(null)} />
//     </div>
//   );
// }






"use client";

import { ImageIcon, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
import { useI18n } from "@/hooks/useI18n";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { STATIC_FILE_ORIGIN } from "@/lib/axios";
import { FilePreviewModal } from "@/components/exam-taking/FilePreviewModal";
import type { SessionQuestionView } from "@/types/examSession";

interface Props {
  question: SessionQuestionView;
  index: number;
  total: number;
  onSelectOptions: (optionIds: string[]) => void;
  onTextChange: (text: string) => void;
  onFileUpload: (file: File) => void;
  onBeforeFilePick?: () => void;
  onFilePicked?: () => void;
}

export function QuestionPanel({
  question,
  index,
  total,
  onSelectOptions,
  onTextChange,
  onFileUpload,
  onBeforeFilePick,
  onFilePicked,
}: Props) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedIds = new Set(question.answer?.selectedOptionIds ?? []);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const optionTexts = question.options?.map((opt) => opt.optionText) ?? [];
  const { translated } = useTranslatedTexts([question.questionText, ...optionTexts]);
  const translatedQuestionText = translated[0] ?? question.questionText;
  const translatedOptionTexts = translated.slice(1);

  function toggleMcq(optionId: string) {
    onSelectOptions([optionId]);
  }

  function toggleMultiSelect(optionId: string) {
    const next = new Set(selectedIds);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    onSelectOptions([...next]);
  }

  function openFilePicker() {
    onBeforeFilePick?.();
    fileInputRef.current?.click();
  }

  const submittedFileUrl = question.answer?.submittedFileUrl;
  const fullFileUrl = submittedFileUrl ? `${STATIC_FILE_ORIGIN}${submittedFileUrl}` : null;
  const isPdf = submittedFileUrl?.toLowerCase().endsWith(".pdf") ?? false;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* 1. Responsive Badges Row */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Badge tone="neutral">
          {t("examTaking.questionOf", { current: index + 1, total })}
        </Badge>
        <Badge tone="sky">{questionTypeLabel(question.questionType)}</Badge>
        <Badge tone={difficultyTone(question.difficultyLevel)}>{question.difficultyLevel}</Badge>
        <Badge tone="neutral">
          {question.marksAllocated} {t("examTaking.marks")}
        </Badge>
      </div>

      {/* 2. Break-words for long technical strings / formulas */}
      <p className="whitespace-pre-wrap break-words text-base sm:text-lg leading-relaxed text-paper">
        {translatedQuestionText}
      </p>

      {/* 3. MCQ Options - items-start prevents vertical centering on multi-line text */}
      {question.questionType === "MCQ" && (
        <div className="space-y-2.5">
          {question.options?.map((opt, optIndex) => (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all select-none ${
                selectedIds.has(opt.id)
                  ? "border-accent-sky bg-accent-sky/10 text-paper font-medium"
                  : "border-border text-paper/80 hover:bg-white/5"
              }`}
            >
              <input
                type="radio"
                name={question.questionId}
                checked={selectedIds.has(opt.id)}
                onChange={() => toggleMcq(opt.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent-sky"
              />
              <span className="break-words leading-snug">
                {translatedOptionTexts[optIndex] ?? opt.optionText}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* 4. MULTI_SELECT Options - Same top-alignment & touch-target improvements */}
      {question.questionType === "MULTI_SELECT" && (
        <div className="space-y-2.5">
          {question.options?.map((opt, optIndex) => (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all select-none ${
                selectedIds.has(opt.id)
                  ? "border-accent-sky bg-accent-sky/10 text-paper font-medium"
                  : "border-border text-paper/80 hover:bg-white/5"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(opt.id)}
                onChange={() => toggleMultiSelect(opt.id)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-accent-sky"
              />
              <span className="break-words leading-snug">
                {translatedOptionTexts[optIndex] ?? opt.optionText}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* 5. Responsive textarea height so mobile keyboard doesn't choke the viewport */}
      {(question.questionType === "SHORT_ANSWER" || question.questionType === "LONG_ANSWER") && (
        <textarea
          value={question.answer?.submittedText ?? ""}
          onChange={(e) => onTextChange(e.target.value)}
          rows={question.questionType === "LONG_ANSWER" ? 6 : 3}
          placeholder={t("examTaking.typeAnswer")}
          className="w-full min-h-[120px] sm:min-h-[180px] rounded-xl border border-border bg-surface-muted p-3.5 sm:p-4 text-sm sm:text-base text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none transition-colors resize-y"
        />
      )}

      {/* 6. Upload bar - safe flex-wrap so long translations don't overflow */}
      {question.questionType === "IMAGE_UPLOAD" && (
        <div>
          {fullFileUrl ? (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3">
              <button
                onClick={() => setPreviewUrl(fullFileUrl)}
                className="flex items-center gap-2 text-sm text-accent-sky underline break-all"
              >
                <ImageIcon className="h-4 w-4 shrink-0" />{" "}
                <span>{t("examTaking.viewUploadedAnswer")}</span>
              </button>
              <button
                onClick={openFilePicker}
                className="text-xs font-medium text-muted hover:text-paper shrink-0 py-1"
              >
                {t("examTaking.replace")}
              </button>
            </div>
          ) : (
            <div
              onClick={openFilePicker}
              className="cursor-pointer rounded-xl border border-dashed border-border p-6 sm:p-8 text-center transition-colors hover:border-accent-sky/50 active:bg-white/5"
            >
              <Upload className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-muted" />
              <p className="mt-2 text-sm font-medium text-paper">{t("examTaking.uploadHandwritten")}</p>
              <p className="mt-1 text-xs text-muted">{t("examTaking.uploadHint")}</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFilePicked?.();
                onFileUpload(file);
              }
            }}
          />
        </div>
      )}

      <FilePreviewModal url={previewUrl} isPdf={isPdf} onClose={() => setPreviewUrl(null)} />
    </div>
  );
}