"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { QuestionPagination } from "@/types/question";

interface Props {
  pagination: QuestionPagination;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: Props) {
  const { page, totalPages, total, limit } = pagination;
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-1 py-4 sm:flex-row">
      <p className="text-sm text-muted">
        Showing <span className="text-paper">{start}</span>–<span className="text-paper">{end}</span> of{" "}
        <span className="text-paper">{total}</span> questions
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-paper transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-muted">
          Page <span className="text-paper">{page}</span> of {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-paper transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
