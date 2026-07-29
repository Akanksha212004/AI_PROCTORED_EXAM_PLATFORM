
"use client";

import { Database, Eye, ShieldCheck, Timer } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";

type AuthPageKey = "login" | "register" | "examinerLogin" | "examinerRequest";

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Fallback English copy — used verbatim if i18nKey isn't provided. */
  eyebrow: string;
  title: string;
  subtitle: string;
  /** When set, the translated eyebrow/title/subtitle for this page take priority over the props above. */
  i18nKey?: AuthPageKey;
}

const FEATURE_HIGHLIGHTS = [
  { icon: Database, key: "authLayout.feature.questionBanks", accent: "text-accent-sky" },
  { icon: Timer, key: "authLayout.feature.timedSessions", accent: "text-accent-sky" },
  { icon: Eye, key: "authLayout.feature.liveProctoring", accent: "text-accent-teal" },
] as const;

export function AuthLayout({ children, eyebrow, title, subtitle, i18nKey }: AuthLayoutProps) {
  const { t } = useLanguage();

  const resolvedEyebrow = i18nKey ? t(`${i18nKey}.eyebrow`) : eyebrow;
  const resolvedTitle = i18nKey ? t(`${i18nKey}.title`) : title;
  const resolvedSubtitle = i18nKey ? t(`${i18nKey}.subtitle`) : subtitle;

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

        <div className="relative z-10 flex items-center text-paper">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-accent-sky" strokeWidth={2} />
            <span className="font-display text-lg font-semibold tracking-tight">
              {t("authLayout.brand")}
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
            {resolvedEyebrow}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-paper">
            {t("authLayout.headingLine1")}
            <br />
            {t("authLayout.headingLine2")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-paper/60">{t("authLayout.description")}</p>

          {/* Signature element: feature highlights — honest, static, no fake live data */}
          <div className="mt-10 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
            {FEATURE_HIGHLIGHTS.map(({ icon: Icon, key, accent }) => (
              <div key={key} className="flex items-center gap-3">
                <Icon className={`h-[18px] w-[18px] shrink-0 ${accent}`} strokeWidth={2} />
                <span className="text-sm text-paper">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-mono text-[11px] text-paper/30">
          © {new Date().getFullYear()} {t("authLayout.brand")} — {t("authLayout.footer")}
        </p>
      </div>

      {/* Right — form panel */}
      <div className="relative flex items-center justify-center border-t border-border bg-ink px-6 py-12 lg:border-l lg:border-t-0">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2 text-paper">
              <ShieldCheck className="h-6 w-6 text-accent-sky" strokeWidth={2} />
              <span className="font-display text-lg font-semibold tracking-tight">
                {t("authLayout.brand")}
              </span>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="absolute right-8 top-6 z-20 hidden lg:block">
            <LanguageSwitcher />
          </div>

          <p className="mb-1 mt-4 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky lg:mt-0">
            {resolvedEyebrow}
          </p>
          <h2 className="mb-2 font-display text-2xl font-semibold text-paper">{resolvedTitle}</h2>
          <p className="mb-8 text-sm text-paper/60">{resolvedSubtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
