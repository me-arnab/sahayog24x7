import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminComplaints, assignComplaintWorker, updateComplaintStatus } from "../api/complaints";
import { getWorkers } from "../api/auth";
import { toast } from "react-toastify";
import type { CitizenComplaint } from "../types";

const statusBadge = (status: CitizenComplaint["status"]) => {
  const map: Record<string, string> = {
    received: "bg-blue-50 text-blue-700",
    ASSIGNED: "bg-amber-50 text-amber-700",
    IN_PROGRESS: "bg-orange-50 text-orange-700",
    PENDING_APPROVAL: "bg-purple-50 text-purple-700",
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

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<CitizenComplaint | null>(null);
  const [workers, setWorkers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      if (showLoading) setError("");
      const [compData, workersData] = await Promise.all([
        getAdminComplaints(),
        getWorkers(),
      ]);
      setComplaints(compData);
      setWorkers(workersData);
    } catch {
      if (showLoading) setError("Failed to load data");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedWorkerId) return;
    try {
      setIsAssigning(true);
      const res = await assignComplaintWorker(selectedComplaint._id, selectedWorkerId);
      toast.success(res.message);
      await loadData();
      setSelectedComplaint(null);
      setSelectedWorkerId("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to assign worker");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedComplaint) return;
    try {
      setIsAssigning(true);
      const res = await updateComplaintStatus(selectedComplaint._id, status);
      toast.success(res.message);
      await loadData();
      setSelectedComplaint(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsAssigning(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const locationStr = typeof c.location === "object" ? "" : String(c.location || "");
      const matchSearch =
        !search ||
        c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
        c.consumerName.toLowerCase().includes(search.toLowerCase()) ||
        c.issueType.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        locationStr.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [complaints, search, statusFilter]);

  const stats = useMemo(
    () => ({
      pending: complaints.filter((c) => c.status === "received").length,
      resolved: complaints.filter((c) => ["COMPLETED", "resolved"].includes(c.status)).length,
      inProgress: complaints.filter((c) => ["ASSIGNED", "IN_PROGRESS", "in-progress"].includes(c.status)).length,
    }),
    [complaints]
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <div className="w-full">
      <div className="max-w-[1500px] mx-auto w-full">
        <div className="grid grid-cols-[300px_1fr] gap-6 max-lg:grid-cols-1">
          {/* Filters Sidebar */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
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
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
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
              onClick={() => loadData()}
              className="mt-6 w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <i className="fas fa-sync-alt mr-1.5"></i> Refresh
            </button>
          </div>

          {/* Main Complaints List */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm max-md:flex-col">
              <h2 className="text-lg font-bold text-navy whitespace-nowrap flex items-center gap-2">
                <i className="fas fa-list-check text-primary"></i>
                Complaints Directory ({filtered.length})
              </h2>
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, name, issue, location..."
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
                  Loading complaints...
                </div>
              ) : filtered.length === 0 ? (
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
                      ${c.status === "PENDING_APPROVAL" ? "border-purple-200 bg-purple-50/30" : ""}
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
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            c.status === "ASSIGNED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            c.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            c.status === "PENDING_APPROVAL" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            c.status === "COMPLETED" || c.status === "resolved" ? "bg-green-50 text-green-700 border-green-200" :
                            "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>{c.status.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-muted mb-2 flex-wrap">
                          <span><i className="fas fa-user mr-1"></i>{c.consumerName}</span>
                          <span><i className="fas fa-map-marker-alt mr-1"></i>{typeof c.address === 'object' && c.address !== null ? c.address.fullAddress : String(c.location || c.address || '')}</span>
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
                          className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
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
                <div className="col-span-2">
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Location</p>
                  <div className="text-sm">
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

              {selectedComplaint.status === "received" && (
                <div className="bg-bg p-4 rounded-xl border border-border mt-4">
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-3">Assign Worker</p>
                  <div className="flex gap-3">
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="flex-1 p-2 border border-border rounded-xl bg-white text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">Select a worker...</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={!selectedWorkerId || isAssigning}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {isAssigning ? "Assigning..." : "Assign"}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-text-muted">
                Created: {new Date(selectedComplaint.createdAt).toLocaleString()}
              </p>
            </div>

            {selectedComplaint.status === "PENDING_APPROVAL" ? (
              <div className="p-4 border-t border-border bg-purple-50/50 flex justify-center rounded-b-2xl">
                <p className="text-purple-700 font-semibold text-sm flex items-center gap-2">
                  <i className="fas fa-hourglass-half"></i> Worker submitted a report. Review in Work Reports.
                </p>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="ml-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-white border border-border text-text-secondary hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : selectedComplaint.status === "COMPLETED" || selectedComplaint.status === "resolved" ? (
              <div className="p-4 border-t border-border flex justify-end bg-gray-50/50 rounded-b-2xl">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white border border-border text-text-secondary hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-border flex gap-3 justify-between bg-gray-50/50 rounded-b-2xl flex-wrap">
                <button
                  onClick={() => handleStatusUpdate("IN_PROGRESS")}
                  disabled={isAssigning || selectedComplaint.status === "IN_PROGRESS" || selectedComplaint.status === "in-progress"}
                  className="flex-1 min-w-[120px] py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-play"></i> Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusUpdate("resolved")}
                  disabled={isAssigning}
                  className="flex-1 min-w-[120px] py-2.5 rounded-xl text-sm font-semibold bg-[#22c55e] text-white shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-check"></i> Mark Resolved
                </button>
                <button
                  onClick={() => handleStatusUpdate("escalated")}
                  disabled={isAssigning || selectedComplaint.status === "escalated"}
                  className="flex-1 min-w-[120px] py-2.5 rounded-xl text-sm font-semibold bg-[#ef4444] text-white shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-flag"></i> Escalate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
