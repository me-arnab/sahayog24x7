import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import type {
  CitizenAuthResponse,
  CitizenLoginCredentials,
  CitizenUser,
  LoginCredentials,
  Worker,
  AdminUser,
} from "../types";
import { loginCitizen, loginStaff } from "../api/auth";

interface AuthContextType {
  worker: Worker | null;
  admin: AdminUser | null;
  citizen: CitizenUser | null;
  displayName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginStaff: (credentials: LoginCredentials & { accountType: "worker" | "admin" }) => Promise<void>;
  loginCitizen: (credentials: CitizenLoginCredentials) => Promise<void>;
  syncCitizenSession: (response: CitizenAuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "token";
const WORKER_KEY = "worker";
const ADMIN_KEY = "admin";
const CITIZEN_KEY = "citizen";
const SESSION_KEY = "sessionType";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [citizen, setCitizen] = useState<CitizenUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionType = localStorage.getItem(SESSION_KEY);
    const storedWorker = localStorage.getItem(WORKER_KEY);
    const storedAdmin = localStorage.getItem(ADMIN_KEY);
    const storedCitizen = localStorage.getItem(CITIZEN_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    try {
      if (sessionType === "worker" && storedWorker && token) {
        setWorker(JSON.parse(storedWorker));
      } else if (sessionType === "admin" && storedAdmin && token) {
        setAdmin(JSON.parse(storedAdmin));
      } else if (sessionType === "user" && storedCitizen && token) {
        setCitizen(JSON.parse(storedCitizen));
      } else if (storedWorker && token) {
        setWorker(JSON.parse(storedWorker));
      } else if (storedAdmin && token) {
        setAdmin(JSON.parse(storedAdmin));
      } else if (storedCitizen && token) {
        setCitizen(JSON.parse(storedCitizen));
      }
    } catch {
      localStorage.removeItem(WORKER_KEY);
      localStorage.removeItem(ADMIN_KEY);
      localStorage.removeItem(CITIZEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    }

    setIsLoading(false);
  }, []);

  const handleLoginStaff = useCallback(
    async (credentials: LoginCredentials & { accountType: "worker" | "admin" }) => {
      const response = await loginStaff(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.removeItem(CITIZEN_KEY);
      setCitizen(null);

      if ("worker" in response) {
        localStorage.setItem(WORKER_KEY, JSON.stringify(response.worker));
        localStorage.setItem(SESSION_KEY, "worker");
        localStorage.removeItem(ADMIN_KEY);
        setWorker(response.worker);
        setAdmin(null);
      } else if ("user" in response && response.user.role === "admin") {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(response.user));
        localStorage.setItem(SESSION_KEY, "admin");
        localStorage.removeItem(WORKER_KEY);
        setAdmin(response.user as AdminUser);
        setWorker(null);
      }
    },
    []
  );

  const syncCitizenSession = useCallback((response: CitizenAuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(CITIZEN_KEY, JSON.stringify(response.user));
    localStorage.setItem(SESSION_KEY, "user");
    localStorage.removeItem(WORKER_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setCitizen(response.user);
    setWorker(null);
    setAdmin(null);
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
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(CITIZEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setWorker(null);
    setAdmin(null);
    setCitizen(null);
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        worker,
        admin,
        citizen,
        displayName: worker?.name || admin?.name || citizen?.name || null,
        isAuthenticated: !!worker || !!admin || !!citizen,
        isLoading,
        loginStaff: handleLoginStaff,
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
