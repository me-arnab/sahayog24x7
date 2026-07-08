// ─── Auth ───
export interface Worker {
  id: string;
  employeeId: string;
  name: string;
  role: "FIELD_WORKER";
}

export interface AuthResponse {
  token: string;
  worker: Worker;
}

export interface LoginCredentials {
  employeeId: string;
  password: string;
}

// ─── Complaints ───
export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplaintStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "received"
  | "in-progress"
  | "resolved"
  | "escalated";

export interface Complaint {
  _id: string;
  complaintId: string;
  consumerName: string;
  address: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedWorker: string | null;
  startTime: string | null;
  endTime: string | null;
  timeTakenInSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Work Report ───
export interface WorkReportForm {
  complaintId: string;
  workPerformed: string;
  conditionAfter: string;
  afterPhoto: File | null;
}

// ─── User Complaint (local mock type for admin/user dashboards) ───
export type IssueType =
  | "Power Outage"
  | "Low Voltage"
  | "Sparking/Hazard"
  | "Meter Fault"
  | "Transformer Issue"
  | "Billing Issue";

export interface UserComplaint {
  id: string;
  citizenName: string;
  phone: string;
  location: string;
  zone: string;
  issueType: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: string;
  createdAt: string;
  photoUrls: string[];
  assignedTeam: string | null;
  isNew: boolean;
}

// ─── Dashboard Stats ───
export interface DashboardStats {
  total: number;
  pending: number;
  resolved: number;
  inProgress: number;
  assigned: number;
}
