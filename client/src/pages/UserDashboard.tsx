import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import type { UserComplaint, DashboardStats } from "../types";

const mockComplaints: UserComplaint[] = [
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
    assignedTeam: "Line Team A",
    isNew: false,
  },
];

const initialStats: DashboardStats = {
  total: 5,
  pending: 2,
  resolved: 3,
  inProgress: 1,
  assigned: 0,
};

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

export default function UserDashboard() {
  const [complaints, setComplaints] = useState<UserComplaint[]>(mockComplaints);
  const [stats] = useState<DashboardStats>(initialStats);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    consumerId: "",
    issueType: "",
    description: "",
    emergency: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newComplaint: UserComplaint = {
      id: "COMP-" + String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
      citizenName: form.name || "Anonymous",
      phone: form.phone,
      location: form.consumerId,
      zone: "ward-" + Math.floor(Math.random() * 5 + 1),
      issueType: form.issueType,
      description: form.description,
      emergency: form.emergency,
      status: "received",
      createdAt: new Date().toISOString(),
      photoUrls: [],
      assignedTeam: null,
      isNew: true,
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    setForm({
      name: "",
      phone: "",
      consumerId: "",
      issueType: "",
      description: "",
      emergency: false,
    });
    alert(`New complaint ${newComplaint.id} submitted!`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-[1400px] mx-auto p-6 w-full space-y-8">
        <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-sm:grid-cols-1">
          {[
            { label: "Total Complaints", value: stats.total, icon: "fas fa-clipboard-list", color: "bg-primary/10 text-primary" },
            { label: "Pending", value: stats.pending, icon: "fas fa-clock", color: "bg-amber-50 text-warning" },
            { label: "Resolved", value: stats.resolved, icon: "fas fa-check-circle", color: "bg-green-50 text-success" },
            { label: "Avg Rating", value: "4.2", icon: "fas fa-star", color: "bg-blue-50 text-primary" },
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
          <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
            <i className="fas fa-history text-primary"></i>
            My Recent Complaints
          </h2>
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <i className="fas fa-inbox text-3xl mb-3 block opacity-30"></i>
              No complaints yet.
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-bg border border-border rounded-2xl p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex gap-4 max-md:flex-col">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {c.id.slice(-3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-semibold text-navy text-sm">{c.issueType}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${emergencyBadge(c.emergency)}`}>
                          {c.emergency ? "Emergency" : "Normal"}
                        </span>
                        <span className={statusBadge(c.status)}>{c.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-2">
                        <span><i className="fas fa-map-marker-alt mr-1"></i>{c.location}</span>
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
                className="w-full bg-gradient-to-r from-primary to-accent-cyan text-white
                  py-4 rounded-xl font-semibold text-sm cursor-pointer
                  shadow-md shadow-blue-500/20 transition-all
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
