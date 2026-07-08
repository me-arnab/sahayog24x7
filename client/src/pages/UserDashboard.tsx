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
    priority: "high",
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
    priority: "medium",
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

export default function UserDashboard() {
  const [complaints, setComplaints] = useState<UserComplaint[]>(mockComplaints);
  const [stats] = useState<DashboardStats>(initialStats);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    consumerId: "",
    issueType: "",
    description: "",
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
      priority: Math.random() > 0.7 ? "high" : Math.random() > 0.5 ? "medium" : "low",
      status: "received",
      createdAt: new Date().toISOString(),
      photoUrls: [],
      assignedTeam: null,
      isNew: true,
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    setForm({ name: "", phone: "", consumerId: "", issueType: "", description: "" });
    alert(`✅ New complaint ${newComplaint.id} submitted!`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-5 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-8">
          {[
            { icon: "📋", label: "Total Complaints", value: stats.total },
            { icon: "⏳", label: "Pending", value: stats.pending },
            { icon: "✅", label: "Resolved", value: stats.resolved },
            { icon: "⭐", label: "Avg Rating", value: "4.2" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/20 backdrop-blur-lg p-[30px] rounded-[25px] text-center
                shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20
                transition-all hover:-translate-y-2.5 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] cursor-pointer"
            >
              <div className="text-5xl mb-4">{s.icon}</div>
              <div className="text-4xl font-extrabold mb-1">{s.value}</div>
              <div className="text-[#64748b] font-semibold text-base">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Complaint List */}
        <div className="bg-white/20 backdrop-blur-lg p-10 rounded-[25px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20 mb-10">
          <h2 className="text-[28px] font-extrabold mb-[30px] bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent">
            My Recent Complaints
          </h2>
          <div className="flex flex-col gap-4">
            {complaints.length === 0 && (
              <div className="text-center text-[#64748b] py-10">No complaints yet.</div>
            )}
            {complaints.map((c) => (
              <div
                key={c.id}
                className="flex gap-6 p-[30px] border-2 border-[#f1f5f9] rounded-[20px] mb-4
                  cursor-pointer transition-all hover:border-[#4ecdc4] hover:-translate-y-1
                  hover:shadow-[0_25px_50px_rgba(78,205,196,0.15)] bg-white/70 backdrop-blur-lg"
              >
                <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#006c18] to-[#00b4a6]
                  flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">
                  {c.id.slice(-3)}
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold mb-2 text-[#1e293b]">
                    {c.issueType} ({c.status})
                  </div>
                  <div className="flex gap-5 mb-3 text-sm text-[#64748b] flex-wrap">
                    <span className={`px-2 py-1 rounded-[25px] text-xs font-bold uppercase ${
                      c.priority === "high" ? "bg-red-100 text-red-600" :
                      c.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
                      "bg-green-100 text-green-600"
                    }`}>
                      {c.priority.toUpperCase()}
                    </span>
                    <span>{c.location}</span>
                  </div>
                  <p className="text-[#64748b] leading-relaxed">
                    {c.description.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaint Form */}
        <div className="bg-white/60 backdrop-blur-lg p-10 rounded-[25px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20">
          <h2 className="text-[28px] font-extrabold mb-[30px] bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent">
            Submit New Complaint
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            <div className="[grid-column:1/-1] grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-[#334155]">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full p-[18px] border-2 border-[#e2e8f0] rounded-[15px] text-base
                    bg-white/40 focus:outline-none focus:border-[#4ecdc4] focus:shadow-[0_0_0_4px_rgba(78,205,196,0.1)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-[#334155]">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 12345 67890"
                  required
                  className="w-full p-[18px] border-2 border-[#e2e8f0] rounded-[15px] text-base
                    bg-white/40 focus:outline-none focus:border-[#4ecdc4] focus:shadow-[0_0_0_4px_rgba(78,205,196,0.1)]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-semibold text-[#334155]">Consumer ID *</label>
              <input
                type="text"
                value={form.consumerId}
                onChange={(e) => setForm((p) => ({ ...p, consumerId: e.target.value }))}
                placeholder="Enter your consumer id"
                required
                className="w-full p-[18px] border-2 border-[#e2e8f0] rounded-[15px] text-base
                  bg-white/40 focus:outline-none focus:border-[#4ecdc4] focus:shadow-[0_0_0_4px_rgba(78,205,196,0.1)]"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-semibold text-[#334155]">Issue Type *</label>
              <select
                value={form.issueType}
                onChange={(e) => setForm((p) => ({ ...p, issueType: e.target.value }))}
                required
                className="w-full p-[18px] border-2 border-[#e2e8f0] rounded-[15px] text-base
                  bg-white/40 focus:outline-none focus:border-[#4ecdc4]"
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

            <div className="[grid-column:1/-1]">
              <label className="block mb-2 font-semibold text-[#334155]">Description *</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe your issue in detail..."
                required
                className="w-full p-[18px] border-2 border-[#e2e8f0] rounded-[15px] text-base
                  bg-white/40 focus:outline-none focus:border-[#4ecdc4] focus:shadow-[0_0_0_4px_rgba(78,205,196,0.1)] resize-vertical"
              />
            </div>

            <div className="[grid-column:1/-1]">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#006c18] to-[#00b4a6] text-white
                  py-5 rounded-[15px] text-lg font-bold cursor-pointer
                  transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(255,107,107,0.4)]"
              >
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
