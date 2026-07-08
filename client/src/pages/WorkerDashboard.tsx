import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAssignedComplaints,
  getComplaintById,
  startWork,
} from "../api/complaints";
import { submitWorkReport } from "../api/workReport";
import type { Complaint } from "../types";

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { worker, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    workPerformed: "",
    conditionAfter: "",
    photo: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const notify = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  const loadComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAssignedComplaints();
      setComplaints(data);
    } catch {
      notify("Failed to load complaints", "error");
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isAuthenticated) {
      loadComplaints();
    }
  }, [authLoading, isAuthenticated, navigate, loadComplaints]);

  const stats = {
    total: complaints.length,
    inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
    completed: complaints.filter((c) => c.status === "COMPLETED").length,
    assigned: complaints.filter((c) => c.status === "ASSIGNED").length,
  };

  const handleViewDetail = async (id: string) => {
    try {
      const complaint = await getComplaintById(id);
      setSelectedComplaint(complaint);
    } catch {
      const local = complaints.find((c) => c._id === id);
      if (local) setSelectedComplaint(local);
    }
  };

  const handleStartWork = async (id: string) => {
    try {
      const updated = await startWork(id);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? updated : c))
      );
      setSelectedComplaint(updated);
      notify("Work started! Status updated to IN PROGRESS");
    } catch {
      notify("Failed to start work", "error");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("complaintId", selectedComplaint.complaintId);
      formData.append("workPerformed", reportForm.workPerformed);
      formData.append("conditionAfter", reportForm.conditionAfter);
      if (reportForm.photo) {
        formData.append("afterPhoto", reportForm.photo);
      }

      await submitWorkReport(formData);
      notify("Work report submitted successfully!");
      setShowReportModal(false);
      setReportForm({ workPerformed: "", conditionAfter: "", photo: null });
      loadComplaints();
    } catch {
      notify("Failed to submit report", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-[#4ecdc4] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Ambient Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          opacity: 0.05,
        }}
      />

      <div className="max-w-[1400px] mx-auto p-5">
        {/* Navbar */}
        <nav className="bg-white/20 backdrop-blur-xl p-5 rounded-2xl mb-5 flex justify-between items-center shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-white/20">
          <div className="flex items-center gap-3">
            <img
              src="/frontend/assets/logo.png"
              className="w-[40px] h-[40px]"
              alt="logo"
            />
            <span className="font-bold text-xl">
              Sahayog<span className="text-[#4a90e2]">24x7</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold cursor-pointer">
              👤 {worker?.name || worker?.employeeId}
            </span>
            <button
              onClick={logout}
              className="bg-transparent border border-[#e2e8f0] px-4 py-2 rounded-xl cursor-pointer
                text-sm transition-all hover:bg-[#f1f5f9] flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </nav>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8 max-md:grid-cols-2 max-sm:grid-cols-1">
          {[
            { label: "Total Assigned", value: stats.total, icon: "fas fa-clipboard-list", color: "#4a90e2" },
            { label: "In Progress", value: stats.inProgress, icon: "fas fa-tools", color: "#ffa502" },
            { label: "Completed", value: stats.completed, icon: "fas fa-check-circle", color: "#2ed573" },
            { label: "Assigned", value: stats.assigned, icon: "fas fa-clock", color: "#64748b" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/20
                shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#64748b] font-medium">{s.label}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ color: s.color, background: `${s.color}15` }}
                >
                  <i className={s.icon}></i>
                </div>
              </div>
              <div className="text-3xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Complaints Section */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-tasks"></i> My Assigned Complaints
            </h2>
            <button
              onClick={loadComplaints}
              className="bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-lg text-xs cursor-pointer
                transition-all hover:bg-[#d0e7e6] flex items-center gap-1"
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-[#4ecdc4] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-[#64748b]">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-10 text-[#64748b]">
              <i className="fas fa-inbox text-4xl mb-3 block opacity-50"></i>
              No complaints assigned to you yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleViewDetail(c._id)}
                  className="border border-[#e2e8f0] rounded-xl p-5 cursor-pointer transition-all
                    bg-[#fafcff] hover:border-[#95ccdd] hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-dashed border-[#e2e8f0]">
                    <span className="font-semibold text-sm">{c.complaintId}</span>
                    <span className="text-xs text-[#64748b]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium flex items-center gap-2 mb-1">
                      <i className="fas fa-exclamation-circle text-[#4a90e2]"></i>
                      {c.consumerName}
                    </div>
                    <p className="text-xs text-[#64748b] ml-6">{c.description.substring(0, 80)}...</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        c.status === "ASSIGNED"
                          ? "bg-[#fef3c7] text-[#b45309]"
                          : c.status === "IN_PROGRESS"
                          ? "bg-[#e0e7ff] text-[#4338ca]"
                          : "bg-[#dcfce7] text-[#166534]"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        c.priority === "HIGH" || c.priority === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : c.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && !showReportModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-[#f1f5f9] flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <i className="fas fa-file-alt"></i> Complaint Details
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-2xl cursor-pointer text-[#64748b] hover:text-[#1e293b] bg-transparent border-none leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#64748b] text-xs font-medium uppercase tracking-wide mb-1">
                    Complaint ID
                  </p>
                  <p className="font-semibold">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <p className="text-[#64748b] text-xs font-medium uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      selectedComplaint.status === "ASSIGNED"
                        ? "bg-[#fef3c7] text-[#b45309]"
                        : selectedComplaint.status === "IN_PROGRESS"
                        ? "bg-[#e0e7ff] text-[#4338ca]"
                        : "bg-[#dcfce7] text-[#166534]"
                    }`}
                  >
                    {selectedComplaint.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-[#64748b] text-xs font-medium uppercase tracking-wide mb-1">
                    Consumer
                  </p>
                  <p className="font-semibold">{selectedComplaint.consumerName}</p>
                </div>
                <div>
                  <p className="text-[#64748b] text-xs font-medium uppercase tracking-wide mb-1">
                    Priority
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      selectedComplaint.priority === "HIGH" || selectedComplaint.priority === "CRITICAL"
                        ? "bg-red-100 text-red-700"
                        : selectedComplaint.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[#64748b] text-xs font-medium uppercase tracking-wide mb-1">
                    Address
                  </p>
                  <p>{selectedComplaint.address}</p>
                </div>
              </div>

              <hr className="border-[#f1f5f9]" />

              <div>
                <p className="text-[#64748b] text-xs font-medium uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="bg-[#f8fafc] p-4 rounded-lg border-l-4 border-[#4ecdc4]">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            <div className="p-8 border-t border-[#f1f5f9] flex gap-3">
              {selectedComplaint.status === "ASSIGNED" && (
                <button
                  onClick={() => handleStartWork(selectedComplaint._id)}
                  className="flex-1 bg-[#4a90e2] text-white py-3 rounded-xl font-semibold text-sm cursor-pointer
                    transition-all hover:bg-[#357abd] hover:-translate-y-0.5"
                >
                  <i className="fas fa-play"></i> Start Work
                </button>
              )}
              {selectedComplaint.status === "IN_PROGRESS" && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex-1 bg-[#2ed573] text-white py-3 rounded-xl font-semibold text-sm cursor-pointer
                    transition-all hover:bg-[#26a65b] hover:-translate-y-0.5"
                >
                  <i className="fas fa-file-alt"></i> Submit Work Report
                </button>
              )}
              {selectedComplaint.status === "COMPLETED" && (
                <p className="w-full text-center text-[#059669] font-semibold">
                  ✅ This complaint is COMPLETED
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Work Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-[#f1f5f9] flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <i className="fas fa-file-alt"></i> Submit Work Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-2xl cursor-pointer text-[#64748b] hover:text-[#1e293b] bg-transparent border-none leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  Work Performed *
                </label>
                <textarea
                  value={reportForm.workPerformed}
                  onChange={(e) =>
                    setReportForm((p) => ({ ...p, workPerformed: e.target.value }))
                  }
                  rows={4}
                  placeholder="Describe what work was done..."
                  required
                  className="w-full p-4 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#4ecdc4] resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  Condition After Repair *
                </label>
                <textarea
                  value={reportForm.conditionAfter}
                  onChange={(e) =>
                    setReportForm((p) => ({ ...p, conditionAfter: e.target.value }))
                  }
                  rows={3}
                  placeholder="Describe the condition after work..."
                  required
                  className="w-full p-4 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#4ecdc4] resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  After Photo *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) =>
                      setReportForm((p) => ({
                        ...p,
                        photo: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full p-4 border border-[#e2e8f0] rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4ecdc4] file:text-white cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#006c18] to-[#00b4a6] text-white py-4 rounded-xl
                  font-semibold text-sm cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </span>
                ) : (
                  <span><i className="fas fa-paper-plane"></i> Submit Report</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-[100px] right-5 px-6 py-4 rounded-xl text-white font-semibold text-sm
            shadow-lg transition-all z-[2000] max-w-[350px] animate-slide-in ${
              notification.type === "success"
                ? "bg-gradient-to-r from-[#10b981] to-[#059669]"
                : "bg-gradient-to-r from-[#ef4444] to-[#dc2626]"
            }`}
        >
          {notification.message}
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
