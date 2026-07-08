import apiClient from "./client";
import type { AuthResponse, LoginCredentials } from "../types";

export async function loginWorker(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials
  );
  return data;
}

export async function seedWorker(payload: {
  employeeId: string;
  name: string;
  password: string;
}): Promise<{ message: string; worker: { id: string; employeeId: string; name: string; role: string } }> {
  const { data } = await apiClient.post("/auth/seed", payload);
  return data;
}
