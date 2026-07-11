import apiClient from "./client";

export interface WorkReport {
  _id: string;
  complaintId: {
    _id: string;
    complaintId: string;
    issueType: string;
    consumerName: string;
    description: string;
    emergency: boolean;
    location: string;
    address: any;
  };
  workerId: {
    _id: string;
    name: string;
    phone: string;
    employeeId: string;
  };
  afterPhoto: string;
  workPerformed: string;
  conditionAfter: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export async function submitWorkReport(
  formData: FormData
): Promise<{ message: string; workReport: unknown; complaint: unknown }> {
  const { data } = await apiClient.post("/work-report/submit", formData);
  return data;
}

export async function getWorkReports(): Promise<WorkReport[]> {
  const { data } = await apiClient.get("/work-report");
  return data;
}

export async function approveWorkReport(id: string): Promise<{ message: string; report: WorkReport }> {
  const { data } = await apiClient.put(`/work-report/${id}/approve`);
  return data;
}

export async function rejectWorkReport(id: string): Promise<{ message: string; report: WorkReport }> {
  const { data } = await apiClient.put(`/work-report/${id}/reject`);
  return data;
}
