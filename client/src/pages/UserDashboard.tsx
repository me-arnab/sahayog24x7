import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getConsumerNotices } from "../api/notices";
import type { Notice } from "../types/notice";
import { StatusBadge, NoticeTypeBadge } from "../components/StatusBadge";
import type { CitizenComplaint, CitizenUser, DashboardStats } from "../types";

const getInitialForm = (citizen: CitizenUser | null) => ({
  name: citizen?.name || "",
  phone: citizen?.phone || "",
  consumerId: citizen?.consumerId || "",
  location: citizen?.consumerId || "",
  zone: "ward-1",
  issueType: "",
  description: "",
  emergency: false,
});

const statusBadge = (status: CitizenComplaint["status"]) => {
  const map: Record<string, string> = {
    received: "bg-blue-50 text-blue-700",
    "in-progress": "bg-amber-50 text-amber-700",
    resolved: "bg-green-50 text-green-700",
    escalated: "bg-red-50 text-red-700",
    ASSIGNED: "bg-amber-50 text-amber-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-green-50 text-green-700",
  };

  return `px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
    map[status] || "bg-slate-100 text-slate-600"
  }`;
};

const emergencyBadge = (emergency: boolean) =>
  emergency ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { citizen, isLoading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [form, setForm] = useState(getInitialForm(citizen));

  const notify = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [compData, noticeData] = await Promise.all([
        getMyComplaints(),
        getConsumerNotices(),
      ]);
      setComplaints(compData);
      setNotices(noticeData.filter((n) => n.audience === "Citizen"));
    } catch {
      notify("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!authLoading && !citizen) {
      navigate("/login");
      return;
    }
    if (citizen) {
      setForm(getInitialForm(citizen));
      loadData();
    }
  }, [authLoading, citizen, loadData, navigate]);

  const stats: DashboardStats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "received").length,
    resolved: complaints.filter((c) =>
      ["resolved", "COMPLETED"].includes(c.status)
    ).length,
    inProgress: complaints.filter((c) =>
      ["in-progress", "IN_PROGRESS"].includes(c.status)
    ).length,
    assigned: complaints.filter((c) => c.status === "ASSIGNED").length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizen) return;

    setIsSubmitting(true);
    try {
      const result = await createComplaint({
        name: form.name || citizen.name,
        phone: form.phone || citizen.phone,
        consumerId: form.consumerId || citizen.consumerId,
        location: form.location || citizen.consumerId,
        zone: form.zone,
        issueType: form.issueType,
        description: form.description,
        emergency: form.emergency,
      });

      notify(result.message || "Complaint submitted successfully");
      setForm(getInitialForm(citizen));
      setForm((prev) => ({ ...prev, issueType: "", description: "", emergency: false }));
      loadData();
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : error instanceof Error
          ? error.message
          : "Failed to submit complaint";

      notify(message || "Failed to submit complaint", "error");
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
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-[1400px] mx-auto p-6 w-full space-y-8">
        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <div>
            <h1 className="text-2xl font-bold text-navy">
              Welcome back, {citizen?.name || "Citizen"}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Submit a complaint and track each update from one place.
            </p>
          </div>
          <div className="bg-white border border-border rounded-2xl px-4 py-3 text-sm text-text-secondary">
            Consumer ID: <span className="font-semibold text-navy">{citizen?.consumerId}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-sm:grid-cols-1">
          {[
            { label: "Total Complaints", value: stats.total, icon: "fas fa-clipboard-list", color: "bg-primary/10 text-primary" },
            { label: "Pending", value: stats.pending, icon: "fas fa-clock", color: "bg-amber-50 text-warning" },
            { label: "In Progress", value: stats.inProgress, icon: "fas fa-tools", color: "bg-blue-50 text-primary" },
            { label: "Resolved", value: stats.resolved, icon: "fas fa-check-circle", color: "bg-green-50 text-success" },
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

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <i className="fas fa-history text-primary"></i>
              My Recent Complaints
            </h2>
            <button
              onClick={loadData}
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
              <i className="fas fa-inbox text-3xl mb-3 block opacity-30"></i>
              No complaints yet. Submit your first complaint below.
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  className="bg-bg border border-border rounded-2xl p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex gap-4 max-md:flex-col">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {c.complaintId.slice(-3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-semibold text-navy text-sm">{c.issueType}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${emergencyBadge(c.emergency)}`}>
                          {c.emergency ? "Emergency" : "Normal"}
                        </span>
                        <span className={statusBadge(c.status)}>{c.status.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-2 flex-wrap">
                        <span>
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {c.location || c.address}
                        </span>
                        <span>Zone: {c.zone || "N/A"}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-1">
                        {c.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <i className="fas fa-bullhorn text-primary"></i>
              Recent Notices
            </h2>
            <button
              onClick={() => navigate("/notices")}
              className="border border-border text-text-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer
                transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
            >
              View All <i className="fas fa-arrow-right ml-1"></i>
            </button>
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
                  onClick={() => navigate("/notices")}
                  className="bg-bg border border-border rounded-2xl p-5 transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
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

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
            <i className="fas fa-plus-circle text-primary"></i>
            Submit New Complaint
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 12345 67890"
                required
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Consumer ID *</label>
              <input
                type="text"
                value={form.consumerId}
                onChange={(e) => setForm((p) => ({ ...p, consumerId: e.target.value }))}
                placeholder="Enter your consumer id"
                required
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Enter your area / location"
                required
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Zone *</label>
              <select
                value={form.zone}
                onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
                required
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="ward-1">Ward 1</option>
                <option value="ward-2">Ward 2</option>
                <option value="ward-3">Ward 3</option>
                <option value="ward-4">Ward 4</option>
                <option value="ward-5">Ward 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Issue Type *</label>
              <select
                value={form.issueType}
                onChange={(e) => setForm((p) => ({ ...p, issueType: e.target.value }))}
                required
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select Issue</option>
                <option value="Power Outage">Power Outage</option>
                <option value="Low Voltage">Low Voltage</option>
                <option value="Sparking/Hazard">Sparking/Hazard</option>
                <option value="Meter Fault">Meter Fault</option>
                <option value="Transformer Issue">Transformer Issue</option>
                <option value="Billing Issue">Billing Issue</option>
              </select>
            </div>

            <div className="col-span-2 flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-secondary">Emergency</p>
                <p className="text-xs text-text-muted">Mark this if the complaint needs urgent visibility.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.emergency}
                  onChange={(e) => setForm((p) => ({ ...p, emergency: e.target.checked }))}
                  className="sr-only peer"
                />
                <span className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-slate-200 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-5"></span>
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Description *</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe your issue in detail..."
                required
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-vertical"
              />
            </div>

            <div className="col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-accent-cyan text-white
                  py-4 rounded-xl font-semibold text-sm cursor-pointer
                  shadow-md shadow-blue-500/20 transition-all
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </span>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

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

      <Footer />
    </div>
  );
}
