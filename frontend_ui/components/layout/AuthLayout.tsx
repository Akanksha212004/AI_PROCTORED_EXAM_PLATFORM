"use client";

import { Database, Eye, ShieldCheck, Timer } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/hooks/useI18n";

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Dot-path translation keys (e.g. "auth.login.eyebrow") — NOT literal strings. */
  eyebrowKey: string;
  titleKey: string;
  subtitleKey: string;
}

const FEATURE_HIGHLIGHTS = [
  { icon: Database, labelKey: "authLayout.features.questionBanks", gradient: "bg-tone-sky" },
  { icon: Timer, labelKey: "authLayout.features.timedSessions", gradient: "bg-tone-violet" },
  { icon: Eye, labelKey: "authLayout.features.liveProctoring", gradient: "bg-tone-teal" },
];

export function AuthLayout({ children, eyebrowKey, titleKey, subtitleKey }: AuthLayoutProps) {
  const { t } = useI18n();
  const eyebrow = t(eyebrowKey);
  const title = t(titleKey);
  const subtitle = t(subtitleKey);

  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      {/* Left — brand / signature panel (hidden on small screens) */}
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Soft gradient wash + grid — replaces the flat ink background with something more alive. */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(63,167,232,0.18), transparent 45%), radial-gradient(circle at 85% 85%, rgba(139,127,232,0.16), transparent 50%), radial-gradient(circle at 90% 5%, rgba(20,184,166,0.12), transparent 40%)",
          }}
        />
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
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand shadow-md shadow-accent-sky/25">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">ProctorEd</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
            {eyebrow}
          </p>
          <h1 className="bg-brand bg-clip-text font-display text-4xl font-semibold leading-tight text-transparent">
            {t("authLayout.heading1")}
            <br />
            {t("authLayout.heading2")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-paper/60">
            {t("authLayout.subtitle")}
          </p>

          {/* Signature element: feature highlights — honest, static, no fake live data */}
          <div className="mt-10 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            {FEATURE_HIGHLIGHTS.map(({ icon: Icon, labelKey, gradient }) => (
              <div key={labelKey} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${gradient} shadow-sm`}>
                  <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                </span>
                <span className="text-sm text-paper">{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        <p suppressHydrationWarning className="relative z-10 font-mono text-[11px] text-paper/30">
          {t("authLayout.footer").replace("{year}", String(new Date().getFullYear()))}
        </p>
      </div>

      {/* Right — form panel */}
      <div className="relative flex items-center justify-center border-t border-border bg-ink bg-page-glow px-6 py-12 lg:border-l lg:border-t-0">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 text-paper lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand shadow-md shadow-accent-sky/25">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">ProctorEd</span>
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
