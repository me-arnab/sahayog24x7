import apiClient from "./client";
import type {
  Notice,
  NoticeFormData,
  NoticeStats,
  NoticesResponse,
} from "../types/notice";

export interface GetNoticesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  sort?: "newest" | "oldest";
}

export async function getNotices(
  params: GetNoticesParams = {}
): Promise<NoticesResponse> {
  const { data } = await apiClient.get<NoticesResponse>("/notices", {
    params,
  });
  return data;
}

export async function getNotice(id: string): Promise<Notice> {
  const { data } = await apiClient.get<Notice>(`/notices/${id}`);
  return data;
}

export async function createNotice(
  payload: NoticeFormData
): Promise<{ message: string; notice: Notice }> {
  const { data } = await apiClient.post<{
    message: string;
    notice: Notice;
  }>("/notices", payload);
  return data;
}

export async function updateNotice(
  id: string,
  payload: Partial<NoticeFormData>
): Promise<{ message: string; notice: Notice }> {
  const { data } = await apiClient.put<{
    message: string;
    notice: Notice;
  }>(`/notices/${id}`, payload);
  return data;
}

export async function deleteNotice(
  id: string
): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(
    `/notices/${id}`
  );
  return data;
}

export async function toggleNoticeStatus(
  id: string
): Promise<{ message: string; notice: Notice }> {
  const { data } = await apiClient.patch<{
    message: string;
    notice: Notice;
  }>(`/notices/${id}/status`);
  return data;
}

export async function getNoticeStats(): Promise<NoticeStats> {
  const { data } = await apiClient.get<NoticeStats>("/notices/stats");
  return data;
}

export async function getConsumerNotices(): Promise<Notice[]> {
  const { data } = await apiClient.get<Notice[]>("/notices/consumer");
  return data;
}
