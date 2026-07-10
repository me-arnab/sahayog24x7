import apiClient from "./client";
import type { Complaint, CitizenComplaint, CreateComplaintPayload } from "../types";

export async function getAssignedComplaints(): Promise<Complaint[]> {
  const { data } = await apiClient.get<Complaint[]>("/complaints");
  return data;
}

export async function getComplaintById(
  id: string
): Promise<Complaint> {
  const { data } = await apiClient.get<Complaint>(`/complaints/${id}`);
  return data;
}

export async function startWork(id: string): Promise<Complaint> {
  const { data } = await apiClient.put<Complaint>(`/complaints/${id}/start`);
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
