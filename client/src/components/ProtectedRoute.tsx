import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NavSkeleton } from "./layout/NavSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("user" | "admin" | "worker")[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { citizen, admin, worker, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex overflow-hidden">
        {/* Empty placeholder for Sidebar area */}
        <div className="hidden lg:block w-72 bg-white border-r border-border shrink-0" />
        <NavSkeleton />
      </div>
    );
  }

  // Determine the current user's role
  let currentRole: "user" | "admin" | "worker" | null = null;
  if (citizen) currentRole = "user";
  else if (admin) currentRole = "admin";
  else if (worker) currentRole = "worker";

  // If not logged in, redirect to the appropriate login page based on what they are trying to access
  if (!currentRole) {
    if (allowedRoles.includes("admin") || allowedRoles.includes("worker")) {
      return <Navigate to="/staff/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // If logged in but wrong role, redirect to their respective dashboard
  if (!allowedRoles.includes(currentRole)) {
    if (currentRole === "user") return <Navigate to="/user/dashboard" replace />;
    if (currentRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (currentRole === "worker") return <Navigate to="/worker/dashboard" replace />;
  }

  return <>{children}</>;
};
