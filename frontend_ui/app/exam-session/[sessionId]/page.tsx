// "use client";

// // app/exam-session/[sessionId]/page.tsx

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Flag, Eraser } from "lucide-react";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { Button } from "@/components/ui/Button";
// import { useExamSession } from "@/hooks/useExamSession";
// import { useProctoringSignals } from "@/hooks/useProctoringSignals";
// import { useFaceMonitoring } from "@/hooks/useFaceMonitoring";
// import { ExamTimerBar } from "@/components/exam-taking/ExamTimerBar";
// import { QuestionNavigatorSidebar } from "@/components/exam-taking/QuestionNavigatorSidebar";
// import { QuestionPanel } from "@/components/exam-taking/QuestionPanel";
// import { SubmitConfirmDialog } from "@/components/exam-taking/SubmitConfirmDialog";
// import { FullScreenGate } from "@/components/exam-taking/FullScreenGate";
// import { ProctoringCameraWidget } from "@/components/exam-taking/ProctoringCameraWidget";

// const REDIRECT_SECONDS = 5;

// export default function ExamSessionPage() {
//   return (
//     <RoleGuard allowedRole="STUDENT">
//       <ExamSessionContent />
//     </RoleGuard>
//   );
// }

// function ExamSessionContent() {
//   const params = useParams<{ sessionId: string }>();
//   const router = useRouter();
//   const {
//     session,
//     timeRemaining,
//     isLoading,
//     isSubmitting,
//     finalResult,
//     visitedQuestionIds,
//     markVisited,
//     toggleMarkForReview,
//     clearAnswer,
//     selectOptions,
//     setTextDraft,
//     uploadFile,
//     submitExam,
//   } = useExamSession(params.sessionId);

//   const [activeIndex, setActiveIndex] = useState(0);
//   const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
//   const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

//   const handleExceeded = useCallback(() => {
//     submitExam();
//   }, [submitExam]);

//   const isActive = Boolean(session && session.status === "IN_PROGRESS");

//   const { isFullscreen, requestFullscreen, suppressNextBlur } = useProctoringSignals({
//     sessionId: params.sessionId,
//     enabled: isActive,
//     fullScreenModeEnabled: session?.exam.fullScreenModeEnabled ?? false,
//     maxTabSwitchWarnings: session?.exam.maxTabSwitchWarnings ?? 3,
//     onExceeded: handleExceeded,
//   });

//   const {
//     status: cameraStatus,
//     faceCount,
//     gazeDirection,
//     videoRef,
//     canvasRef,
//   } = useFaceMonitoring(params.sessionId, isActive && Boolean(session?.exam.webcamMonitoringEnabled));

//   const unansweredCount = useMemo(() => {
//     if (!session) return 0;
//     return session.questions.filter((q) => {
//       if (!q.answer) return true;
//       return (
//         q.answer.selectedOptionIds.length === 0 &&
//         !q.answer.submittedText?.trim() &&
//         !q.answer.submittedFileUrl
//       );
//     }).length;
//   }, [session]);

//   const activeQuestion = session?.questions[activeIndex];

//   // Mark the current question as visited the moment it becomes active
//   // (covers both direct palette clicks and Next/Previous navigation).
//   useEffect(() => {
//     if (activeQuestion) markVisited(activeQuestion.questionId);
//   }, [activeQuestion, markVisited]);

//   // Post-submit: 5s countdown then auto-redirect to the dashboard.
//   useEffect(() => {
//     if (!finalResult || finalResult.status === "IN_PROGRESS") return;
//     if (countdown <= 0) {
//       router.push("/dashboard/student");
//       return;
//     }
//     const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
//     return () => clearTimeout(timer);
//   }, [finalResult, countdown, router]);

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-ink text-muted">
//         <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your exam...
//       </div>
//     );
//   }

//   // Beautiful centered success card — no marks/score shown, per spec.
//   if (finalResult && finalResult.status !== "IN_PROGRESS") {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-ink px-4">
//         <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-teal/15">
//             <CheckCircle2 className="h-8 w-8 text-accent-teal" />
//           </div>
//           <h1 className="mt-4 font-display text-xl font-semibold text-paper">
//             {finalResult.status === "AUTO_SUBMITTED" ? "Exam Auto-Submitted" : "Exam Submitted Successfully"}
//           </h1>
//           <p className="mt-2 text-sm text-muted">
//             Your responses have been recorded successfully.
//             {Boolean(finalResult.pendingSubjectiveCount) &&
//               " If your exam contains subjective questions, final results will be available after examiner evaluation."}
//           </p>
//           <p className="mt-6 text-xs text-muted">Redirecting to Dashboard in {countdown}...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!session || !activeQuestion) return null;

//   const isMarked = activeQuestion.answer?.markedForReview ?? false;
//   const hasContent = Boolean(
//     (activeQuestion.answer?.selectedOptionIds.length ?? 0) > 0 ||
//     activeQuestion.answer?.submittedText?.trim() ||
//     activeQuestion.answer?.submittedFileUrl
//   );
//   const isLastQuestion = activeIndex === session.questions.length - 1;

//   function goNext() {
//     setActiveIndex((i) => Math.min(session!.questions.length - 1, i + 1));
//   }

//   return (
//     <div className="min-h-screen bg-ink">
//       {session.exam.fullScreenModeEnabled && !isFullscreen && (
//         <FullScreenGate onRequestFullscreen={requestFullscreen} />
//       )}

//       {session.exam.webcamMonitoringEnabled && (
//         <ProctoringCameraWidget
//           status={cameraStatus}
//           faceCount={faceCount}
//           gazeDirection={gazeDirection}
//           videoRef={videoRef}
//           canvasRef={canvasRef}
//         />
//       )}

//       <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
//         <div>
//           <p className="font-medium text-paper">{session.exam.title}</p>
//           <p className="text-xs text-muted">{session.exam.subject}</p>
//         </div>
//         <ExamTimerBar secondsRemaining={timeRemaining} />
//       </header>

//       <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
//         <aside className="w-56 shrink-0">
//           <QuestionNavigatorSidebar
//             questions={session.questions}
//             activeIndex={activeIndex}
//             visitedQuestionIds={visitedQuestionIds}
//             onSelect={setActiveIndex}
//           />
//         </aside>

//         <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface p-6">
//           <QuestionPanel
//             question={activeQuestion}
//             index={activeIndex}
//             total={session.questions.length}
//             onSelectOptions={(ids) => selectOptions(activeQuestion.questionId, ids)}
//             onTextChange={(text) => setTextDraft(activeQuestion.questionId, text)}
//             onFileUpload={(file) => uploadFile(activeQuestion.questionId, file)}
//             onBeforeFilePick={suppressNextBlur}
//           />

//           <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
//             <div className="flex flex-wrap gap-2">
//               <Button
//                 variant="secondary"
//                 onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
//                 disabled={activeIndex === 0}
//                 className="w-auto px-4"
//               >
//                 <ChevronLeft className="h-4 w-4" /> Previous
//               </Button>

//               <Button
//                 variant="secondary"
//                 onClick={() => clearAnswer(activeQuestion.questionId)}
//                 disabled={!hasContent}
//                 className="w-auto px-4"
//               >
//                 <Eraser className="h-4 w-4" /> Clear Response
//               </Button>

//               <Button
//                 variant="secondary"
//                 onClick={() => {
//                   toggleMarkForReview(activeQuestion.questionId, isMarked);
//                   goNext();
//                 }}
//                 className={`w-auto px-4 ${isMarked ? "border-violet-400 text-violet-300" : ""}`}
//               >
//                 <Flag className="h-4 w-4" /> {isMarked ? "Unmark" : "Mark for Review"} & Next
//               </Button>
//             </div>

//             <div className="flex gap-2">
//               {!isLastQuestion ? (
//                 <>
//                   <Button variant="secondary" onClick={goNext} className="w-auto px-4">
//                     Next <ChevronRight className="h-4 w-4" />
//                   </Button>
//                   <Button onClick={goNext} className="w-auto px-5">
//                     Save & Next
//                   </Button>
//                 </>
//               ) : (
//                 <Button
//                   onClick={() => setShowSubmitConfirm(true)}
//                   className="w-auto bg-accent-teal px-5 hover:bg-accent-teal/90"
//                 >
//                   Submit Exam
//                 </Button>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>

//       <SubmitConfirmDialog
//         open={showSubmitConfirm}
//         unansweredCount={unansweredCount}
//         totalCount={session.questions.length}
//         isSubmitting={isSubmitting}
//         onClose={() => setShowSubmitConfirm(false)}
//         onConfirm={submitExam}
//       />
//     </div>
//   );
// }






"use client";

// app/exam-session/[sessionId]/page.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Flag, Eraser } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/Button";
import { useExamSession } from "@/hooks/useExamSession";
import { useProctoringSignals } from "@/hooks/useProctoringSignals";
import { useFaceMonitoring } from "@/hooks/useFaceMonitoring";
import { ExamTimerBar } from "@/components/exam-taking/ExamTimerBar";
import { QuestionNavigatorSidebar } from "@/components/exam-taking/QuestionNavigatorSidebar";
import { QuestionPanel } from "@/components/exam-taking/QuestionPanel";
import { SubmitConfirmDialog } from "@/components/exam-taking/SubmitConfirmDialog";
import { FullScreenGate } from "@/components/exam-taking/FullScreenGate";
import { ProctoringCameraWidget } from "@/components/exam-taking/ProctoringCameraWidget";

const REDIRECT_SECONDS = 5;

export default function ExamSessionPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <ExamSessionContent />
    </RoleGuard>
  );
}

function ExamSessionContent() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const {
    session,
    timeRemaining,
    isLoading,
    isSubmitting,
    finalResult,
    visitedQuestionIds,
    markVisited,
    toggleMarkForReview,
    clearAnswer,
    selectOptions,
    setTextDraft,
    uploadFile,
    submitExam,
  } = useExamSession(params.sessionId);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const handleExceeded = useCallback(() => {
    submitExam();
  }, [submitExam]);

  const isActive = Boolean(session && session.status === "IN_PROGRESS");

  const { isFullscreen, requestFullscreen, suppressNextBlur } = useProctoringSignals({
    sessionId: params.sessionId,
    enabled: isActive,
    fullScreenModeEnabled: session?.exam.fullScreenModeEnabled ?? false,
    maxTabSwitchWarnings: session?.exam.maxTabSwitchWarnings ?? 3,
    onExceeded: handleExceeded,
  });

  const {
    status: cameraStatus,
    faceCount,
    gazeDirection,
    videoRef,
    canvasRef,
  } = useFaceMonitoring(params.sessionId, isActive && Boolean(session?.exam.webcamMonitoringEnabled));

  const unansweredCount = useMemo(() => {
    if (!session) return 0;
    return session.questions.filter((q) => {
      if (!q.answer) return true;
      return (
        q.answer.selectedOptionIds.length === 0 &&
        !q.answer.submittedText?.trim() &&
        !q.answer.submittedFileUrl
      );
    }).length;
  }, [session]);

  const activeQuestion = session?.questions[activeIndex];

  // Mark the current question as visited the moment it becomes active
  // (covers both direct palette clicks and Next/Previous navigation).
  useEffect(() => {
    if (activeQuestion) markVisited(activeQuestion.questionId);
  }, [activeQuestion, markVisited]);

  // Post-submit: 5s countdown then auto-redirect to the dashboard.
  useEffect(() => {
    if (!finalResult || finalResult.status === "IN_PROGRESS") return;
    if (countdown <= 0) {
      router.push("/dashboard/student");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [finalResult, countdown, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your exam...
      </div>
    );
  }

  // Beautiful centered success card — no marks/score shown, per spec.
  if (finalResult && finalResult.status !== "IN_PROGRESS") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-teal/15">
            <CheckCircle2 className="h-8 w-8 text-accent-teal" />
          </div>
          <h1 className="mt-4 font-display text-xl font-semibold text-paper">
            {finalResult.status === "AUTO_SUBMITTED" ? "Exam Auto-Submitted" : "Exam Submitted Successfully"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your responses have been recorded successfully.
            {Boolean(finalResult.pendingSubjectiveCount) &&
              " If your exam contains subjective questions, final results will be available after examiner evaluation."}
          </p>
          <p className="mt-6 text-xs text-muted">Redirecting to Dashboard in {countdown}...</p>
        </div>
      </div>
    );
  }

  if (!session || !activeQuestion) return null;

  const isMarked = activeQuestion.answer?.markedForReview ?? false;
  const hasContent = Boolean(
    (activeQuestion.answer?.selectedOptionIds.length ?? 0) > 0 ||
    activeQuestion.answer?.submittedText?.trim() ||
    activeQuestion.answer?.submittedFileUrl
  );
  const isLastQuestion = activeIndex === session.questions.length - 1;

  function goNext() {
    setActiveIndex((i) => Math.min(session!.questions.length - 1, i + 1));
  }

  return (
    <div className="min-h-screen bg-ink">
      {session.exam.fullScreenModeEnabled && !isFullscreen && (
        <FullScreenGate onRequestFullscreen={requestFullscreen} />
      )}

      {session.exam.webcamMonitoringEnabled && (
        <ProctoringCameraWidget
          status={cameraStatus}
          faceCount={faceCount}
          gazeDirection={gazeDirection}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
      )}

      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div>
          <p className="font-medium text-paper">{session.exam.title}</p>
          <p className="text-xs text-muted">{session.exam.subject}</p>
        </div>
        <ExamTimerBar secondsRemaining={timeRemaining} />
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        <aside className="w-56 shrink-0">
          <QuestionNavigatorSidebar
            questions={session.questions}
            activeIndex={activeIndex}
            visitedQuestionIds={visitedQuestionIds}
            onSelect={setActiveIndex}
          />
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface p-6">
          <QuestionPanel
            question={activeQuestion}
            index={activeIndex}
            total={session.questions.length}
            onSelectOptions={(ids) => selectOptions(activeQuestion.questionId, ids)}
            onTextChange={(text) => setTextDraft(activeQuestion.questionId, text)}
            onFileUpload={(file) => uploadFile(activeQuestion.questionId, file)}
            onBeforeFilePick={suppressNextBlur}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className="w-auto px-4"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                variant="secondary"
                onClick={() => clearAnswer(activeQuestion.questionId)}
                disabled={!hasContent}
                className="w-auto px-4"
              >
                <Eraser className="h-4 w-4" /> Clear Response
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  toggleMarkForReview(activeQuestion.questionId, isMarked);
                  goNext();
                }}
                className={`w-auto px-4 ${isMarked ? "border-violet-400 text-violet-300" : ""}`}
              >
                <Flag className="h-4 w-4" /> {isMarked ? "Unmark" : "Mark for Review"} & Next
              </Button>
            </div>

            <div className="flex gap-2">
              {!isLastQuestion ? (
                <>
                  <Button variant="secondary" onClick={goNext} className="w-auto px-4">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={goNext} className="w-auto px-5">
                    Save & Next
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-auto bg-accent-teal px-5 hover:bg-accent-teal/90"
                >
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      <SubmitConfirmDialog
        open={showSubmitConfirm}
        unansweredCount={unansweredCount}
        totalCount={session.questions.length}
        isSubmitting={isSubmitting}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={submitExam}
      />
    </div>
  );
}
