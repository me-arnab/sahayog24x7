import { useState, useEffect, useCallback } from "react";
import { getAssignedComplaints, getComplaintById } from "../api/complaints";
import type { CitizenComplaint } from "../types";

export default function WorkerSubmittedComplaints() {
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<CitizenComplaint | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAssignedComplaints();
      const submitted = data.filter((c) => ["PENDING_APPROVAL", "COMPLETED", "resolved"].includes(c.status));
      setComplaints(submitted);
    } catch (err) {
      console.error("Failed to load submitted complaints", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewDetail = async (id: string) => {
    try {
      const complaint = await getComplaintById(id);
      setSelectedComplaint(complaint);
    } catch {
      const local = complaints.find((c) => c._id === id);
      if (local) setSelectedComplaint(local);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
            <i className="fas fa-clipboard-check text-primary"></i>
            Submitted Work Reports
          </h1>
          <p className="text-text-muted mt-2">
            View complaints you have completed and submitted for admin review.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <i className="fas fa-history text-primary"></i>
              Submission History
            </h2>
            <button
              onClick={loadData}
              className="border border-border text-text-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
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
              <i className="fas fa-inbox text-4xl mb-3 block opacity-30"></i>
              No submitted complaints yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleViewDetail(c._id)}
                  className="bg-bg border border-border rounded-2xl p-5 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-dashed border-border">
                    <span className="font-semibold text-sm text-navy">{c.complaintId}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium flex items-center gap-2 mb-1 text-navy">
                      <i className="fas fa-exclamation-circle text-primary text-xs"></i>
                      {c.consumerName}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        c.status === "PENDING_APPROVAL"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        c.emergency ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.emergency ? "Emergency" : "Normal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-file-alt text-primary"></i> Submitted Details
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
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      selectedComplaint.status === "PENDING_APPROVAL"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {selectedComplaint.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <hr className="border-border" />
              <div>
                <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-2">Original Description</p>
                <p className="bg-bg p-4 rounded-xl border-l-[3px] border-primary text-text-secondary leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-border">
              {selectedComplaint.status === "PENDING_APPROVAL" && (
                <p className="w-full text-center text-purple-600 font-semibold bg-purple-50 py-3 rounded-xl">
                  <i className="fas fa-hourglass-half mr-1.5"></i> Work Submitted (Pending Admin Approval)
                </p>
              )}
              {selectedComplaint.status === "COMPLETED" && (
                <p className="w-full text-center text-success font-semibold bg-green-50 py-3 rounded-xl">
                  <i className="fas fa-check-circle mr-1"></i> Admin Approved & Completed
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
