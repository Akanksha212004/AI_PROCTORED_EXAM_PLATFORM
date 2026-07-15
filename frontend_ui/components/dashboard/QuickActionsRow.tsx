// import { FileQuestion, Plus, Radio, Send } from "lucide-react";
// import Link from "next/link";

// interface Action {
//   href: string;
//   icon: React.ReactNode;
//   label: string;
// }

// const ACTIONS: Action[] = [
//   {
//     href: "/dashboard/examiner/exams",
//     icon: <Plus className="h-4 w-4" />,
//     label: "Create Exam",
//   },
//   {
//     href: "/dashboard/examiner/questions",
//     icon: <FileQuestion className="h-4 w-4" />,
//     label: "Add Question",
//   },
//   {
//     href: "/dashboard/examiner/submissions",
//     icon: <Send className="h-4 w-4" />,
//     label: "Review Submissions",
//   },
//   {
//     href: "/dashboard/examiner/live-sessions",
//     icon: <Radio className="h-4 w-4" />,
//     label: "Monitor Live Sessions",
//   },
// ];

// export function QuickActionsRow() {
//   return (
//     <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//       {ACTIONS.map((action) => (
//         <Link
//           key={action.href}
//           href={action.href}
//           className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-paper transition-colors hover:border-accent-sky hover:bg-surface-muted"
//         >
//           <span className="text-accent-sky">{action.icon}</span>
//           {action.label}
//         </Link>
//       ))}
//     </div>
//   );
// }





import { FileQuestion, Plus, Radio, Send } from "lucide-react";
import Link from "next/link";

interface Action {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const ACTIONS: Action[] = [
  {
    href: "/dashboard/examiner/exams",
    icon: <Plus className="h-4 w-4" />,
    label: "Create Exam",
  },
  {
    href: "/dashboard/examiner/questions",
    icon: <FileQuestion className="h-4 w-4" />,
    label: "Add Question",
  },
  {
    href: "/dashboard/examiner/submissions",
    icon: <Send className="h-4 w-4" />,
    label: "Review Submissions",
  },
  {
    href: "/dashboard/examiner/live-sessions",
    icon: <Radio className="h-4 w-4" />,
    label: "Monitor Live Sessions",
  },
];

export function QuickActionsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-paper shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-sky/50 hover:shadow-glow-sky"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10 text-accent-sky transition-transform duration-200 group-hover:scale-110">
            {action.icon}
          </span>
          <span className="truncate">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
