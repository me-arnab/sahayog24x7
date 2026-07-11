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

export interface CitizenUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  consumerId: string;
  role: "user";
}

export interface CitizenAuthResponse {
  token: string;
  user: CitizenUser;
  message: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export interface AdminAuthResponse {
  token: string;
  user: AdminUser;
}

export interface CitizenLoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginCredentials {
  employeeId: string;
  identifier?: string;
  password: string;
}

// ─── Complaints ───
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface StructuredAddress {
  state?: string;
  district?: string;
  subDivision?: string;
  block?: string;
  gramPanchayat?: string;
  municipality?: string;
  wardNumber?: string;
  village?: string;
  locality?: string;
  road?: string;
  houseNumber?: string;
  pinCode?: string;
  fullAddress?: string;
}

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
  emergency: boolean;
  status: ComplaintStatus;
  assignedWorker: string | null;
  startTime: string | null;
  endTime: string | null;
  timeTakenInSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenComplaint {
  _id: string;
  complaintId: string;
  userId: string | null;
  consumerName: string;
  phone: string;
  location: string | LocationData;
  issueType: string;
  address: string | StructuredAddress;
  addressType?: "RURAL" | "URBAN";
  locationMethod?: "GPS" | "MANUAL";
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  capturedAt?: string;
  state?: string;
  district?: string;
  subDivision?: string;
  block?: string;
  gramPanchayat?: string;
  municipality?: string;
  wardNumber?: string;
  village?: string;
  locality?: string;
  road?: string;
  houseNumber?: string;
  pinCode?: string;
  fullAddress?: string;
  description: string;
  emergency: boolean;
  status: "received" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "in-progress" | "resolved" | "escalated";
  priority: string;
  photos: string[];
  assignedWorker: string | null;
  assignedTeam: string | null;
  startTime: string | null;
  endTime: string | null;
  timeTakenInSeconds: number | null;
  resolutionNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintPayload {
  name: string;
  phone: string;
  consumerId: string;
  location?: string | LocationData;
  issueType: string;
  address?: string | StructuredAddress;
  addressType?: "RURAL" | "URBAN";
  locationMethod?: "GPS" | "MANUAL";
  description: string;
  emergency: boolean;
  priority?: string;
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
  issueType: string;
  description: string;
  emergency: boolean;
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

// ─── Contact Messages ───
export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "resolved";
  createdAt: string;
  updatedAt: string;
}
