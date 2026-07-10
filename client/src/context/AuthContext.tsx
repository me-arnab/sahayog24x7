import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  CitizenAuthResponse,
  CitizenLoginCredentials,
  CitizenUser,
  LoginCredentials,
  Worker,
} from "../types";
import { loginCitizen, loginWorker } from "../api/auth";

interface AuthContextType {
  worker: Worker | null;
  citizen: CitizenUser | null;
  displayName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWorker: (credentials: LoginCredentials) => Promise<void>;
  loginCitizen: (credentials: CitizenLoginCredentials) => Promise<void>;
  syncCitizenSession: (response: CitizenAuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "token";
const WORKER_KEY = "worker";
const CITIZEN_KEY = "citizen";
const SESSION_KEY = "sessionType";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [citizen, setCitizen] = useState<CitizenUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionType = localStorage.getItem(SESSION_KEY);
    const storedWorker = localStorage.getItem(WORKER_KEY);
    const storedCitizen = localStorage.getItem(CITIZEN_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    try {
      if (sessionType === "worker" && storedWorker && token) {
        setWorker(JSON.parse(storedWorker));
      } else if (sessionType === "user" && storedCitizen && token) {
        setCitizen(JSON.parse(storedCitizen));
      } else if (storedWorker && token) {
        setWorker(JSON.parse(storedWorker));
      } else if (storedCitizen && token) {
        setCitizen(JSON.parse(storedCitizen));
      }
    } catch {
      localStorage.removeItem(WORKER_KEY);
      localStorage.removeItem(CITIZEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    }

    setIsLoading(false);
  }, []);

  const loginAsWorker = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginWorker(credentials);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(WORKER_KEY, JSON.stringify(response.worker));
    localStorage.setItem(SESSION_KEY, "worker");
    localStorage.removeItem(CITIZEN_KEY);
    setWorker(response.worker);
    setCitizen(null);
  }, []);

  const syncCitizenSession = useCallback((response: CitizenAuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(CITIZEN_KEY, JSON.stringify(response.user));
    localStorage.setItem(SESSION_KEY, "user");
    localStorage.removeItem(WORKER_KEY);
    setCitizen(response.user);
    setWorker(null);
  }, []);

  const loginAsCitizen = useCallback(
    async (credentials: CitizenLoginCredentials) => {
      const response = await loginCitizen(credentials);
      syncCitizenSession(response);
    },
    [syncCitizenSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WORKER_KEY);
    localStorage.removeItem(CITIZEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setWorker(null);
    setCitizen(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        worker,
        citizen,
        displayName: worker?.name || citizen?.name || null,
        isAuthenticated: !!worker || !!citizen,
        isLoading,
        loginWorker: loginAsWorker,
        loginCitizen: loginAsCitizen,
        syncCitizenSession,
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
