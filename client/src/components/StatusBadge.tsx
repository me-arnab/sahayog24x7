import type { NoticeStatus } from "../types/notice";

interface StatusBadgeProps {
  status: NoticeStatus;
}

const statusStyles: Record<NoticeStatus, string> = {
  Active: "bg-green-50 text-green-700",
  Scheduled: "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const statusIcons: Record<NoticeStatus, string> = {
  Active: "fas fa-check-circle",
  Scheduled: "fas fa-clock",
  Inactive: "fas fa-pause-circle",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-flex items-center gap-1.5 ${statusStyles[status]}`}
    >
      <i className={statusIcons[status]}></i>
      {status}
    </span>
  );
}

interface NoticeTypeBadgeProps {
  type: string;
}

const typeStyles: Record<string, string> = {
  Maintenance: "bg-blue-50 text-blue-700",
  Payment: "bg-purple-50 text-purple-700",
  Outage: "bg-red-50 text-red-700",
  General: "bg-slate-100 text-slate-700",
};

export function NoticeTypeBadge({ type }: NoticeTypeBadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${typeStyles[type] || "bg-slate-100 text-slate-700"}`}
    >
      {type}
    </span>
  );
}
