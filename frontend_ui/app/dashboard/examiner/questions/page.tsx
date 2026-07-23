// "use client";

// // app/dashboard/examiner/questions/page.tsx
// //
// // Role gating: this project has components/auth/RoleGuard.tsx already,
// // but its exact prop API wasn't shared, so rather than guess (and risk
// // another guess-and-debug loop like the backend), this page gates
// // itself directly off `useAuth()` — which IS fully known. If you'd
// // rather use RoleGuard for consistency with your other pages, swap the
// // block below for `<RoleGuard allow={["EXAMINER"]}>...</RoleGuard>` —
// // paste RoleGuard.tsx and I'll do that swap for you.

// import { FileUp, Loader2, Plus } from "lucide-react";
// import { useMemo, useState } from "react";
// import { useRouter } from "next/navigation";

// import { useAuth } from "@/hooks/useAuth";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { useQuestions } from "@/hooks/useQuestions";
// import { useQuestionStats } from "@/hooks/useQuestionStats";
// import { Card } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { QuestionStatsCards } from "@/components/questions/QuestionStatsCards";
// import { QuestionFilters, type FilterState } from "@/components/questions/QuestionFilters";
// import { QuestionTable } from "@/components/questions/QuestionTable";
// import { Pagination } from "@/components/ui/Pagination";
// import { QuestionFormDialog } from "@/components/questions/QuestionFormDialog";
// import { QuestionViewModal } from "@/components/questions/QuestionViewModal";
// import { DeleteQuestionDialog } from "@/components/questions/DeleteQuestionDialog";
// import { BulkImportDialog } from "@/components/questions/BulkImportDialog";
// import type { Question } from "@/types/question";

// const PAGE_SIZE = 10;

// export default function QuestionBankPage() {
//   const { user, isLoading: isAuthLoading } = useAuth();
//   const router = useRouter();

//   const [filters, setFilters] = useState<FilterState>({
//     search: "",
//     subject: "",
//     questionType: "",
//     difficultyLevel: "",
//   });
//   const [page, setPage] = useState(1);

//   const listFilters = useMemo(
//     () => ({
//       search: filters.search || undefined,
//       subject: filters.subject || undefined,
//       questionType: filters.questionType || undefined,
//       difficultyLevel: filters.difficultyLevel || undefined,
//       page,
//       limit: PAGE_SIZE,
//     }),
//     [filters, page]
//   );

//   const { items, pagination, isLoading, refetch } = useQuestions(listFilters);
//   const { stats, isLoading: isStatsLoading, refetchStats } = useQuestionStats();

//   const [formState, setFormState] = useState<{ open: boolean; mode: "create" | "edit"; question: Question | null }>(
//     { open: false, mode: "create", question: null }
//   );
//   const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
//   const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
//   const [bulkImportOpen, setBulkImportOpen] = useState(false);

//   const subjectOptions = stats?.subjects ?? [];

//   function handleFilterChange(next: FilterState) {
//     setFilters(next);
//     setPage(1);
//   }

//   function handleSaved() {
//     refetch();
//     refetchStats();
//   }

//   function handleDeleted() {
//     refetch();
//     refetchStats();
//   }

//   // ── Auth / role gate ──────────────────────────────────────────
//   if (isAuthLoading) {
//     return (
//       <div className="flex h-[60vh] items-center justify-center text-muted">
//         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//         Checking access...
//       </div>
//     );
//   }

//   if (!user || user.role.toUpperCase() !== "EXAMINER") {
//     // Students (and anyone else) never see this module.
//     if (typeof window !== "undefined") router.replace("/login");
//     return null;
//   }

//   return (
//     <DashboardShell>
//     <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="font-display text-2xl font-semibold text-paper">Question Bank</h1>
//           <p className="text-sm text-muted">Create, organize, and manage exam questions.</p>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant="secondary"
//             onClick={() => setBulkImportOpen(true)}
//             className="w-auto px-4"
//           >
//             <FileUp className="h-4 w-4" />
//             Bulk Import
//           </Button>
//           <Button
//             onClick={() => setFormState({ open: true, mode: "create", question: null })}
//             className="w-auto px-4"
//           >
//             <Plus className="h-4 w-4" />
//             New Question
//           </Button>
//         </div>
//       </div>

//       <QuestionStatsCards stats={stats} isLoading={isStatsLoading} />

//       <Card className="p-5">
//         <QuestionFilters value={filters} onChange={handleFilterChange} subjectOptions={subjectOptions} />
//       </Card>

//       <Card className="p-5">
//         <QuestionTable
//           questions={items}
//           isLoading={isLoading}
//           page={pagination.page}
//           limit={pagination.limit}
//           onView={setViewingQuestion}
//           onEdit={(q) => setFormState({ open: true, mode: "edit", question: q })}
//           onDelete={setDeletingQuestion}
//         />
//         <Pagination pagination={pagination} onPageChange={setPage} />
//       </Card>

//       <QuestionFormDialog
//         open={formState.open}
//         mode={formState.mode}
//         initialQuestion={formState.question}
//         onClose={() => setFormState((s) => ({ ...s, open: false }))}
//         onSaved={handleSaved}
//       />

//       <QuestionViewModal question={viewingQuestion} onClose={() => setViewingQuestion(null)} />

//       <DeleteQuestionDialog
//         question={deletingQuestion}
//         onClose={() => setDeletingQuestion(null)}
//         onDeleted={handleDeleted}
//       />

//       <BulkImportDialog
//         open={bulkImportOpen}
//         onClose={() => setBulkImportOpen(false)}
//         onImported={handleSaved}
//       />
//     </div>
//     </DashboardShell>
//   );
// }






"use client";

// app/dashboard/examiner/questions/page.tsx
//
// Role gating: this project has components/auth/RoleGuard.tsx already,
// but its exact prop API wasn't shared, so rather than guess (and risk
// another guess-and-debug loop like the backend), this page gates
// itself directly off `useAuth()` — which IS fully known. If you'd
// rather use RoleGuard for consistency with your other pages, swap the
// block below for `<RoleGuard allow={["EXAMINER"]}>...</RoleGuard>` —
// paste RoleGuard.tsx and I'll do that swap for you.

import { FileUp, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useQuestions } from "@/hooks/useQuestions";
import { useQuestionStats } from "@/hooks/useQuestionStats";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QuestionStatsCards } from "@/components/questions/QuestionStatsCards";
import { QuestionFilters, type FilterState } from "@/components/questions/QuestionFilters";
import { QuestionTable } from "@/components/questions/QuestionTable";
import { Pagination } from "@/components/ui/Pagination";
import { QuestionFormDialog } from "@/components/questions/QuestionFormDialog";
import { QuestionViewModal } from "@/components/questions/QuestionViewModal";
import { DeleteQuestionDialog } from "@/components/questions/DeleteQuestionDialog";
import { BulkImportDialog } from "@/components/questions/BulkImportDialog";
import type { Question } from "@/types/question";

const PAGE_SIZE = 10;

export default function QuestionBankPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    subject: "",
    questionType: "",
    difficultyLevel: "",
  });
  const [page, setPage] = useState(1);

  const listFilters = useMemo(
    () => ({
      search: filters.search || undefined,
      subject: filters.subject || undefined,
      questionType: filters.questionType || undefined,
      difficultyLevel: filters.difficultyLevel || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [filters, page]
  );

  const { items, pagination, isLoading, refetch } = useQuestions(listFilters);
  const { stats, isLoading: isStatsLoading, refetchStats } = useQuestionStats();

  const [formState, setFormState] = useState<{ open: boolean; mode: "create" | "edit"; question: Question | null }>(
    { open: false, mode: "create", question: null }
  );
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const subjectOptions = stats?.subjects ?? [];

  function handleFilterChange(next: FilterState) {
    setFilters(next);
    setPage(1);
  }

  function handleSaved() {
    refetch();
    refetchStats();
  }

  function handleDeleted() {
    refetch();
    refetchStats();
  }

  // ── Auth / role gate ──────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Checking access...
      </div>
    );
  }

  if (!user || user.role.toUpperCase() !== "EXAMINER") {
    // Students (and anyone else) never see this module.
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  return (
    <DashboardShell>
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">Question Bank</h1>
          <p className="text-sm text-muted">Create, organize, and manage exam questions.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setBulkImportOpen(true)}
            className="w-auto px-4"
          >
            <FileUp className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button
            onClick={() => setFormState({ open: true, mode: "create", question: null })}
            className="w-auto px-4"
          >
            <Plus className="h-4 w-4" />
            New Question
          </Button>
        </div>
      </div>

      <QuestionStatsCards stats={stats} isLoading={isStatsLoading} />

      <Card className="p-5">
        <QuestionFilters value={filters} onChange={handleFilterChange} subjectOptions={subjectOptions} />
      </Card>

      <Card className="p-5">
        <QuestionTable
          questions={items}
          isLoading={isLoading}
          page={pagination.page}
          limit={pagination.limit}
          onView={setViewingQuestion}
          onEdit={(q) => setFormState({ open: true, mode: "edit", question: q })}
          onDelete={setDeletingQuestion}
        />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      <QuestionFormDialog
        open={formState.open}
        mode={formState.mode}
        initialQuestion={formState.question}
        onClose={() => setFormState((s) => ({ ...s, open: false }))}
        onSaved={handleSaved}
      />

      <QuestionViewModal question={viewingQuestion} onClose={() => setViewingQuestion(null)} />

      <DeleteQuestionDialog
        question={deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        onDeleted={handleDeleted}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImported={handleSaved}
      />
    </div>
    </DashboardShell>
  );
}