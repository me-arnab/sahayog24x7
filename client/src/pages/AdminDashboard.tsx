import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getAdminComplaints } from "../api/complaints";
import { getContactMessages } from "../api/contact";
import type { CitizenComplaint, DashboardStats, ContactMessage } from "../types";

const statusBadge = (status: CitizenComplaint["status"]) => {
  const map: Record<string, string> = {
    received: "bg-blue-50 text-blue-700",
    ASSIGNED: "bg-amber-50 text-amber-700",
    IN_PROGRESS: "bg-orange-50 text-orange-700",
    COMPLETED: "bg-green-50 text-green-700",
    "in-progress": "bg-amber-50 text-amber-700",
    resolved: "bg-green-50 text-green-700",
    escalated: "bg-red-50 text-red-700",
  };
  return `px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
    map[status] || "bg-slate-100 text-slate-600"
  }`;
};

const emergencyBadge = (emergency: boolean) =>
  emergency ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] =
    useState<CitizenComplaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"complaints" | "messages">("complaints");
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const loadComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const [complaintsData, messagesData] = await Promise.all([
        getAdminComplaints(),
        getContactMessages()
      ]);
      setComplaints(complaintsData);
      setMessages(messagesData);
    } catch {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        !search ||
        c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
        c.consumerName.toLowerCase().includes(search.toLowerCase()) ||
        c.issueType.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [complaints, search, statusFilter]);

  const stats: DashboardStats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "received").length,
      resolved: complaints.filter((c) =>
        ["COMPLETED", "resolved"].includes(c.status)
      ).length,
      inProgress: complaints.filter((c) =>
        ["ASSIGNED", "IN_PROGRESS", "in-progress"].includes(c.status)
      ).length,
      assigned: complaints.filter((c) => c.status === "ASSIGNED").length,
    }),
    [complaints]
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-[1500px] mx-auto p-6 w-full">
        <div className="grid grid-cols-4 gap-5 mb-6 max-md:grid-cols-2 max-sm:grid-cols-1">
          {[
            { label: "Total Complaints", value: stats.total, icon: "fas fa-clipboard-list", color: "bg-primary/10 text-primary" },
            { label: "Pending", value: stats.pending, icon: "fas fa-clock", color: "bg-amber-50 text-warning" },
            { label: "In Progress", value: stats.inProgress, icon: "fas fa-tools", color: "bg-orange-50 text-orange-700" },
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

        <div className="grid grid-cols-[300px_1fr] gap-6 max-lg:grid-cols-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <i className="fas fa-bolt text-primary"></i> Quick Actions
            </h3>
            <div className="mb-6">
              <Link
                to="/admin/notices"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 transition-all no-underline"
              >
                <i className="fas fa-bullhorn"></i> Manage Notices
              </Link>
            </div>

            <hr className="my-6 border-border" />

            <h3 className="text-lg font-bold text-navy mb-5 flex items-center gap-2">
              <i className="fas fa-sliders-h text-primary"></i> Filters
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 border border-border rounded-xl bg-bg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="all">All Status</option>
                  <option value="received">Received</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>



              <button
                onClick={clearFilters}
                className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary
                  hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <i className="fas fa-times mr-1.5"></i> Clear Filters
              </button>
            </div>

            <hr className="my-6 border-border" />

            <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <i className="fas fa-chart-pie text-primary"></i> Queue View
            </h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex justify-between"><span>Waiting for review:</span><span className="font-semibold text-navy">{stats.pending}</span></div>
              <div className="flex justify-between"><span>Active work:</span><span className="font-semibold text-warning">{stats.inProgress}</span></div>
              <div className="flex justify-between"><span>Done:</span><span className="font-semibold text-success">{stats.resolved}</span></div>
            </div>

            <button
              onClick={loadComplaints}
              className="mt-6 w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary
                hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <i className="fas fa-sync-alt mr-1.5"></i> Refresh
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm max-md:flex-col">
              <h2 className="text-lg font-bold text-navy whitespace-nowrap flex items-center gap-2">
                <i className="fas fa-list-check text-primary"></i>
                Records
              </h2>
              <div className="flex bg-bg p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("complaints")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'complaints' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-navy'}`}
                >
                  Complaints ({filtered.length})
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'messages' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-navy'}`}
                >
                  Contact Messages ({messages.length})
                </button>
              </div>
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === 'complaints' ? "Search complaints..." : "Search messages..."}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-error text-sm p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  Loading data...
                </div>
              ) : activeTab === 'complaints' ? (
                filtered.length === 0 ? (
                  <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
                    <i className="fas fa-search text-3xl mb-3 block opacity-30"></i>
                    No complaints found matching your filters
                  </div>
                ) : (
                  filtered.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => setSelectedComplaint(c)}
                      className={`bg-card border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5
                        ${c.status === "COMPLETED" || c.status === "resolved" ? "border-green-200 bg-green-50/30" : "border-border"}
                        ${c.emergency ? "ring-1 ring-red-200" : ""}`}
                    >
                      <div className="flex gap-4 max-md:flex-col">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {c.complaintId.slice(-3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-semibold text-navy text-sm">{c.issueType}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${emergencyBadge(c.emergency)}`}>
                              {c.emergency ? "Emergency" : "Normal"}
                            </span>
                            <span className={statusBadge(c.status)}>{c.status.replace("_", " ")}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-text-muted mb-2 flex-wrap">
                            <span><i className="fas fa-user mr-1"></i>{c.consumerName}</span>
                            <span><i className="fas fa-map-marker-alt mr-1"></i>{c.location || c.address}</span>
                            <span>{c.complaintId}</span>
                          </div>
                          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{c.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 max-md:self-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(c);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary
                              hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                messages.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()) || m.message.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                  <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
                    <i className="fas fa-envelope text-3xl mb-3 block opacity-30"></i>
                    No messages found
                  </div>
                ) : (
                  messages
                    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()) || m.message.toLowerCase().includes(search.toLowerCase()))
                    .map((m) => (
                      <div key={m._id} className="bg-card border border-border rounded-2xl p-5 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div>
                            <h4 className="font-bold text-navy">{m.subject}</h4>
                            <div className="text-xs text-text-muted mt-1">
                              <span className="font-semibold">{m.name}</span> • <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a> • {new Date(m.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${m.status === 'unread' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                            {m.status}
                          </span>
                        </div>
                        <div className="bg-bg rounded-xl p-4 text-sm text-text-secondary leading-relaxed border border-border/50">
                          {m.message}
                        </div>
                      </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedComplaint && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-file-alt text-primary"></i>
                {selectedComplaint.issueType}
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
                  <span className={statusBadge(selectedComplaint.status)}>{selectedComplaint.status.replace("_", " ")}</span>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Citizen</p>
                  <p className="font-semibold text-navy">{selectedComplaint.consumerName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Emergency</p>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${emergencyBadge(selectedComplaint.emergency)}`}>
                    {selectedComplaint.emergency ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Phone</p>
                  <p>{selectedComplaint.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Location</p>
                  <div className="text-sm">
                    {typeof selectedComplaint.address === "object" ? (
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
                        <i className="fas fa-map-marker-alt"></i> View on Map
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

              {selectedComplaint.assignedTeam && (
                <div className="bg-blue-50 text-navy p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <i className="fas fa-users text-primary"></i>
                  Assigned Team: {selectedComplaint.assignedTeam}
                </div>
              )}

              <p className="text-xs text-text-muted">
                Created: {new Date(selectedComplaint.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-6 border-t border-border flex gap-3 flex-wrap">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 min-w-[140px] py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-accent-cyan text-white shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
