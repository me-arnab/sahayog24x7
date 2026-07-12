import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createComplaint, getMyComplaints } from "../api/complaints";
import { getConsumerNotices } from "../api/notices";
import type { Notice } from "../types/notice";
import { StatusBadge, NoticeTypeBadge } from "../components/StatusBadge";
import type { CitizenComplaint, CitizenUser, DashboardStats } from "../types";
import { AddressForm } from "../components/AddressForm";
import type { LocationData, StructuredAddress } from "../types";

const getInitialForm = (citizen: CitizenUser | null) => ({
  name: citizen?.name || "",
  phone: citizen?.phone || "",
  consumerId: citizen?.consumerId || "",
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
    PENDING_APPROVAL: "bg-purple-50 text-purple-700",
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
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [form, setForm] = useState(getInitialForm(citizen));
  const [selectedComplaint, setSelectedComplaint] = useState<CitizenComplaint | null>(null);
  
  const [addressData, setAddressData] = useState<{
    addressType: "RURAL" | "URBAN";
    locationMethod: "GPS" | "MANUAL";
    location: LocationData | undefined;
    address: StructuredAddress;
  }>({
    addressType: "URBAN",
    locationMethod: "MANUAL",
    location: undefined,
    address: {},
  });

  const handleAddressChange = useCallback((
    type: "RURAL" | "URBAN",
    method: "GPS" | "MANUAL",
    loc: LocationData | undefined,
    addr: StructuredAddress
  ) => {
    setAddressData({ addressType: type, locationMethod: method, location: loc, address: addr });
  }, []);

  const notify = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const [compData, noticeData] = await Promise.all([
        getMyComplaints(),
        getConsumerNotices(),
      ]);
      setComplaints(compData);
      const citizenNotices = noticeData.filter((n) => n.audience === "Citizen");
      setNotices(citizenNotices);
      
      if (citizenNotices.length > 0 && !sessionStorage.getItem("citizen_notice_shown")) {
        setShowNoticePopup(true);
        sessionStorage.setItem("citizen_notice_shown", "true");
      }
    } catch {
      if (showLoading) notify("Failed to load data", "error");
    } finally {
      if (showLoading) setIsLoading(false);
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
      const interval = setInterval(() => {
        loadData(false);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [authLoading, citizen, loadData, navigate]);

  const stats: DashboardStats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "received").length,
    resolved: complaints.filter((c) =>
      ["resolved", "COMPLETED"].includes(c.status)
    ).length,
    pendingApproval: complaints.filter((c) => c.status === "PENDING_APPROVAL").length,
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
      const payload = {
        name: form.name,
        phone: form.phone,
        consumerId: form.consumerId,
        location: addressData.location || addressData.address.road || "Unknown",
        issueType: form.issueType,
        description: form.description,
        emergency: form.emergency,
        address: addressData.address,
        addressType: addressData.addressType,
        locationMethod: addressData.locationMethod,
      };

      const result = await createComplaint(payload);

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
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto w-full space-y-8">
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
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                            c.status === "ASSIGNED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : c.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : c.status === "PENDING_APPROVAL"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : c.status === "COMPLETED" || c.status === "resolved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {c.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-2 flex-wrap">
                        <span className="truncate max-w-[200px]" title={typeof c.address === 'object' && c.address !== null ? c.address.district || c.address.road : c.address || (typeof c.location === 'object' ? "" : String(c.location || "N/A"))}>
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {typeof c.address === 'object' && c.address !== null ? c.address.district || c.address.road : c.address || (typeof c.location === 'object' ? "" : String(c.location || "N/A"))}
                        </span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-1">
                        {c.description}
                      </p>
                    </div>
                    <div className="flex items-center shrink-0">
                      <button 
                        onClick={() => setSelectedComplaint(c)}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        View Details
                      </button>
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
            {/* Step 1: Personal Information */}
            <div className="col-span-2 bg-slate-50 p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="text-lg font-bold text-navy">Personal Information</h3>
              </div>
              <p className="text-sm text-text-muted mb-6">
                These details are auto-filled from your profile and cannot be changed here.
              </p>
              
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter your full name"
                    disabled
                    className="w-full p-3 border border-border rounded-xl bg-slate-100 text-text-muted cursor-not-allowed text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    disabled
                    required
                    className="w-full p-3 border border-border rounded-xl bg-slate-100 text-text-muted cursor-not-allowed text-sm focus:outline-none"
                  />
                </div>

                <div className="col-span-2 max-md:col-span-1">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Consumer ID *</label>
                  <input
                    type="text"
                    value={form.consumerId}
                    onChange={(e) => setForm((p) => ({ ...p, consumerId: e.target.value }))}
                    placeholder="Enter your consumer id"
                    disabled
                    required
                    className="w-full p-3 border border-border rounded-xl bg-slate-100 text-text-muted cursor-not-allowed text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <AddressForm 
              onAddressChange={handleAddressChange}
            />

            {/* Step 3: Complaint Details */}
            <div className="col-span-2 bg-slate-50 p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                <h3 className="text-lg font-bold text-navy">Complaint Details</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Issue Type *</label>
                  <select
                    value={form.issueType}
                    onChange={(e) => setForm((p) => ({ ...p, issueType: e.target.value }))}
                    required
                    className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Description *</label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your issue in detail..."
                    required
                    className="w-full p-3 border border-border rounded-xl bg-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-vertical"
                  />
                </div>

                <div className={`col-span-2 flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${form.emergency ? 'bg-red-50 border-red-200' : 'bg-white border-border'}`}>
                  <div>
                    <p className={`text-sm font-bold ${form.emergency ? 'text-red-700' : 'text-text-secondary'}`}>Emergency Priority</p>
                    <p className={`text-xs ${form.emergency ? 'text-red-600/80' : 'text-text-muted'}`}>Mark this if the complaint poses an immediate hazard.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.emergency}
                      onChange={(e) => setForm((p) => ({ ...p, emergency: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <span className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-200 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-slate-200 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:border-white"></span>
                  </label>
                </div>
              </div>
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
      
      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[150] flex items-center justify-center p-5 animate-fade-in"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-file-alt text-primary"></i>
                Complaint Details
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Complaint ID</p>
                  <p className="font-semibold text-navy">{selectedComplaint.complaintId}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Status</p>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                      selectedComplaint.status === "ASSIGNED"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : selectedComplaint.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : selectedComplaint.status === "PENDING_APPROVAL"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : selectedComplaint.status === "COMPLETED" || selectedComplaint.status === "resolved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {selectedComplaint.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Issue Type</p>
                  <p className="font-semibold text-navy">{selectedComplaint.issueType}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Priority</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${emergencyBadge(selectedComplaint.emergency)}`}>
                    {selectedComplaint.emergency ? "Emergency" : "Normal"}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Location</p>
                  <p className="text-navy">
                    {typeof selectedComplaint.address === 'object' && selectedComplaint.address !== null 
                      ? selectedComplaint.address.district || selectedComplaint.address.road 
                      : selectedComplaint.address || (typeof selectedComplaint.location === 'object' ? "" : String(selectedComplaint.location || "N/A"))}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Description</p>
                  <p className="bg-slate-50 p-4 rounded-xl text-text-secondary border border-border whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Submitted Date</p>
                  <p className="text-navy">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="bg-bg border border-border text-text-secondary px-6 py-2 rounded-xl font-semibold text-sm cursor-pointer hover:bg-slate-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Popup Modal */}
      {showNoticePopup && notices.length > 0 && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[100] flex items-center justify-center p-5 animate-fade-in"
          onClick={() => setShowNoticePopup(false)}
        >
          <div
            className="bg-card rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-bell text-primary animate-bounce"></i>
                Important Announcements
              </h3>
              <button
                onClick={() => setShowNoticePopup(false)}
                className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-text-secondary">
                You have {notices.length} new {notices.length === 1 ? 'notice' : 'notices'} from the electricity board:
              </p>
              
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {notices.map((notice) => (
                  <div key={notice._id} className="bg-bg border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-navy text-sm">{notice.title}</h4>
                      <NoticeTypeBadge type={notice.type} />
                    </div>
                    <p className="text-sm text-text-secondary">{notice.message}</p>
                    <p className="text-xs text-text-muted mt-2">
                      Valid until: {new Date(notice.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setShowNoticePopup(false)}
                className="bg-primary text-white px-6 py-2 rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
              >
                Got it
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
