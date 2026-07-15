// import { CheckCircle2, ClipboardList, FileQuestion, Send } from "lucide-react";

// import { Card } from "@/components/ui/Card";
// import type { ActivityType, RecentActivityItem } from "@/types/dashboard";

// interface Props {
//   activity: RecentActivityItem[];
//   isLoading: boolean;
// }

// const ICONS: Record<ActivityType, React.ReactNode> = {
//   question_added: <FileQuestion className="h-4 w-4" />,
//   exam_created: <ClipboardList className="h-4 w-4" />,
//   submission: <Send className="h-4 w-4" />,
//   graded: <CheckCircle2 className="h-4 w-4" />,
// };

// function relativeTime(iso: string): string {
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

// export function RecentActivityCard({ activity, isLoading }: Props) {
//   return (
//     <Card className="p-5">
//       <p className="mb-4 font-display text-base font-semibold text-paper">Recent Activity</p>
//       {isLoading ? (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
//           ))}
//         </div>
//       ) : activity.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted">No activity yet.</p>
//       ) : (
//         <ul className="space-y-3">
//           {activity.map((item, i) => (
//             <li key={i} className="flex items-start gap-3">
//               <div className="mt-0.5 rounded-md bg-accent-sky/10 p-1.5 text-accent-sky">{ICONS[item.type]}</div>
//               <div className="min-w-0 flex-1">
//                 <p className="text-sm text-paper">{item.message}</p>
//                 <p className="text-xs text-muted">{relativeTime(item.timestamp)}</p>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </Card>
//   );
// }




// import { CheckCircle2, ClipboardList, FileQuestion, Send } from "lucide-react";

// import { Card } from "@/components/ui/Card";
// import { cn } from "@/lib/utils";
// import type { ActivityType, RecentActivityItem } from "@/types/dashboard";

// interface Props {
//   activity: RecentActivityItem[];
//   isLoading: boolean;
// }

// const ICONS: Record<ActivityType, React.ReactNode> = {
//   question_added: <FileQuestion className="h-3.5 w-3.5" />,
//   exam_created: <ClipboardList className="h-3.5 w-3.5" />,
//   submission: <Send className="h-3.5 w-3.5" />,
//   graded: <CheckCircle2 className="h-3.5 w-3.5" />,
// };

// const DOT_COLOR: Record<ActivityType, string> = {
//   question_added: "border-accent-sky text-accent-sky",
//   exam_created: "border-accent-teal text-accent-teal",
//   submission: "border-accent-amber text-accent-amber",
//   graded: "border-accent-violet text-accent-violet",
// };

// function relativeTime(iso: string): string {
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

// export function RecentActivityCard({ activity, isLoading }: Props) {
//   return (
//     <Card className="p-5">
//       <p className="mb-5 font-display text-base font-semibold text-paper">Recent Activity</p>
//       {isLoading ? (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
//           ))}
//         </div>
//       ) : activity.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted">No activity yet.</p>
//       ) : (
//         <ul className="relative ml-1.5 space-y-5 border-l border-border pl-5">
//           {activity.map((item, i) => (
//             <li key={i} className="relative">
//               <span
//                 className={cn(
//                   "absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-ink",
//                   DOT_COLOR[item.type]
//                 )}
//               >
//                 {ICONS[item.type]}
//               </span>
//               <p className="text-sm text-paper">{item.message}</p>
//               <p className="mt-0.5 font-mono text-xs text-muted">{relativeTime(item.timestamp)}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </Card>
//   );
// }





import { CheckCircle2, ClipboardList, FileQuestion, Send } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ActivityType, RecentActivityItem } from "@/types/dashboard";

interface Props {
  activity: RecentActivityItem[];
  isLoading: boolean;
}

const ICONS: Record<ActivityType, React.ReactNode> = {
  question_added: <FileQuestion className="h-3.5 w-3.5" />,
  exam_created: <ClipboardList className="h-3.5 w-3.5" />,
  submission: <Send className="h-3.5 w-3.5" />,
  graded: <CheckCircle2 className="h-3.5 w-3.5" />,
};

const DOT_COLOR: Record<ActivityType, string> = {
  question_added: "border-accent-sky text-accent-sky",
  exam_created: "border-accent-teal text-accent-teal",
  submission: "border-accent-amber text-accent-amber",
  graded: "border-accent-violet text-accent-violet",
};

function relativeTime(iso: string): string {
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

export function RecentActivityCard({ activity, isLoading }: Props) {
  return (
    <Card interactive className="p-5 sm:p-6">
      <p className="mb-5 font-display text-base font-semibold text-paper">Recent Activity</p>
      {isLoading ? (
        <ul className="relative ml-1.5 space-y-5 border-l border-border pl-5">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] h-6 w-6 animate-pulse rounded-full border-2 border-border bg-surface-muted" />
              <div className="h-3.5 w-40 animate-pulse rounded bg-surface-muted" />
              <div className="mt-2 h-2.5 w-16 animate-pulse rounded bg-surface-muted" />
            </li>
          ))}
        </ul>
      ) : activity.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No activity yet.</p>
      ) : (
        <ul className="relative ml-1.5 space-y-5 border-l border-border pl-5">
          {activity.map((item, i) => (
            <li key={i} className="group relative">
              <span
                className={cn(
                  "absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-ink transition-transform duration-200 group-hover:scale-110",
                  DOT_COLOR[item.type]
                )}
              >
                {ICONS[item.type]}
              </span>
              <p className="text-sm text-paper transition-colors group-hover:text-accent-sky">{item.message}</p>
              <p className="mt-0.5 font-mono text-xs text-muted">{relativeTime(item.timestamp)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
