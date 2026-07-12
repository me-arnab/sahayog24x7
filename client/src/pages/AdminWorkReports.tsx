import { useEffect, useState, useCallback, useMemo } from "react";
import { getWorkReports, approveWorkReport, rejectWorkReport, type WorkReport } from "../api/workReport";
import apiClient from "../api/client";

const BACKEND_URL = "http://localhost:5000";

export default function AdminWorkReports() {
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getWorkReports();
      setReports(data);
    } catch {
      setError("Failed to load work reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveWorkReport(id);
      loadData();
      if (selectedReport?._id === id) setSelectedReport(null);
    } catch (err) {
      alert("Failed to approve report");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectWorkReport(id);
      loadData();
      if (selectedReport?._id === id) setSelectedReport(null);
    } catch (err) {
      alert("Failed to reject report");
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (!search) return reports;
    const lower = search.toLowerCase();
    return reports.filter(
      (r) =>
        r.complaintId?.complaintId?.toLowerCase().includes(lower) ||
        r.workerId?.name?.toLowerCase().includes(lower) ||
        r.complaintId?.issueType?.toLowerCase().includes(lower) ||
        (typeof r.complaintId === 'string' && r.complaintId.toLowerCase().includes(lower))
    );
  }, [reports, search]);

  return (
    <div className="w-full">
      <div className="max-w-[1500px] mx-auto w-full">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <i className="fas fa-clipboard-check text-primary"></i> Work Reports
            </h1>
            <p className="text-text-muted mt-1 text-sm">Review completed jobs and field worker submissions.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm"></i>
              <input
                type="text"
                placeholder="Search worker, ID, issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2.5 bg-bg border border-border rounded-xl text-sm font-semibold text-text-secondary hover:text-primary hover:border-primary transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-error text-sm p-4 rounded-xl border border-red-200 mb-6 flex items-center gap-2 relative z-10">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className="relative z-10">
          {isLoading ? (
            <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl shadow-sm">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              Loading reports...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl shadow-sm">
              <i className="fas fa-clipboard-list text-4xl mb-3 block opacity-30"></i>
              No work reports found matching your criteria.
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-border text-xs uppercase text-text-muted font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Complaint ID</th>
                      <th className="px-6 py-4">Issue Type</th>
                      <th className="px-6 py-4">Worker</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Submitted Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr 
                        key={r._id}
                        className="border-b border-border hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 font-semibold text-navy">
                          {r.complaintId?.complaintId || (typeof r.complaintId === 'string' ? r.complaintId : "Unknown/Deleted")}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {r.complaintId?.issueType || "Unknown"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent-cyan/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/10">
                              {r.workerId?.name.charAt(0)}
                            </div>
                            <div>
                              <span className="block font-medium text-navy">{r.workerId?.name}</span>
                              <span className="block text-[10px] text-text-muted uppercase tracking-wider">{r.workerId?.employeeId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                            r.status === 'approved' ? 'bg-green-50 text-green-700' :
                            r.status === 'rejected' ? 'bg-red-50 text-red-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {r.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {new Date(r.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="px-4 py-2 bg-bg border border-border text-text-secondary hover:text-primary hover:border-primary rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
                          >
                            <i className="fas fa-external-link-alt"></i> View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-navy/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[900px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-border flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Side */}
            <div className="w-full md:w-1/2 bg-black relative flex items-center justify-center overflow-hidden">
              <button
                onClick={() => setSelectedReport(null)}
                className="md:hidden absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors border border-white/10"
              >
                ×
              </button>
              <img
                src={`${BACKEND_URL}${selectedReport.afterPhoto}`}
                alt="Work complete"
                className="w-full h-full object-contain max-h-[40vh] md:max-h-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Photo";
                }}
              />
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 flex flex-col max-h-[90vh] bg-card">
              <div className="p-6 border-b border-border flex justify-between items-center hidden md:flex shrink-0">
                <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                  <i className="fas fa-clipboard-check text-primary"></i> Work Report
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
                {/* Worker Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-bg to-bg/50 rounded-xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {selectedReport.workerId?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Submitted By</p>
                    <p className="font-bold text-navy">{selectedReport.workerId?.name}</p>
                    <p className="text-xs text-text-secondary">{selectedReport.workerId?.employeeId}</p>
                  </div>
                </div>

                {/* Complaint Info */}
                <div>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-3">Complaint Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-bg p-3 rounded-xl border border-border">
                      <span className="block text-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">ID</span>
                      <span className="font-semibold text-navy">{selectedReport.complaintId?.complaintId || (typeof selectedReport.complaintId === 'string' ? selectedReport.complaintId : "Unknown/Deleted")}</span>
                    </div>
                    <div className="bg-bg p-3 rounded-xl border border-border">
                      <span className="block text-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Issue</span>
                      <span className="font-semibold text-navy truncate block" title={selectedReport.complaintId?.issueType || "Unknown"}>
                        {selectedReport.complaintId?.issueType || "Unknown"}
                      </span>
                    </div>
                    <div className="col-span-2 bg-bg p-3 rounded-xl border border-border">
                      <span className="block text-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Consumer</span>
                      <span className="font-medium text-navy">{selectedReport.complaintId?.consumerName || "Unknown"}</span>
                    </div>
                  </div>
                </div>

                {/* Report Text */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fas fa-tools text-primary/70"></i> Work Performed
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed bg-blue-50/40 p-4 rounded-xl border-l-[3px] border-primary">
                      {selectedReport.workPerformed}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fas fa-check-circle text-green-500/70"></i> Condition After
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed bg-green-50/40 p-4 rounded-xl border-l-[3px] border-green-500">
                      {selectedReport.conditionAfter}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-border bg-gray-50/50 shrink-0 flex flex-col gap-3">
                <p className="text-[11px] text-text-muted font-semibold text-center uppercase tracking-wider">
                  Submitted • {new Date(selectedReport.submittedAt).toLocaleString()}
                </p>
                {(!selectedReport.status || selectedReport.status === 'pending') && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(selectedReport._id)}
                      className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <i className="fas fa-times mr-1.5"></i> Reject Work
                    </button>
                    <button
                      onClick={() => handleApprove(selectedReport._id)}
                      className="flex-1 px-4 py-2.5 bg-success text-white hover:bg-green-600 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-green-500/20"
                    >
                      <i className="fas fa-check mr-1.5"></i> Approve Work
                    </button>
                  </div>
                )}
                {selectedReport.status === 'approved' && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center justify-center font-semibold text-sm gap-2">
                    <i className="fas fa-check-circle"></i> Work Approved & Completed
                  </div>
                )}
                {selectedReport.status === 'rejected' && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-center font-semibold text-sm gap-2">
                    <i className="fas fa-times-circle"></i> Work Rejected (Sent back to worker)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
