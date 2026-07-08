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
    priority: "high",
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
    priority: "low",
    status: "resolved",
    createdAt: "2025-12-13T10:30:00",
    photoUrls: [],
    assignedTeam: "Metering Unit",
    isNew: false,
  },
];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState(allComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
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
      const matchPriority = priorityFilter === "all" || c.priority === priorityFilter;
      const matchZone = zoneFilter === "all" || c.zone === zoneFilter;
      return matchSearch && matchStatus && matchPriority && matchZone;
    });
  }, [complaints, search, statusFilter, priorityFilter, zoneFilter]);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      open: complaints.filter((c) => c.status !== "resolved").length,
      sla: Math.floor(Math.random() * 5),
    }),
    [complaints]
  );

  const updateStatus = (id: string, newStatus: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              assignedTeam: newStatus === "in-progress" && !c.assignedTeam
                ? `Field Team ${Math.floor(Math.random() * 5)}`
                : c.assignedTeam,
              isNew: false,
            }
          : c
      )
    );
    setSelectedComplaint(null);
  };

  const assignTeam = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id && !c.assignedTeam && c.status !== "resolved"
          ? {
              ...c,
              assignedTeam: `Team ${Math.floor(Math.random() * 5 + 1)}`,
              status: "in-progress" as const,
              isNew: false,
            }
          : c
      )
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setZoneFilter("all");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-5 w-full">
        <div className="grid grid-cols-[320px_1fr] gap-[30px] max-lg:grid-cols-1">
          {/* Sidebar */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[25px] p-10 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20 h-fit">
            <h3 className="text-[22px] font-extrabold mb-[30px] text-[#1e293b]">
              🔍 Filters
            </h3>

            <div className="mb-[30px]">
              <label className="block mb-2.5 font-semibold text-[#475569]">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-[15px] border-2 border-[#e2e8f0] rounded-xl bg-white"
              >
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <div className="mb-[30px]">
              <label className="block mb-2.5 font-semibold text-[#475569]">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-[15px] border-2 border-[#e2e8f0] rounded-xl bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="mb-[30px]">
              <label className="block mb-2.5 font-semibold text-[#475569]">Ward/Zone</label>
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="w-full p-[15px] border-2 border-[#e2e8f0] rounded-xl bg-white"
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
              className="w-full mt-5 p-[15px] bg-gradient-to-r from-[#006c18] to-[#00b4a6] text-white
                rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-1"
            >
              Clear Filters
            </button>

            <h3 className="text-[22px] font-extrabold mt-10 mb-[30px] text-[#1e293b]">
              📊 Overview
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <strong>Total:</strong> <span>{stats.total}</span>
              </div>
              <div>
                <strong>Open:</strong> <span>{stats.open}</span>
              </div>
              <div>
                <strong>SLA Breach:</strong> <span>{stats.sla}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-[30px]">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/95 backdrop-blur-xl p-[30px_40px]
              rounded-[25px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20 max-md:flex-col max-md:gap-5">
              <h2 className="text-[28px] font-extrabold text-[#1e293b]">
                📈 Complaints Dashboard ({filtered.length} results)
              </h2>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaints..."
                className="p-[18px_25px] border-2 border-[#e2e8f0] rounded-[50px] w-[350px] text-base bg-white max-md:w-full"
              />
            </div>

            {/* Complaints List */}
            <div className="bg-white/20 backdrop-blur-lg rounded-[25px] p-10 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20">
              {filtered.length === 0 && (
                <div className="text-center text-[#64748b] py-10 text-lg">
                  No complaints found matching your filters
                </div>
              )}
              <div className="flex flex-col gap-4">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`flex gap-6 p-[30px] border-2 rounded-[20px] cursor-pointer
                      transition-all hover:border-[#4ecdc4] hover:-translate-y-1
                      hover:shadow-[0_25px_50px_rgba(78,205,196,0.15)]
                      bg-white/70 backdrop-blur-lg ${
                        c.status === "resolved"
                          ? "bg-[#f0fdf4] border-[#22c55e] opacity-70 hover:shadow-none hover:translate-y-0"
                          : "border-[#f1f5f9]"
                      } ${c.isNew ? "border-[#10b981] bg-gradient-to-r from-[#dcfce7] to-white" : ""}`}
                  >
                    <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#006c18] to-[#00b4a6]
                      flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">
                      {c.id.slice(-3)}
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold mb-2 text-[#1e293b]">
                        {c.issueType} - {c.id}
                      </div>
                      <div className="flex gap-5 mb-3 text-sm text-[#64748b] flex-wrap">
                        <span className={`px-2 py-1 rounded-[25px] text-xs font-bold uppercase ${
                          c.priority === "high" ? "bg-red-100 text-red-600" :
                          c.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
                          "bg-green-100 text-green-600"
                        }`}>
                          {c.priority.toUpperCase()}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-[20px] text-xs font-semibold ${
                          c.status === "received" ? "bg-blue-100 text-blue-700" :
                          c.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                          c.status === "resolved" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {c.status.replace("-", " ").toUpperCase()}
                        </span>
                        <span>{c.location}</span>
                      </div>
                      <p className="text-[#64748b] leading-relaxed">{c.description}</p>
                    </div>
                    <div className="flex gap-2.5 flex-shrink-0 max-md:flex-wrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedComplaint(c); }}
                        className="p-[10px_20px] border-2 border-[#e2e8f0] bg-white rounded-xl cursor-pointer
                          font-semibold text-sm transition-all hover:border-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-white"
                      >
                        View
                      </button>
                      {c.status !== "resolved" && !c.assignedTeam && (
                        <button
                          onClick={(e) => { e.stopPropagation(); assignTeam(c.id); }}
                          className="p-[10px_20px] border-2 border-[#e2e8f0] bg-white rounded-xl cursor-pointer
                            font-semibold text-sm transition-all hover:border-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-white"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-5"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-white rounded-[25px] p-10 max-w-[600px] w-full max-h-[90vh] overflow-y-auto
              shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-[30px] pb-5 border-b-2 border-[#f1f5f9]">
              <h3 className="text-xl font-bold">
                {selectedComplaint.issueType} - {selectedComplaint.id}
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-[30px] cursor-pointer text-[#64748b] hover:text-[#1e293b] leading-none bg-transparent border-none"
              >
                ×
              </button>
            </div>

            <div className="leading-relaxed text-[#475569] space-y-3">
              <p><strong>👤 Citizen:</strong> {selectedComplaint.citizenName}</p>
              <p><strong>📞 Phone:</strong> {selectedComplaint.phone}</p>
              <p><strong>📍 Location:</strong> {selectedComplaint.location}</p>
              <p>
                <strong>🏷️ Priority:</strong>{" "}
                <span className={`px-2 py-1 rounded-[25px] text-xs font-bold uppercase ${
                  selectedComplaint.priority === "high" ? "bg-red-100 text-red-600" :
                  selectedComplaint.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
                  "bg-green-100 text-green-600"
                }`}>
                  {selectedComplaint.priority.toUpperCase()}
                </span>
              </p>
              <p>
                <strong>📋 Status:</strong>{" "}
                <span className={`px-1.5 py-0.5 rounded-[20px] text-xs font-semibold ${
                  selectedComplaint.status === "received" ? "bg-blue-100 text-blue-700" :
                  selectedComplaint.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                  selectedComplaint.status === "resolved" ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {selectedComplaint.status.replace("-", " ").toUpperCase()}
                </span>
              </p>
              <p><strong>📅 Created:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
              <hr className="my-6 border-[#e2e8f0]" />
              <p><strong>📝 Description:</strong></p>
              <p className="bg-[#f8fafc] p-5 rounded-xl border-l-4 border-[#4ecdc4]">
                {selectedComplaint.description}
              </p>
              {selectedComplaint.assignedTeam && (
                <p><strong>👥 Assigned Team:</strong> {selectedComplaint.assignedTeam}</p>
              )}
            </div>

            <div className="flex gap-4 mt-[30px] pt-[30px] border-t-2 border-[#f1f5f9]">
              {selectedComplaint.status === "resolved" ? (
                <p className="text-center text-[#059669] font-semibold w-full">
                  ✅ This complaint is RESOLVED
                </p>
              ) : (
                <>
                  <button
                    onClick={() => updateStatus(selectedComplaint.id, "in-progress")}
                    className="p-[10px_20px] border-2 border-[#e2e8f0] bg-white rounded-xl cursor-pointer
                      font-semibold text-sm transition-all hover:border-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-white"
                  >
                    🔄 Mark In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(selectedComplaint.id, "resolved")}
                    className="p-[10px_20px] border-2 border-[#e2e8f0] bg-white rounded-xl cursor-pointer
                      font-semibold text-sm transition-all hover:border-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-white"
                  >
                    ✅ Mark Resolved
                  </button>
                  <button
                    onClick={() => updateStatus(selectedComplaint.id, "escalated")}
                    className="p-[10px_20px] border-2 border-red-100 text-red-600 bg-white rounded-xl cursor-pointer
                      font-semibold text-sm transition-all hover:bg-red-600 hover:text-white hover:border-red-600"
                  >
                    🚨 Escalate
                  </button>
                  {!selectedComplaint.assignedTeam && (
                    <button
                      onClick={() => { assignTeam(selectedComplaint.id); setSelectedComplaint(null); }}
                      className="p-[10px_20px] border-2 border-[#e2e8f0] bg-white rounded-xl cursor-pointer
                        font-semibold text-sm transition-all hover:border-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-white"
                    >
                      👥 Assign Team
                    </button>
                  )}
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
