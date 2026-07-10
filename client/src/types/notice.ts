// ─── Notice Types ───

export type NoticeType = "Maintenance" | "Payment" | "Outage" | "General";

export type NoticeAudience =
  | "All Consumers"
  | "Zone"
  | "Ward"
  | "Consumer Group";

export type NoticeStatus = "Active" | "Scheduled" | "Inactive";

export interface Notice {
  _id: string;
  title: string;
  message: string;
  type: NoticeType;
  audience: NoticeAudience;
  status: NoticeStatus;
  startDate: string;
  endDate: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeFormData {
  title: string;
  message: string;
  type: NoticeType;
  audience: NoticeAudience;
  status: NoticeStatus;
  startDate: string;
  endDate: string;
}

export interface NoticeStats {
  total: number;
  active: number;
  scheduled: number;
  inactive: number;
}

export interface NoticesResponse {
  notices: Notice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
