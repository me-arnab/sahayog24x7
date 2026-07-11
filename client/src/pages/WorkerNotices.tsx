import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StatusBadge, NoticeTypeBadge } from "../components/StatusBadge";
import { getConsumerNotices } from "../api/notices";
import type { Notice } from "../types/notice";

export default function WorkerNotices() {
  const navigate = useNavigate();
  const { worker, isLoading: authLoading, logout } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState("");

  const loadNotices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getConsumerNotices();
      setNotices(data);
    } catch {
      setError("Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !worker) {
      navigate("/login");
      return;
    }
    if (worker) {
      loadNotices();
    }
  }, [authLoading, worker, navigate, loadNotices]);

  const filtered =
    typeFilter === "all"
      ? notices
      : notices.filter((n) => n.type === typeFilter);

  const typeCounts = notices.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto w-full space-y-6">


        {/* Header */}
        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-3">
              <i className="fas fa-bullhorn text-primary"></i>
              Notices & Announcements
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Stay informed with the latest updates.
            </p>
          </div>
          <button
            onClick={loadNotices}
            className="border border-border text-text-secondary px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer
              transition-all hover:border-primary hover:text-primary hover:bg-primary/5 flex items-center gap-1.5"
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === "all"
                ? "bg-gradient-to-r from-primary to-accent-cyan text-white shadow-md shadow-blue-500/20"
                : "bg-card border border-border text-text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            All ({notices.length})
          </button>
          {["Maintenance", "Payment", "Outage", "General"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === type
                  ? "bg-gradient-to-r from-primary to-accent-cyan text-white shadow-md shadow-blue-500/20"
                  : "bg-card border border-border text-text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              {type} ({typeCounts[type] || 0})
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-error text-sm p-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            Loading notices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
            <i className="fas fa-bullhorn text-4xl mb-3 block opacity-30"></i>
            {notices.length === 0
              ? "No notices available at the moment."
              : "No notices of this type."}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((notice) => (
              <div
                key={notice._id}
                onClick={() => setSelectedNotice(notice)}
                className="bg-card border border-border rounded-2xl p-6 transition-all cursor-pointer
                  hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4 max-md:flex-col">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      notice.type === "Outage"
                        ? "bg-red-50 text-red-600"
                        : notice.type === "Payment"
                        ? "bg-purple-50 text-purple-600"
                        : notice.type === "Maintenance"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <i
                      className={`fas ${
                        notice.type === "Outage"
                          ? "fa-bolt"
                          : notice.type === "Payment"
                          ? "fa-credit-card"
                          : notice.type === "Maintenance"
                          ? "fa-tools"
                          : "fa-info-circle"
                      }`}
                    ></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-navy text-base">
                        {notice.title}
                      </h3>
                      <StatusBadge status={notice.status} />
                      <NoticeTypeBadge type={notice.type} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted mb-3 flex-wrap">
                      <span>
                        <i className="fas fa-calendar-alt mr-1.5"></i>
                        {new Date(notice.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        —{" "}
                        {new Date(notice.endDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>
                        <i className="fas fa-clock mr-1.5"></i>
                        Posted{" "}
                        {new Date(notice.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                      {notice.message}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center max-md:self-end">
                    <i className="fas fa-chevron-right text-text-muted"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Notice Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-file-alt text-primary"></i>
                {selectedNotice.title}
              </h3>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Type</p>
                  <NoticeTypeBadge type={selectedNotice.type} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Status</p>
                  <StatusBadge status={selectedNotice.status} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Valid From</p>
                  <p className="font-semibold text-navy">
                    {new Date(selectedNotice.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">Valid Until</p>
                  <p className="font-semibold text-navy">
                    {new Date(selectedNotice.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <hr className="border-border" />
              <div>
                <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-2">Message</p>
                <p className="bg-bg p-4 rounded-xl border-l-[3px] border-primary text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {selectedNotice.message}
                </p>
              </div>
              <p className="text-xs text-text-muted">
                Posted: {new Date(selectedNotice.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-full bg-gradient-to-r from-primary to-accent-cyan text-white py-3 rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
