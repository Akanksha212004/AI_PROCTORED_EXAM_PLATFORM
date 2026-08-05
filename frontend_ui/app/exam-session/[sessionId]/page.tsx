"use client";

// app/exam-session/[sessionId]/page.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Flag, Eraser } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/Button";
import { useExamSession } from "@/hooks/useExamSession";
import { useI18n } from "@/hooks/useI18n";
import { useProctoringSignals } from "@/hooks/useProctoringSignals";
import { useFaceMonitoring } from "@/hooks/useFaceMonitoring";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { ExamTimerBar } from "@/components/exam-taking/ExamTimerBar";
import { QuestionNavigatorSidebar } from "@/components/exam-taking/QuestionNavigatorSidebar";
import { QuestionPanel } from "@/components/exam-taking/QuestionPanel";
import { SubmitConfirmDialog } from "@/components/exam-taking/SubmitConfirmDialog";
import { FullScreenGate } from "@/components/exam-taking/FullScreenGate";
import { ProctoringCameraWidget } from "@/components/exam-taking/ProctoringCameraWidget";
import { PreExamChecklist } from "@/components/exam-taking/PreExamChecklist";

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
  const { t } = useI18n();
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
  // Gates the real exam UI (fullscreen enforcement, camera monitoring,
  // question rendering) behind the guidelines/permissions checklist —
  // set once the student explicitly clicks "Begin Exam".
  const [hasStartedExam, setHasStartedExam] = useState(false);

  const handleExceeded = useCallback(() => {
    submitExam();
  }, [submitExam]);

  const isActive = Boolean(session && session.status === "IN_PROGRESS") && hasStartedExam;

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
    mobileDeviceDetected,
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

  function handleBeginExam() {
    // Fire the fullscreen request synchronously inside this click
    // handler (not inside a later effect) so browsers that require a
    // direct user gesture for the Fullscreen API still allow it.
    if (session?.exam.fullScreenModeEnabled && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    }
    setHasStartedExam(true);
  }

  const activeQuestion = session?.questions[activeIndex];

  // Dynamic (examiner-authored) exam title/subject — translated the same
  // way as question content. Called unconditionally (before any early
  // return below) per the Rules of Hooks; falls back to "" when the
  // session hasn't loaded yet.
  const { translated: translatedExamMeta } = useTranslatedTexts([
    session?.exam.title ?? "",
    session?.exam.subject ?? "",
  ]);
  const translatedExamTitle = translatedExamMeta[0] || session?.exam.title || "";
  const translatedExamSubject = translatedExamMeta[1] || session?.exam.subject || "";

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
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("examTaking.loadingExam")}
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
            {finalResult.status === "AUTO_SUBMITTED"
              ? t("examTaking.examAutoSubmitted")
              : t("examTaking.examSubmittedSuccessfully")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t("examTaking.responsesRecorded")}
            {Boolean(finalResult.pendingSubjectiveCount) && ` ${t("examTaking.pendingSubjectiveNote")}`}
          </p>
          <p className="mt-6 text-xs text-muted">
            {t("examTaking.redirectingIn")} {countdown}...
          </p>
        </div>
      </div>
    );
  }

  if (!session || !activeQuestion) return null;

  // Guidelines + camera/mic permission + acknowledgement, shown once
  // before any question is revealed.
  if (session.status === "IN_PROGRESS" && !hasStartedExam) {
    return (
      <PreExamChecklist
        examTitle={translatedExamTitle}
        examSubject={translatedExamSubject}
        durationMinutes={session.exam.durationMinutes}
        fullScreenModeEnabled={session.exam.fullScreenModeEnabled}
        webcamMonitoringEnabled={session.exam.webcamMonitoringEnabled}
        audioMonitoringEnabled={session.exam.audioMonitoringEnabled}
        multiFaceDetectionEnabled={session.exam.multiFaceDetectionEnabled}
        negativeMarkingEnabled={session.exam.negativeMarkingEnabled}
        maxTabSwitchWarnings={session.exam.maxTabSwitchWarnings}
        onBegin={handleBeginExam}
      />
    );
  }

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
    <div className="min-h-screen overflow-x-hidden bg-ink">
      {session.exam.fullScreenModeEnabled && !isFullscreen && (
        <FullScreenGate onRequestFullscreen={requestFullscreen} />
      )}

      {session.exam.webcamMonitoringEnabled && (
        <ProctoringCameraWidget
          status={cameraStatus}
          faceCount={faceCount}
          gazeDirection={gazeDirection}
          mobileDeviceDetected={mobileDeviceDetected}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
      )}

      <header className="flex flex-col gap-2 border-b border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 pr-28 sm:pr-0">
          <p className="truncate font-medium text-paper">{translatedExamTitle}</p>
          <p className="truncate text-xs text-muted">{translatedExamSubject}</p>
        </div>
        <ExamTimerBar secondsRemaining={timeRemaining} />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <QuestionNavigatorSidebar
            questions={session.questions}
            activeIndex={activeIndex}
            visitedQuestionIds={visitedQuestionIds}
            onSelect={setActiveIndex}
          />
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <QuestionPanel
            question={activeQuestion}
            index={activeIndex}
            total={session.questions.length}
            onSelectOptions={(ids) => selectOptions(activeQuestion.questionId, ids)}
            onTextChange={(text) => setTextDraft(activeQuestion.questionId, text)}
            onFileUpload={(file) => uploadFile(activeQuestion.questionId, file)}
            onBeforeFilePick={suppressNextBlur}
            onFilePicked={session.exam.fullScreenModeEnabled ? requestFullscreen : undefined}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className="w-auto px-4"
              >
                <ChevronLeft className="h-4 w-4" /> {t("examTaking.previous")}
              </Button>

              <Button
                variant="secondary"
                onClick={() => clearAnswer(activeQuestion.questionId)}
                disabled={!hasContent}
                className="w-auto px-4"
              >
                <Eraser className="h-4 w-4" /> {t("examTaking.clearResponse")}
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  toggleMarkForReview(activeQuestion.questionId, isMarked);
                  goNext();
                }}
                className={`w-auto px-4 ${isMarked ? "border-violet-400 text-violet-300" : ""}`}
              >
                <Flag className="h-4 w-4" /> {isMarked ? t("examTaking.unmark") : t("examTaking.markForReview")}{" "}
                {t("examTaking.andNext")}
              </Button>
            </div>

            <div className="flex gap-2">
              {!isLastQuestion ? (
                <>
                  <Button variant="secondary" onClick={goNext} className="w-auto px-4">
                    {t("examTaking.next")} <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={goNext} className="w-auto px-5">
                    {t("examTaking.saveAndNext")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-auto bg-accent-teal px-5 hover:bg-accent-teal/90"
                >
                  {t("examTaking.submitExam")}
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
