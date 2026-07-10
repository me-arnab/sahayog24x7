import type { NoticeStats as NoticeStatsData } from "../types/notice";

interface NoticeStatsProps {
  stats: NoticeStatsData;
}

const statCards = [
  {
    label: "Total Notices",
    key: "total" as const,
    icon: "fas fa-bullhorn",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Active Notices",
    key: "active" as const,
    icon: "fas fa-check-circle",
    color: "bg-green-50 text-green-700",
  },
  {
    label: "Scheduled Notices",
    key: "scheduled" as const,
    icon: "fas fa-clock",
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "Inactive Notices",
    key: "inactive" as const,
    icon: "fas fa-pause-circle",
    color: "bg-slate-100 text-slate-600",
  },
];

export function NoticeStats({ stats }: NoticeStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-sm:grid-cols-1">
      {statCards.map((s) => (
        <div
          key={s.key}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              {s.label}
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${s.color}`}
            >
              <i className={s.icon}></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-navy">
            {stats[s.key]}
          </div>
        </div>
      ))}
    </div>
  );
}
