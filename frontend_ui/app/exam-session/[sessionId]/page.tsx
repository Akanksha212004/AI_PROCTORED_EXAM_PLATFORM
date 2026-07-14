"use client";

// app/exam-session/[sessionId]/page.tsx
//
// Deliberately OUTSIDE DashboardShell — an active exam should be
// distraction-free (no sidebar/nav chrome).

import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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
    selectOptions,
    setTextDraft,
    uploadFile,
    submitExam,
  } = useExamSession(params.sessionId);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const handleExceeded = useCallback(() => {
    submitExam();
  }, [submitExam]);

  const isActive = Boolean(session && session.status === "IN_PROGRESS");

  const { isFullscreen, requestFullscreen } = useProctoringSignals({
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your exam...
      </div>
    );
  }

  if (finalResult && finalResult.status !== "IN_PROGRESS") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-xl font-semibold text-paper">
            {finalResult.status === "AUTO_SUBMITTED" ? "Exam Auto-Submitted" : "Exam Submitted"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {finalResult.status === "AUTO_SUBMITTED"
              ? "Your time ran out (or a proctoring limit was reached), so your exam was submitted automatically."
              : "Your answers have been recorded."}
          </p>
          {typeof finalResult.autoGradedMarks === "number" && (
            <p className="mt-4 text-sm text-paper">
              Auto-graded score so far:{" "}
              <span className="font-semibold text-accent-sky">{finalResult.autoGradedMarks}</span>
            </p>
          )}
          {Boolean(finalResult.pendingSubjectiveCount) && (
            <p className="mt-1 text-xs text-muted">
              {finalResult.pendingSubjectiveCount} answer(s) are awaiting examiner review before your final score is
              ready.
            </p>
          )}
          <Button onClick={() => router.push("/dashboard/student/exams")} className="mt-6 w-auto px-5">
            Back to My Exams
          </Button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const activeQuestion = session.questions[activeIndex];

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
            onSelect={setActiveIndex}
          />
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface p-6">
          {activeQuestion && (
            <QuestionPanel
              question={activeQuestion}
              index={activeIndex}
              total={session.questions.length}
              onSelectOptions={(ids) => selectOptions(activeQuestion.questionId, ids)}
              onTextChange={(text) => setTextDraft(activeQuestion.questionId, text)}
              onFileUpload={(file) => uploadFile(activeQuestion.questionId, file)}
            />
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <Button
              variant="secondary"
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className="w-auto px-4"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            {activeIndex < session.questions.length - 1 ? (
              <Button onClick={() => setActiveIndex((i) => i + 1)} className="w-auto px-4">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitConfirm(true)}
                className="w-auto bg-accent-teal px-5 hover:bg-accent-teal/90"
              >
                Submit Exam
              </Button>
            )}
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
