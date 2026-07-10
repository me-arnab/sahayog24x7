import apiClient from "./client";
import type {
  AuthResponse,
  CitizenAuthResponse,
  LoginCredentials,
} from "../types";

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

export async function loginCitizen(payload: {
  identifier: string;
  password: string;
}): Promise<CitizenAuthResponse> {
  const { data } = await apiClient.post<CitizenAuthResponse>("/auth/login", {
    ...payload,
    accountType: "user",
  });
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
