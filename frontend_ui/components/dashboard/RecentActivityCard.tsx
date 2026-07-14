import { CheckCircle2, ClipboardList, FileQuestion, Send } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { ActivityType, RecentActivityItem } from "@/types/dashboard";

interface Props {
  activity: RecentActivityItem[];
  isLoading: boolean;
}

const ICONS: Record<ActivityType, React.ReactNode> = {
  question_added: <FileQuestion className="h-4 w-4" />,
  exam_created: <ClipboardList className="h-4 w-4" />,
  submission: <Send className="h-4 w-4" />,
  graded: <CheckCircle2 className="h-4 w-4" />,
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
    <Card className="p-5">
      <p className="mb-4 font-display text-base font-semibold text-paper">Recent Activity</p>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : activity.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {activity.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-accent-sky/10 p-1.5 text-accent-sky">{ICONS[item.type]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-paper">{item.message}</p>
                <p className="text-xs text-muted">{relativeTime(item.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
