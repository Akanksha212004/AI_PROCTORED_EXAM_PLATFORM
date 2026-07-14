// import { ShieldCheck } from "lucide-react";

// interface AuthLayoutProps {
//   children: React.ReactNode;
//   eyebrow: string;
//   title: string;
//   subtitle: string;
// }

// export function AuthLayout({ children, eyebrow, title, subtitle }: AuthLayoutProps) {
//   return (
//     <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
//       {/* Left — brand / signature panel (hidden on small screens) */}
//       <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
//         <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
//           <div
//             className="h-full w-full"
//             style={{
//               backgroundImage:
//                 "linear-gradient(#E6F3FC 1px, transparent 1px), linear-gradient(90deg, #E6F3FC 1px, transparent 1px)",
//               backgroundSize: "36px 36px",
//             }}
//           />
//         </div>

//         <div className="relative z-10 flex items-center gap-2 text-paper">
//           <ShieldCheck className="h-6 w-6 text-accent-sky" strokeWidth={2} />
//           <span className="font-display text-lg font-semibold tracking-tight">ProctorEd</span>
//         </div>

//         <div className="relative z-10 max-w-md">
//           <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
//             {eyebrow}
//           </p>
//           <h1 className="font-display text-4xl font-semibold leading-tight text-paper">
//             Exams, invigilated
//             <br />
//             by design.
//           </h1>
//           <p className="mt-4 text-sm leading-relaxed text-paper/60">
//             One identity across question banks, timed exam sessions, and live AI proctoring —
//             built to scale with every module your institution adds.
//           </p>

//           {/* Signature element: live monitoring status card */}
//           <div className="relative mt-10 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
//             <div
//               className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-accent-teal/25 to-transparent animate-scanline"
//               aria-hidden="true"
//             />
//             <div className="relative z-10 flex items-center justify-between">
//               <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">
//                 Session Status
//               </span>
//               <span className="flex items-center gap-1.5">
//                 <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-pulseDot" />
//                 <span className="font-mono text-[11px] uppercase tracking-widest text-accent-teal">
//                   Monitoring
//                 </span>
//               </span>
//             </div>
//             <div className="relative z-10 mt-4 flex items-end justify-between">
//               <div>
//                 <p className="font-mono text-[11px] text-paper/40">Exam Code</p>
//                 <p className="font-mono text-lg tabular-nums text-paper">CS-401-B7K2</p>
//               </div>
//               <div className="text-right">
//                 <p className="font-mono text-[11px] text-paper/40">Time Remaining</p>
//                 <p className="font-mono text-lg tabular-nums text-paper">42:18</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <p className="relative z-10 font-mono text-[11px] text-paper/30">
//           © {new Date().getFullYear()} ProctorEd — Internal Platform
//         </p>
//       </div>

//       {/* Right — form panel */}
//       <div className="flex items-center justify-center border-t border-border bg-ink px-6 py-12 lg:border-l lg:border-t-0">
//         <div className="w-full max-w-sm">
//           <div className="mb-8 lg:hidden">
//             <div className="flex items-center gap-2 text-paper">
//               <ShieldCheck className="h-6 w-6 text-accent-sky" strokeWidth={2} />
//               <span className="font-display text-lg font-semibold tracking-tight">ProctorEd</span>
//             </div>
//           </div>

//           <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
//             {eyebrow}
//           </p>
//           <h2 className="mb-2 font-display text-2xl font-semibold text-paper">{title}</h2>
//           <p className="mb-8 text-sm text-paper/60">{subtitle}</p>

//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }



import { Database, Eye, ShieldCheck, Timer } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const FEATURE_HIGHLIGHTS = [
  { icon: Database, label: "Question banks by subject", accent: "text-accent-sky" },
  { icon: Timer, label: "Timed, randomized sessions", accent: "text-accent-sky" },
  { icon: Eye, label: "Live AI proctoring", accent: "text-accent-teal" },
];

export function AuthLayout({ children, eyebrow, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left — brand / signature panel (hidden on small screens) */}
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#E6F3FC 1px, transparent 1px), linear-gradient(90deg, #E6F3FC 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-paper">
          <ShieldCheck className="h-6 w-6 text-accent-sky" strokeWidth={2} />
          <span className="font-display text-lg font-semibold tracking-tight">ProctorEd</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-paper">
            Exams, invigilated
            <br />
            by design.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-paper/60">
            One identity across question banks, timed exam sessions, and live AI proctoring —
            built to scale with every module your institution adds.
          </p>

          {/* Signature element: feature highlights — honest, static, no fake live data */}
          <div className="mt-10 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
            {FEATURE_HIGHLIGHTS.map(({ icon: Icon, label, accent }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className={`h-[18px] w-[18px] shrink-0 ${accent}`} strokeWidth={2} />
                <span className="text-sm text-paper">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-mono text-[11px] text-paper/30">
          © {new Date().getFullYear()} ProctorEd — Internal Platform
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center border-t border-border bg-ink px-6 py-12 lg:border-l lg:border-t-0">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-paper">
              <ShieldCheck className="h-6 w-6 text-accent-sky" strokeWidth={2} />
              <span className="font-display text-lg font-semibold tracking-tight">ProctorEd</span>
            </div>
          </div>

          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
            {eyebrow}
          </p>
          <h2 className="mb-2 font-display text-2xl font-semibold text-paper">{title}</h2>
          <p className="mb-8 text-sm text-paper/60">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
