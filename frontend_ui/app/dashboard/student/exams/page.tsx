// "use client";

// // app/dashboard/student/exams/page.tsx

// import { CalendarClock, Loader2, PlayCircle } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { examSessionService } from "@/services/examSessionService";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import type { AvailableExam } from "@/types/examSession";

// export default function StudentExamsPage() {
//   return (
//     <RoleGuard allowedRole="STUDENT">
//       <DashboardShell>
//         <StudentExamsContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// function examStatus(exam: AvailableExam): { label: string; canStart: boolean } {
//   const now = Date.now();
//   const start = new Date(exam.startTime).getTime();
//   const end = new Date(exam.endTime).getTime();
//   if (now < start) return { label: "Upcoming", canStart: false };
//   if (now > end) return { label: "Ended", canStart: false };
//   return { label: "Live now", canStart: true };
// }

// function StudentExamsContent() {
//   const router = useRouter();
//   const [exams, setExams] = useState<AvailableExam[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [startingId, setStartingId] = useState<string | null>(null);

//   useEffect(() => {
//     examSessionService
//       .listAvailable()
//       .then(setExams)
//       .catch((err) => toast.error(extractExamErrorMessage(err)))
//       .finally(() => setIsLoading(false));
//   }, []);

//   async function handleStart(examId: string) {
//     setStartingId(examId);
//     try {
//       const session = await examSessionService.startSession(examId);
//       router.push(`/exam-session/${session.id}`);
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//       setStartingId(null);
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="font-display text-2xl font-semibold text-paper">My Exams</h1>
//         <p className="text-sm text-muted">Exams you can take now or that are coming up.</p>
//       </div>

//       {isLoading ? (
//         <div className="flex items-center justify-center py-20 text-muted">
//           <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
//         </div>
//       ) : exams.length === 0 ? (
//         <Card className="py-16 text-center text-sm text-muted">No exams are available right now.</Card>
//       ) : (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           {exams.map((exam) => {
//             const status = examStatus(exam);
//             return (
//               <Card key={exam.id} className="flex flex-col gap-3 p-5">
//                 <div>
//                   <p className="font-medium text-paper">{exam.title}</p>
//                   <p className="text-sm text-muted">{exam.subject}</p>
//                 </div>
//                 <div className="flex items-center gap-2 text-xs text-muted">
//                   <CalendarClock className="h-4 w-4" />
//                   {new Date(exam.startTime).toLocaleString()} · {exam.durationMinutes} min
//                 </div>
//                 <Button
//                   onClick={() => handleStart(exam.id)}
//                   disabled={!status.canStart}
//                   isLoading={startingId === exam.id}
//                   className="mt-1 w-auto px-4"
//                 >
//                   <PlayCircle className="h-4 w-4" />
//                   {status.canStart ? "Start Exam" : status.label}
//                 </Button>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }






"use client";

// app/dashboard/student/exams/page.tsx

import { CalendarClock, Loader2, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { AvailableExam } from "@/types/examSession";

export default function StudentExamsPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <StudentExamsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function examStatus(exam: AvailableExam): { label: string; canStart: boolean } {
  const now = Date.now();
  const start = new Date(exam.startTime).getTime();
  const end = new Date(exam.endTime).getTime();
  if (now < start) return { label: "Upcoming", canStart: false };
  if (now > end) return { label: "Ended", canStart: false };
  return { label: "Live now", canStart: true };
}

function StudentExamsContent() {
  const router = useRouter();
  const [exams, setExams] = useState<AvailableExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    examSessionService
      .listAvailable()
      .then(setExams)
      .catch((err) => toast.error(extractExamErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleStart(examId: string) {
    setStartingId(examId);
    try {
      const session = await examSessionService.startSession(examId);
      router.push(`/exam-session/${session.id}`);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
      setStartingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">My Exams</h1>
        <p className="text-sm text-muted">Exams you can take now or that are coming up.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : exams.length === 0 ? (
        <Card className="py-16 text-center text-sm text-muted">No exams are available right now.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {exams.map((exam) => {
            const status = examStatus(exam);
            return (
              <Card key={exam.id} className="flex flex-col gap-3 p-5">
                <div>
                  <p className="font-medium text-paper">{exam.title}</p>
                  <p className="text-sm text-muted">{exam.subject}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <CalendarClock className="h-4 w-4" />
                  {new Date(exam.startTime).toLocaleString()} · {exam.durationMinutes} min
                </div>
                <Button
                  onClick={() => handleStart(exam.id)}
                  disabled={!status.canStart}
                  isLoading={startingId === exam.id}
                  className="mt-1 w-auto px-4"
                >
                  <PlayCircle className="h-4 w-4" />
                  {status.canStart ? "Start Exam" : status.label}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
