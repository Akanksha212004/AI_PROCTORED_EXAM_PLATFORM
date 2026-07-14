import { Clock } from "lucide-react";

interface Props {
  secondsRemaining: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function ExamTimerBar({ secondsRemaining }: Props) {
  const isCritical = secondsRemaining <= 60;
  const isWarning = secondsRemaining <= 300 && !isCritical;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-lg font-semibold ${
        isCritical
          ? "border-accent-rose bg-accent-rose/10 text-accent-rose animate-pulse"
          : isWarning
          ? "border-amber-500 bg-amber-500/10 text-amber-400"
          : "border-border bg-surface-muted text-paper"
      }`}
    >
      <Clock className="h-5 w-5" />
      {formatTime(secondsRemaining)}
    </div>
  );
}
