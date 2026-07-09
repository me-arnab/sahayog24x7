import { useState, useMemo } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import type { UserComplaint } from "../types";

const allComplaints: UserComplaint[] = [
  {
    id: "COMP-001",
    citizenName: "Ramesh Kumar",
    phone: "+91-9876543210",
    location: "Ward 5, Street 3",
    zone: "ward-5",
    issueType: "Power Outage",
    description: "Complete blackout since 10 PM. Entire street affected.",
    emergency: true,
    status: "received",
    createdAt: "2025-12-14T01:30:00",
    photoUrls: [],
    assignedTeam: null,
    isNew: false,
  },
  {
    id: "COMP-002",
    citizenName: "Priya Sharma",
    phone: "+91-9876543211",
    location: "Ward 2, Park Road",
    zone: "ward-2",
    issueType: "Low Voltage",
    description: "Voltage fluctuations causing appliances to malfunction.",
    emergency: false,
    status: "in-progress",
    createdAt: "2025-12-13T22:45:00",
    photoUrls: [],
    assignedTeam: "Line Team 3",
    isNew: false,
  },
  {
    id: "COMP-003",
    citizenName: "Suresh Patel",
    phone: "+91-9876543212",
    location: "Ward 1, Market Area",
    zone: "ward-1",
    issueType: "Sparking Transformer",
    description: "Sparks from pole transformer. Safety hazard near school.",
    emergency: true,
    status: "received",
    createdAt: "2025-12-14T02:00:00",
    photoUrls: ["photo1.jpg"],
    assignedTeam: null,
    isNew: false,
  },
  {
    id: "COMP-004",
    citizenName: "Anita Devi",
    phone: "+91-9876543213",
    location: "Ward 3, Sector 12",
    zone: "ward-3",
    issueType: "Meter Fault",
    description: "Meter reading incorrect. Shows high usage despite no appliances running.",
    emergency: false,
    status: "resolved",
    createdAt: "2025-12-13T10:30:00",
    photoUrls: [],
    assignedTeam: "Metering Unit",
    isNew: false,
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    received: "bg-blue-50 text-blue-700",
    "in-progress": "bg-amber-50 text-amber-700",
    resolved: "bg-green-50 text-green-700",
    escalated: "bg-red-50 text-red-700",
  };
  return `px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${map[status] || "bg-slate-100 text-slate-600"}`;
};

const emergencyBadge = (emergency: boolean) =>
  emergency ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600";

export default function AdminDashboard() {
  const [complaints] = useState(allComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<UserComplaint | null>(null);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        !search ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.citizenName.toLowerCase().includes(search.toLowerCase()) ||
        c.issueType.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchZone = zoneFilter === "all" || c.zone === zoneFilter;
      return matchSearch && matchStatus && matchZone;
    });
  }, [complaints, search, statusFilter, zoneFilter]);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      open: complaints.filter((c) => c.status !== "resolved").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      emergency: complaints.filter((c) => c.emergency).length,
    }),
    [complaints]
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setZoneFilter("all");
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-[1500px] mx-auto p-6 w-full">
        <div className="grid grid-cols-4 gap-5 mb-6 max-md:grid-cols-2 max-sm:grid-cols-1">
          {[
            { label: "Total Complaints", value: stats.total, icon: "fas fa-clipboard-list", color: "bg-primary/10 text-primary" },
            { label: "Open", value: stats.open, icon: "fas fa-exclamation-circle", color: "bg-amber-50 text-warning" },
            { label: "Resolved", value: stats.resolved, icon: "fas fa-check-circle", color: "bg-green-50 text-success" },
            { label: "Emergency", value: stats.emergency, icon: "fas fa-bolt", color: "bg-red-50 text-error" },
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
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Ward / Zone</label>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="w-full p-2.5 border border-border rounded-xl bg-bg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="all">All Zones</option>
                  <option value="ward-1">Ward 1</option>
                  <option value="ward-2">Ward 2</option>
                  <option value="ward-3">Ward 3</option>
                  <option value="ward-5">Ward 5</option>
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
              <i className="fas fa-chart-pie text-primary"></i> Overview
            </h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex justify-between"><span>Total:</span><span className="font-semibold text-navy">{stats.total}</span></div>
              <div className="flex justify-between"><span>Open:</span><span className="font-semibold text-warning">{stats.open}</span></div>
              <div className="flex justify-between"><span>Resolved:</span><span className="font-semibold text-success">{stats.resolved}</span></div>
              <div className="flex justify-between"><span>Emergency:</span><span className="font-semibold text-error">{stats.emergency}</span></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm max-md:flex-col">
              <h2 className="text-lg font-bold text-navy whitespace-nowrap flex items-center gap-2">
                <i className="fas fa-list-check text-primary"></i>
                Complaints ({filtered.length})
              </h2>
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, name, issue, or description..."
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
                  <i className="fas fa-search text-3xl mb-3 block opacity-30"></i>
                  No complaints found matching your filters
                </div>
              )}
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`bg-card border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5
                    ${c.status === "resolved" ? "border-green-200 bg-green-50/30" : "border-border"}
                    ${c.isNew ? "border-primary/40 bg-blue-50/30" : ""}`}
                >
                  <div className="flex gap-4 max-md:flex-col">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {c.id.slice(-3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-semibold text-navy text-sm">{c.issueType}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${emergencyBadge(c.emergency)}`}>
                          {c.emergency ? "Emergency" : "Normal"}
                        </span>
                        <span className={statusBadge(c.status)}>{c.status.replace("-", " ")}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-2">
                        <span><i className="fas fa-user mr-1"></i>{c.citizenName}</span>
                        <span><i className="fas fa-map-marker-alt mr-1"></i>{c.location}</span>
                        <span>{c.id}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 max-md:self-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedComplaint(c); }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary
                          hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                  <p className="font-semibold text-navy">{selectedComplaint.id}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Status</p>
                  <span className={statusBadge(selectedComplaint.status)}>{selectedComplaint.status.replace("-", " ")}</span>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Citizen</p>
                  <p className="font-semibold text-navy">{selectedComplaint.citizenName}</p>
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
                  <p>{selectedComplaint.location}</p>
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
              {selectedComplaint.status === "resolved" ? (
                <p className="w-full text-center text-success font-semibold text-sm">
                  <i className="fas fa-check-circle mr-1"></i> This complaint is RESOLVED
                </p>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="flex-1 min-w-[140px] py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-accent-cyan text-white shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <i className="fas fa-play mr-1.5"></i> Mark In Progress
                  </button>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="flex-1 min-w-[140px] py-2.5 rounded-xl text-xs font-semibold bg-success text-white shadow-md shadow-green-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <i className="fas fa-check mr-1.5"></i> Mark Resolved
                  </button>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="flex-1 min-w-[140px] py-2.5 rounded-xl text-xs font-semibold bg-error text-white shadow-md shadow-red-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <i className="fas fa-flag mr-1.5"></i> Escalate
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
