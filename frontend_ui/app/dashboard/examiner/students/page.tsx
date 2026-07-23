// "use client";

// import { Search, Users } from "lucide-react";
// import Link from "next/link";
// import { useState } from "react";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { useStudents, type StudentListItem } from "@/hooks/useStudents";
// import { cn } from "@/lib/utils";

// export default function StudentsPage() {
//   return (
//     <RoleGuard allowedRole="EXAMINER">
//       <DashboardShell>
//         <StudentsContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// function relativeTime(iso: string | null): string {
//   if (!iso) return "Never";
//   const diffMs = Date.now() - new Date(iso).getTime();
//   const minutes = Math.floor(diffMs / 60000);
//   if (minutes < 1) return "just now";
//   if (minutes < 60) return `${minutes}m ago`;
//   const hours = Math.floor(minutes / 60);
//   if (hours < 24) return `${hours}h ago`;
//   const days = Math.floor(hours / 24);
//   if (days < 7) return `${days}d ago`;
//   return new Date(iso).toLocaleDateString();
// }

// function StudentsContent() {
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const { items, total, totalPages, isLoading } = useStudents(search, page, 10);

//   function handleSearchSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setPage(1);
//     setSearch(searchInput);
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">Students</h1>
//           <p className="mt-1.5 text-sm text-paper/60">
//             {total > 0 ? `${total} student${total === 1 ? "" : "s"} have taken your exams` : "Students who take your exams show up here"}
//           </p>
//         </div>

//         <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
//           <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/40" />
//           <input
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             placeholder="Search by name or email"
//             className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-paper placeholder:text-paper/40 focus:border-accent-sky focus:outline-none"
//           />
//         </form>
//       </div>

//       <Card className="overflow-hidden p-0">
//         {isLoading ? (
//           <div className="space-y-3 p-6">
//             {[...Array(6)].map((_, i) => (
//               <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
//             ))}
//           </div>
//         ) : items.length === 0 ? (
//           <div className="flex flex-col items-center gap-3 py-16 text-center">
//             <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-paper/30">
//               <Users className="h-6 w-6" />
//             </span>
//             <p className="text-sm text-muted">
//               {search ? `No students match "${search}"` : "No students have taken your exams yet."}
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[720px] text-left text-sm">
//               <thead>
//                 <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
//                   <th className="px-5 py-3 font-medium">Student</th>
//                   <th className="px-5 py-3 font-medium">Exams Taken</th>
//                   <th className="px-5 py-3 font-medium">Average Score</th>
//                   <th className="px-5 py-3 font-medium">Last Active</th>
//                   <th className="px-5 py-3 font-medium">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((student) => (
//                   <StudentRow key={student.id} student={student} />
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {totalPages > 1 && (
//           <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
//             <p className="text-xs text-muted">
//               Page {page} of {totalPages}
//             </p>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page <= 1}
//                 className="rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page >= totalPages}
//                 className="rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }

// function StudentRow({ student }: { student: StudentListItem }) {
//   return (
//     <tr className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
//       <td className="px-5 py-3.5">
//         <Link href={`/dashboard/examiner/students/${student.id}`} className="block">
//           <p className="font-medium text-paper hover:text-accent-sky">{student.name}</p>
//           <p className="text-xs text-muted">{student.email}</p>
//         </Link>
//       </td>
//       <td className="px-5 py-3.5 text-paper/80">{student.examsTaken}</td>
//       <td className="px-5 py-3.5 text-paper/80">
//         {student.averageScore !== null ? `${student.averageScore}%` : "—"}
//       </td>
//       <td className="px-5 py-3.5 font-mono text-xs text-muted">{relativeTime(student.lastActive)}</td>
//       <td className="px-5 py-3.5">
//         <span
//           className={cn(
//             "rounded-full px-2.5 py-1 text-xs font-medium",
//             student.isActive ? "bg-accent-teal/10 text-accent-teal" : "bg-paper/5 text-paper/40"
//           )}
//         >
//           {student.isActive ? "Active" : "Inactive"}
//         </span>
//       </td>
//     </tr>
//   );
// }






"use client";

import { Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useStudents, type StudentListItem } from "@/hooks/useStudents";
import { cn } from "@/lib/utils";

export default function StudentsPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <StudentsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function StudentsContent() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { items, total, totalPages, isLoading } = useStudents(search, page, 10);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">Students</h1>
          <p className="mt-1.5 text-sm text-paper/60">
            {total > 0 ? `${total} student${total === 1 ? "" : "s"} have taken your exams` : "Students who take your exams show up here"}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-paper placeholder:text-paper/40 focus:border-accent-sky focus:outline-none"
          />
        </form>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-paper/30">
              <Users className="h-6 w-6" />
            </span>
            <p className="text-sm text-muted">
              {search ? `No students match "${search}"` : "No students have taken your exams yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Exams Taken</th>
                  <th className="px-5 py-3 font-medium">Average Score</th>
                  <th className="px-5 py-3 font-medium">Last Active</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((student) => (
                  <StudentRow key={student.id} student={student} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
            <p className="text-xs text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function StudentRow({ student }: { student: StudentListItem }) {
  return (
    <tr className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
      <td className="px-5 py-3.5">
        <Link href={`/dashboard/examiner/students/${student.id}`} className="block">
          <p className="font-medium text-paper hover:text-accent-sky">{student.name}</p>
          <p className="text-xs text-muted">{student.email}</p>
        </Link>
      </td>
      <td className="px-5 py-3.5 text-paper/80">{student.examsTaken}</td>
      <td className="px-5 py-3.5 text-paper/80">
        {student.averageScore !== null ? `${student.averageScore}%` : "—"}
      </td>
      <td className="px-5 py-3.5 font-mono text-xs text-muted">{relativeTime(student.lastActive)}</td>
      <td className="px-5 py-3.5">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            student.isActive ? "bg-accent-teal/10 text-accent-teal" : "bg-paper/5 text-paper/40"
          )}
        >
          {student.isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
