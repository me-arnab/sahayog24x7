import apiClient from "./client";

export async function submitWorkReport(
  formData: FormData
): Promise<{ message: string; workReport: unknown; complaint: unknown }> {
  const { data } = await apiClient.post("/work-report/submit", formData);
  return data;
}

export async function getWorkReports(): Promise<unknown[]> {
  const { data } = await apiClient.get("/work-report");
  return data;
}
