import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import StaffLogin from "./pages/StaffLogin";
import Register from "./pages/Register";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";

import AdminNotices from "./pages/AdminNotices";
import UserNotices from "./pages/UserNotices";
import WorkerNotices from "./pages/WorkerNotices";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/register" element={<Register />} />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/notices"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserNotices />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminNotices />
              </ProtectedRoute>
            }
          />

          {/* Worker Routes */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worker/notices"
            element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerNotices />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;