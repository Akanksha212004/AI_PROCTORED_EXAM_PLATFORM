"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";
import type { SessionQuestionView } from "@/types/examSession";

interface Props {
  questions: SessionQuestionView[];
  activeIndex: number;
  visitedQuestionIds: Set<string>;
  onSelect: (index: number) => void;
  /** Optional slot (the proctoring camera preview) rendered beside the
   *  color-coded legend, using the empty space next to it instead of
   *  floating over the page. */
  cameraSlot?: ReactNode;
}

function isAnswered(q: SessionQuestionView): boolean {
  if (!q.answer) return false;
  if (q.answer.selectedOptionIds.length > 0) return true;
  if (q.answer.submittedText && q.answer.submittedText.trim().length > 0) return true;
  if (q.answer.submittedFileUrl) return true;
  return false;
}

type PaletteState = "unvisited" | "answered" | "notAnswered" | "markedAnswered" | "markedNotAnswered";

function getState(q: SessionQuestionView, visited: boolean): PaletteState {
  const answered = isAnswered(q);
  const marked = q.answer?.markedForReview ?? false;

  if (marked) return answered ? "markedAnswered" : "markedNotAnswered";
  if (!visited) return "unvisited";
  return answered ? "answered" : "notAnswered";
}

const STATE_STYLES: Record<PaletteState, string> = {
  unvisited: "border-border text-muted hover:bg-white/5",
  answered: "border-accent-teal bg-accent-teal/15 text-accent-teal",
  notAnswered: "border-accent-rose bg-accent-rose/15 text-accent-rose",
  markedAnswered: "border-violet-400 bg-violet-400/15 text-violet-300",
  markedNotAnswered: "border-amber-500 bg-amber-500/15 text-amber-400",
};

const LEGEND: { state: PaletteState; labelKey: string; swatch: string }[] = [
  { state: "unvisited", labelKey: "examTaking.legend.notVisited", swatch: "border-border" },
  { state: "answered", labelKey: "examTaking.legend.answered", swatch: "border-accent-teal bg-accent-teal/15" },
  { state: "notAnswered", labelKey: "examTaking.legend.notAnswered", swatch: "border-accent-rose bg-accent-rose/15" },
  {
    state: "markedAnswered",
    labelKey: "examTaking.legend.markedForReviewAnswered",
    swatch: "border-violet-400 bg-violet-400/15",
  },
  {
    state: "markedNotAnswered",
    labelKey: "examTaking.legend.markedForReview",
    swatch: "border-amber-500 bg-amber-500/15",
  },
];

const QUESTIONS_PER_PAGE = 7;

/** Start index (inclusive) of a given page. Every page shows a full
 *  QUESTIONS_PER_PAGE window except when that would run past the end of
 *  the list — in that case the window slides back so the LAST page is
 *  also full (e.g. for 10 questions: page 0 = 1–7, page 1 = 4–10, not a
 *  sparse 8–10 with big gaps between three buttons). */
function pageStart(page: number, total: number): number {
  const start = page * QUESTIONS_PER_PAGE;
  const maxStart = Math.max(0, total - QUESTIONS_PER_PAGE);
  return Math.min(start, maxStart);
}

/** Which page a given question index falls on, accounting for the same
 *  sliding window (so opening the last question always lands on the last
 *  page, even though its window overlaps the previous one). */
function pageForIndex(index: number, total: number, totalPages: number): number {
  for (let p = totalPages - 1; p >= 0; p--) {
    if (index >= pageStart(p, total)) return p;
  }
  return 0;
}

export function QuestionNavigatorSidebar({
  questions,
  activeIndex,
  visitedQuestionIds,
  onSelect,
  cameraSlot,
}: Props) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE));
  const [page, setPage] = useState(() => pageForIndex(activeIndex, questions.length, totalPages));

  // Keep the visible page in sync with whichever question is currently open
  // (e.g. via the "Next"/"Previous" buttons elsewhere on the page).
  useEffect(() => {
    setPage(pageForIndex(activeIndex, questions.length, totalPages));
  }, [activeIndex, questions.length, totalPages]);

  const counts = questions.reduce(
    (acc, q) => {
      const state = getState(q, visitedQuestionIds.has(q.questionId));
      acc[state] += 1;
      return acc;
    },
    { unvisited: 0, answered: 0, notAnswered: 0, markedAnswered: 0, markedNotAnswered: 0 } as Record<PaletteState, number>
  );
  const markedTotal = counts.markedAnswered + counts.markedNotAnswered;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted">
        <div>
          {t("examTaking.summary.answered")}: <span className="text-accent-teal">{counts.answered}</span>
        </div>
        <div>
          {t("examTaking.summary.notAnswered")}: <span className="text-accent-rose">{counts.notAnswered}</span>
        </div>
        <div>
          {t("examTaking.summary.marked")}: <span className="text-violet-300">{markedTotal}</span>
        </div>
        <div>
          {t("examTaking.summary.notVisited")}: <span className="text-muted">{counts.unvisited}</span>
        </div>
      </div>

      {/* Mobile/tablet: single-row palette with prev/next arrows so it never
       *  wraps into extra rows. Desktop (lg+): unchanged from before — the
       *  original multi-row grid, no arrows. */}
      <div className="flex items-center gap-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label={t("examTaking.navigator.previousPage")}
          className="flex h-9 w-6 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-1 justify-between gap-1.5">
          {questions.slice(pageStart(page, questions.length), pageStart(page, questions.length) + QUESTIONS_PER_PAGE).map((q, iInPage) => {
            const i = pageStart(page, questions.length) + iInPage;
            const state = getState(q, visitedQuestionIds.has(q.questionId));
            const active = i === activeIndex;
            return (
              <button
                key={q.questionId}
                onClick={() => onSelect(i)}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                  STATE_STYLES[state],
                  active && "ring-2 ring-accent-sky ring-offset-2 ring-offset-surface"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          aria-label={t("examTaking.navigator.nextPage")}
          className="flex h-9 w-6 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {totalPages > 1 && (
        <p className="-mt-2 text-center text-[11px] text-muted lg:hidden">
          {pageStart(page, questions.length) + 1}
          {"\u2013"}
          {Math.min(pageStart(page, questions.length) + QUESTIONS_PER_PAGE, questions.length)} / {questions.length}
        </p>
      )}

      <div className="hidden grid-cols-4 gap-2 lg:grid">
        {questions.map((q, i) => {
          const state = getState(q, visitedQuestionIds.has(q.questionId));
          const active = i === activeIndex;
          return (
            <button
              key={q.questionId}
              onClick={() => onSelect(i)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                STATE_STYLES[state],
                active && "ring-2 ring-accent-sky ring-offset-2 ring-offset-surface"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-stretch gap-3">
        <div className="flex-1 space-y-1.5 text-xs text-muted">
          {LEGEND.map((item) => (
            <div key={item.state} className="flex items-center gap-2">
              <span className={cn("h-3 w-3 shrink-0 rounded border", item.swatch)} />
              {t(item.labelKey)}
            </div>
          ))}
        </div>
        {cameraSlot}
      </div>
    </div>
  );
}