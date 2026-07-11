import apiClient from "./client";
import type { Complaint, CitizenComplaint, CreateComplaintPayload } from "../types";

export async function getAssignedComplaints(): Promise<CitizenComplaint[]> {
  const { data } = await apiClient.get<CitizenComplaint[]>("/complaints");
  return data;
}

export async function getComplaintById(
  id: string
): Promise<CitizenComplaint> {
  const { data } = await apiClient.get<CitizenComplaint>(`/complaints/${id}`);
  return data;
}

export async function startWork(id: string): Promise<CitizenComplaint> {
  const { data } = await apiClient.put<CitizenComplaint>(`/complaints/${id}/start`);
  return data;
}

export async function getMyComplaints(): Promise<CitizenComplaint[]> {
  const { data } = await apiClient.get<CitizenComplaint[]>("/complaints/mine");
  return data;
}

export async function createComplaint(
  payload: CreateComplaintPayload
): Promise<{ message: string; complaint: CitizenComplaint }> {
  const { data } = await apiClient.post<{ message: string; complaint: CitizenComplaint }>(
    "/complaints",
    payload
  );
  return data;
}

export async function getAdminComplaints(): Promise<CitizenComplaint[]> {
  const { data } = await apiClient.get<CitizenComplaint[]>("/complaints/admin");
  return data;
}

export async function assignComplaintWorker(
  complaintId: string,
  workerId: string
): Promise<{ message: string; complaint: CitizenComplaint }> {
  const { data } = await apiClient.put<{ message: string; complaint: CitizenComplaint }>(
    `/complaints/${complaintId}/assign`,
    { workerId }
  );
  return data;
}

export async function updateComplaintStatus(
  complaintId: string,
  status: string
): Promise<{ message: string; complaint: CitizenComplaint }> {
  const { data } = await apiClient.put<{ message: string; complaint: CitizenComplaint }>(
    `/complaints/${complaintId}/status`,
    { status }
  );
  return data;
}
