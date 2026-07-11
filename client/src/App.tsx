import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import StaffLogin from "./pages/StaffLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";

import AdminNotices from "./pages/AdminNotices";
import AddWorker from "./pages/AddWorker";
import AddAdmin from "./pages/AddAdmin";
import UserNotices from "./pages/UserNotices";
import WorkerNotices from "./pages/WorkerNotices";
import WorkerSubmittedComplaints from "./pages/WorkerSubmittedComplaints";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminComplaints from "./pages/AdminComplaints";
import AdminWorkReports from "./pages/AdminWorkReports";

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
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={["user", "admin", "worker"]}><DashboardLayout /></ProtectedRoute>}>
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
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminComplaints />
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
            <Route
              path="/admin/add-worker"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AddWorker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AddAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminContactMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminWorkReports />
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
              path="/worker/submitted"
              element={
                <ProtectedRoute allowedRoles={["worker"]}>
                  <WorkerSubmittedComplaints />
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
          </Route>
        </Routes>
      </AuthProvider>
      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;