// "use client";

// import {
//   BarChart3,
//   ClipboardCheck,
//   ClipboardList,
//   FileBarChart,
//   FileQuestion,
//   LayoutDashboard,
//   Radio,
//   Settings,
//   ShieldCheck,
//   Users,
//   X,
// } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// import { cn } from "@/lib/utils";
// import type { UserRole } from "@/types/auth";

// interface NavItem {
//   href: string;
//   label: string;
//   icon: React.ReactNode;
//   /** Only match this exact path (used for dashboard "home" links so they don't stay lit on sub-routes). */
//   exact?: boolean;
// }

// interface NavGroup {
//   items: NavItem[];
//   /** Renders as a muted, non-interactive preview of what's on the roadmap. */
//   comingSoon?: boolean;
// }

// const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
//   EXAMINER: [
//     {
//       items: [
//         { href: "/dashboard/examiner", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
//         { href: "/dashboard/examiner/questions", label: "Question Bank", icon: <FileQuestion className="h-[18px] w-[18px]" /> },
//         { href: "/dashboard/examiner/exams", label: "Exam Configuration", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
//         { href: "/dashboard/examiner/submissions", label: "Submissions", icon: <ClipboardCheck className="h-[18px] w-[18px]" /> },
//         { href: "/dashboard/examiner/live-sessions", label: "Live Sessions", icon: <Radio className="h-[18px] w-[18px]" /> },
//         { href: "/dashboard/examiner/students", label: "Students", icon: <Users className="h-[18px] w-[18px]" /> },
//       ],
//     },
//     {
//       comingSoon: true,
//       items: [
//         { href: "#", label: "Reports", icon: <FileBarChart className="h-[18px] w-[18px]" /> },
//         { href: "#", label: "Analytics", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
//         { href: "#", label: "Settings", icon: <Settings className="h-[18px] w-[18px]" /> },
//       ],
//     },
//   ],
//   STUDENT: [
//     {
//       items: [
//         { href: "/dashboard/student", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
//         { href: "/dashboard/student/exams", label: "My Exams", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
//       ],
//     },
//   ],
//   ADMIN: [
//     {
//       items: [
//         { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
//       ],
//     },
//   ],
// };

// interface Props {
//   role: UserRole;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function Sidebar({ role, isOpen, onClose }: Props) {
//   const pathname = usePathname();
//   const groups = NAV_BY_ROLE[role] ?? [];

//   return (
//     <>
//       {/* Mobile scrim */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/60 lg:hidden"
//           onClick={onClose}
//           aria-hidden="true"
//         />
//       )}

//       <aside
//         className={cn(
//           "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0",
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         )}
//       >
//         <div className="flex items-center justify-between px-5 py-5">
//           <div className="flex items-center gap-2 text-paper">
//             <ShieldCheck className="h-5 w-5 text-accent-sky" strokeWidth={2} />
//             <span className="font-display text-base font-semibold tracking-tight">ProctorEd</span>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-paper/60 transition-colors hover:text-paper lg:hidden"
//             aria-label="Close menu"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
//           {groups.map((group, gi) => (
//             <div key={gi}>
//               {group.comingSoon && (
//                 <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-paper/30">
//                   Coming soon
//                 </p>
//               )}
//               <ul className="space-y-1">
//                 {group.items.map((item) => {
//                   if (group.comingSoon) {
//                     return (
//                       <li key={item.label}>
//                         <span
//                           className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-paper/30"
//                           title="Coming soon"
//                         >
//                           {item.icon}
//                           {item.label}
//                         </span>
//                       </li>
//                     );
//                   }

//                   const active = item.exact
//                     ? pathname === item.href
//                     : pathname === item.href || pathname?.startsWith(`${item.href}/`);

//                   return (
//                     <li key={item.href}>
//                       <Link
//                         href={item.href}
//                         onClick={onClose}
//                         className={cn(
//                           "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
//                           active
//                             ? "bg-accent-sky/10 text-accent-sky"
//                             : "text-paper/70 hover:bg-white/5 hover:text-paper"
//                         )}
//                       >
//                         {item.icon}
//                         {item.label}
//                       </Link>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           ))}
//         </nav>
//       </aside>
//     </>
//   );
// }







"use client";

import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileQuestion,
  LayoutDashboard,
  Radio,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Only match this exact path (used for dashboard "home" links so they don't stay lit on sub-routes). */
  exact?: boolean;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  EXAMINER: [
    { href: "/dashboard/examiner", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
    { href: "/dashboard/examiner/questions", label: "Question Bank", icon: <FileQuestion className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/exams", label: "Exam Configuration", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/submissions", label: "Submissions", icon: <ClipboardCheck className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/live-sessions", label: "Live Sessions", icon: <Radio className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/students", label: "Students", icon: <Users className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/reports", label: "Reports", icon: <FileBarChart className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/analytics", label: "Analytics", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/settings", label: "Settings", icon: <Settings className="h-[18px] w-[18px]" /> },
  ],
  STUDENT: [
    { href: "/dashboard/student", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
    { href: "/dashboard/student/exams", label: "My Exams", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
  ],
};

interface Props {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: Props) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role] ?? [];

  return (
    <>
      {/* Mobile scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 text-paper">
            <ShieldCheck className="h-5 w-5 text-accent-sky" strokeWidth={2} />
            <span className="font-display text-base font-semibold tracking-tight">ProctorEd</span>
          </div>
          <button
            onClick={onClose}
            className="text-paper/60 transition-colors hover:text-paper lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-accent-sky/10 text-accent-sky"
                        : "text-paper/70 hover:bg-white/5 hover:text-paper"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
