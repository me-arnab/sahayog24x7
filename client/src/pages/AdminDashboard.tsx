import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminComplaints } from "../api/complaints";
import { getWorkers } from "../api/auth";
import type { CitizenComplaint, DashboardStats } from "../types";

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

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] =
    useState<CitizenComplaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [workers, setWorkers] = useState<any[]>([]);

  const loadComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const [data, workersData] = await Promise.all([
        getAdminComplaints(),
        getWorkers(),
      ]);
      setComplaints(data);
      setWorkers(workersData);
    } catch {
      setError("Failed to load complaints");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

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

  const stats: DashboardStats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "received").length,
      resolved: complaints.filter((c) =>
        ["COMPLETED", "resolved"].includes(c.status)
      ).length,
      pendingApproval: complaints.filter(
        (c) => c.status === "PENDING_APPROVAL"
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
    <div className="w-full">
      <div className="max-w-[1500px] mx-auto w-full">
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

        <div className="mt-8 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <i className="fas fa-users-cog text-primary"></i>
              Worker Workload (Remaining Complaints)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted uppercase bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Worker</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-center">Remaining Complaints</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-center">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workers.map((worker) => {
                  const workerId = worker.id || worker._id;
                  const workerComplaints = complaints.filter((c) => c.assignedWorker === workerId);
                  const completed = workerComplaints.filter((c) => ["COMPLETED", "resolved"].includes(c.status)).length;
                  const remaining = workerComplaints.length - completed;
                  return { ...worker, remaining, completed };
                }).sort((a, b) => b.remaining - a.remaining).map((worker) => {
                  const workerId = worker.id || worker._id;
                  return (
                    <tr key={workerId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent-cyan/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/10 shrink-0">
                            {worker.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-medium text-navy">{worker.name}</span>
                            <span className="block text-[10px] text-text-muted uppercase tracking-wider">{worker.employeeId || 'Worker'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          worker.remaining > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"
                        }`}>
                          {worker.remaining}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                          {worker.completed}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {workers.length === 0 && (
              <div className="p-8 text-center text-text-muted">
                <i className="fas fa-user-slash text-3xl opacity-20 mb-3 block"></i>
                No workers found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
