import apiClient from "./client";
import type { Complaint } from "../types";

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
