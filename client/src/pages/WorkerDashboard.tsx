import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAssignedComplaints,
  getComplaintById,
  startWork,
} from "../api/complaints";
import { submitWorkReport } from "../api/workReport";
import { getConsumerNotices } from "../api/notices";
import type { Notice } from "../types/notice";
import { NoticeTypeBadge } from "../components/StatusBadge";
import type { CitizenComplaint } from "../types";
export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { worker, isLoading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<CitizenComplaint | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || fallback;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [compData, noticeData] = await Promise.all([
        getAssignedComplaints(),
        getConsumerNotices(),
      ]);
      const activeComplaints = compData.filter(c => !["PENDING_APPROVAL", "COMPLETED", "resolved"].includes(c.status));
      setComplaints(activeComplaints);
      setNotices(noticeData.filter((n) => n.audience === "Worker"));
    } catch {
      if (showLoading) notify("Failed to load data", "error");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!authLoading && !worker) {
      navigate("/login");
      return;
    }
    if (worker) {
      loadData();
      const interval = setInterval(() => {
        loadData(false);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [authLoading, worker, navigate, loadData]);

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

  const handleReportSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedComplaint) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("complaintId", selectedComplaint._id);
      formData.append("workPerformed", reportForm.workPerformed);
      formData.append("conditionAfter", reportForm.conditionAfter);
      if (reportForm.photo) {
        formData.append("afterPhoto", reportForm.photo);
      }

      const result = await submitWorkReport(formData);
      notify(result.message || "Work report submitted successfully");
      setShowConfirmModal(false);
      setShowReportModal(false);
      setReportForm({ workPerformed: "", conditionAfter: "", photo: null });
      setSelectedComplaint((prev) => prev ? { ...prev, status: "PENDING_APPROVAL" as any } : null);
      loadData();
    } catch (error) {
      notify(getApiErrorMessage(error, "Failed to submit report"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto w-full">


        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-6 max-md:grid-cols-2 max-sm:grid-cols-1">
          {[
            { label: "Total Assigned", value: stats.total, icon: "fas fa-clipboard-list", color: "bg-primary/10 text-primary" },
            { label: "In Progress", value: stats.inProgress, icon: "fas fa-tools", color: "bg-amber-50 text-warning" },
            { label: "Completed", value: stats.completed, icon: "fas fa-check-circle", color: "bg-green-50 text-success" },
            { label: "Assigned", value: stats.assigned, icon: "fas fa-clock", color: "bg-slate-100 text-text-muted" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${s.color}`}>
                  <i className={s.icon}></i>
                </div>
              </div>
              <div className="text-3xl font-bold text-navy">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Complaints */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <i className="fas fa-tasks text-primary"></i>
              My Assigned Complaints
            </h2>
            <button
              onClick={() => loadData()}
              className="border border-border text-text-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer
                transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
            >
              <i className="fas fa-sync-alt mr-1.5"></i> Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-text-muted text-sm">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <i className="fas fa-inbox text-4xl mb-3 block opacity-30"></i>
              No complaints assigned to you yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleViewDetail(c._id)}
                  className="bg-bg border border-border rounded-2xl p-5 cursor-pointer transition-all
                    hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-dashed border-border">
                    <span className="font-semibold text-sm text-navy">{c.complaintId}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium flex items-center gap-2 mb-1 text-navy">
                      <i className="fas fa-exclamation-circle text-primary text-xs"></i>
                      {c.consumerName}
                    </div>
                    <p className="text-xs text-text-muted ml-6">{c.description.substring(0, 80)}...</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        c.status === "ASSIGNED"
                          ? "bg-amber-50 text-amber-700"
                          : c.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-700"
                          : c.status === "PENDING_APPROVAL"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        c.emergency
                          ? "bg-red-50 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.emergency ? "Emergency" : "Normal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <i className="fas fa-bullhorn text-primary"></i>
              Recent Notices
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <i className="fas fa-check-circle text-3xl mb-3 block opacity-30 text-success"></i>
              No new notices for you.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              {notices.slice(0, 4).map((notice) => (
                <div
                  key={notice._id}
                  className="bg-bg border border-border rounded-2xl p-5 transition-all hover:border-primary/30 hover:shadow-md cursor-default"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <i className="fas fa-bell"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy text-sm">{notice.title}</h3>
                        <NoticeTypeBadge type={notice.type} />
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                        {notice.message}
                      </p>
                      <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                        Posted: {new Date(notice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-file-alt text-primary"></i> Complaint Details
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Complaint ID</p>
                  <p className="font-semibold text-navy">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Status</p>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      selectedComplaint.status === "ASSIGNED"
                        ? "bg-amber-50 text-amber-700"
                        : selectedComplaint.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700"
                        : selectedComplaint.status === "PENDING_APPROVAL"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {selectedComplaint.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Consumer</p>
                  <p className="font-semibold text-navy">{selectedComplaint.consumerName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Emergency</p>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      selectedComplaint.emergency
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {selectedComplaint.emergency ? "Yes" : "No"}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Address</p>
                  <div className="text-sm text-text-secondary">
                    {typeof selectedComplaint.address === "object" && selectedComplaint.address !== null ? (
                      <>
                        <p>{selectedComplaint.address.fullAddress}</p>
                        {selectedComplaint.addressType && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                            {selectedComplaint.addressType}
                          </span>
                        )}
                      </>
                    ) : (
                      <p>{String(selectedComplaint.address || selectedComplaint.location)}</p>
                    )}
                    {typeof selectedComplaint.location === "object" && selectedComplaint.location?.latitude && (
                      <a
                        href={`https://maps.google.com/?q=${selectedComplaint.location.latitude},${selectedComplaint.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
                      >
                        <i className="fas fa-map-marker-alt"></i> Navigate via Map
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-2">Description</p>
                <p className="bg-bg p-4 rounded-xl border-l-[3px] border-primary text-text-secondary leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              {selectedComplaint.status === "ASSIGNED" && (
                <button
                  onClick={() => handleStartWork(selectedComplaint._id)}
                  className="flex-1 bg-gradient-to-r from-primary to-accent-cyan text-white py-3 rounded-xl font-semibold text-sm cursor-pointer
                    shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                >
                  <i className="fas fa-play mr-1.5"></i> Start Work
                </button>
              )}
              {selectedComplaint.status === "IN_PROGRESS" && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex-1 bg-success text-white py-3 rounded-xl font-semibold text-sm cursor-pointer
                    shadow-md shadow-green-500/20 transition-all hover:-translate-y-0.5"
                >
                  <i className="fas fa-file-alt mr-1.5"></i> Submit Work Report
                </button>
              )}
              {selectedComplaint.status === "PENDING_APPROVAL" && (
                <p className="w-full text-center text-purple-600 font-semibold bg-purple-50 py-3 rounded-xl">
                  <i className="fas fa-hourglass-half mr-1.5"></i> Work Submitted (Pending Admin Approval)
                </p>
              )}
              {selectedComplaint.status === "COMPLETED" && (
                <p className="w-full text-center text-success font-semibold">
                  <i className="fas fa-check-circle mr-1"></i> This complaint is COMPLETED
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Work Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => {
            setShowConfirmModal(false);
            setShowReportModal(false);
          }}
        >
          <div
            className="bg-card rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-file-alt text-primary"></i> Submit Work Report
              </h3>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowReportModal(false);
                }}
                className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowConfirmModal(true); }} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Work Performed *</label>
                <textarea
                  value={reportForm.workPerformed}
                  onChange={(e) => setReportForm((p) => ({ ...p, workPerformed: e.target.value }))}
                  rows={4}
                  placeholder="Describe what work was done..."
                  required
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Condition After Repair *</label>
                <textarea
                  value={reportForm.conditionAfter}
                  onChange={(e) => setReportForm((p) => ({ ...p, conditionAfter: e.target.value }))}
                  rows={3}
                  placeholder="Describe the condition after work..."
                  required
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">After Photo *</label>
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
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-accent-cyan text-white py-4 rounded-xl
                  font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20
                  transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </span>
                ) : (
                  <span><i className="fas fa-paper-plane mr-1.5"></i> Submit Report</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}



      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-navy/70 backdrop-blur-sm z-[60] flex items-center justify-center p-5"
          onClick={() => !isSubmitting && setShowConfirmModal(false)}
        >
          <div
            className="bg-card rounded-2xl max-w-[460px] w-full shadow-2xl border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-circle-check text-success"></i> Confirm Submission
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                Please confirm that the work report is complete. Once submitted, the complaint will be marked as completed and the uploaded image will be saved.
              </p>

              <div className="bg-bg rounded-xl border border-border p-4 text-sm space-y-2">
                <div>
                  <span className="text-text-muted">Complaint: </span>
                  <span className="font-semibold text-navy">{selectedComplaint?.complaintId}</span>
                </div>
                <div>
                  <span className="text-text-muted">Image: </span>
                  <span className="font-semibold text-navy">{reportForm.photo?.name || "No file selected"}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 bg-white border border-border text-text-secondary py-3 rounded-xl font-semibold text-sm cursor-pointer hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReportSubmit()}
                disabled={isSubmitting}
                className="flex-1 bg-success text-white py-3 rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-green-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </span>
                ) : (
                  <span><i className="fas fa-paper-plane mr-1.5"></i> Confirm & Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-24 right-6 px-5 py-3.5 rounded-xl text-white font-semibold text-sm
            shadow-lg z-[2000] max-w-[350px] animate-slide-in
            ${notification.type === "success" ? "bg-success" : "bg-error"}`}
        >
          <i className={`fas ${notification.type === "success" ? "fa-check-circle" : "fa-times-circle"} mr-2`}></i>
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
