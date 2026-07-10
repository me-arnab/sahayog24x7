import apiClient from "./client";
import type {
  AuthResponse,
  AdminAuthResponse,
  CitizenAuthResponse,
  LoginCredentials,
} from "../types";

export async function loginStaff(
  credentials: LoginCredentials & { accountType: "worker" | "admin" }
): Promise<AuthResponse | AdminAuthResponse> {
  const { data } = await apiClient.post<AuthResponse | AdminAuthResponse>(
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

export async function loginCitizen(payload: {
  identifier: string;
  password: string;
}): Promise<CitizenAuthResponse> {
  const { data } = await apiClient.post<CitizenAuthResponse>("/auth/login-citizen", payload);
  return data;
}

export async function registerCitizen(payload: {
  name: string;
  email: string;
  phone: string;
  consumerId: string;
  password: string;
}): Promise<CitizenAuthResponse> {
  const { data } = await apiClient.post<CitizenAuthResponse>(
    "/auth/register",
    payload
  );
  return data;
}
