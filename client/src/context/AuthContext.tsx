import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Worker, LoginCredentials } from "../types";
import { loginWorker } from "../api/auth";

interface AuthContextType {
  worker: Worker | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("worker");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try {
        setWorker(JSON.parse(stored));
      } catch {
        localStorage.removeItem("worker");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginWorker(credentials);
    localStorage.setItem("token", response.token);
    localStorage.setItem("worker", JSON.stringify(response.worker));
    setWorker(response.worker);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("worker");
    setWorker(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        worker,
        isAuthenticated: !!worker,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
