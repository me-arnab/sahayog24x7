import { useCallback, useEffect, useState } from "react";
import { NoticeStats } from "../components/NoticeStats";
import { NoticeFilters } from "../components/NoticeFilters";
import { NoticeModal } from "../components/NoticeModal";
import { DeleteModal } from "../components/DeleteModal";
import { StatusBadge, NoticeTypeBadge } from "../components/StatusBadge";
import {
  getNotices,
  getNoticeStats,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticeStatus,
} from "../api/notices";
import type {
  Notice,
  NoticeFormData,
  NoticeStats as NoticeStatsData,
} from "../types/notice";

export default function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState<NoticeStatsData>({
    total: 0,
    active: 0,
    scheduled: 0,
    inactive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const notify = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const [noticesRes, statsData] = await Promise.all([
        getNotices({
          page,
          search: search || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          sort: sortOrder,
          limit: 10,
        }),
        getNoticeStats(),
      ]);
      setNotices(noticesRes.notices);
      setTotalPages(noticesRes.pagination.pages);
      setTotal(noticesRes.pagination.total);
      setStats(statsData);
    } catch {
      setError("Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, typeFilter, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortOrder("newest");
    setPage(1);
  };

  const handleCreate = async (data: NoticeFormData) => {
    setIsSubmitting(true);
    try {
      await createNotice(data);
      notify("Notice created successfully");
      setShowAddModal(false);
      loadData();
    } catch (err) {
      notify(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create notice",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: NoticeFormData) => {
    if (!editingNotice) return;
    setIsSubmitting(true);
    try {
      await updateNotice(editingNotice._id, data);
      notify("Notice updated successfully");
      setEditingNotice(null);
      loadData();
    } catch (err) {
      notify(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update notice",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingNotice) return;
    setIsDeleting(true);
    try {
      await deleteNotice(deletingNotice._id);
      notify("Notice deleted successfully");
      setDeletingNotice(null);
      loadData();
    } catch {
      notify("Failed to delete notice", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (notice: Notice) => {
    try {
      const result = await toggleNoticeStatus(notice._id);
      notify(result.message);
      loadData();
    } catch {
      notify("Failed to toggle notice status", "error");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const getAudienceBadge = (audience: string) => {
    const map: Record<string, string> = {
      Citizen: "bg-teal-50 text-teal-700",
      Worker: "bg-indigo-50 text-indigo-700",
    };
    return `px-2 py-0.5 rounded-md text-[10px] font-semibold ${
      map[audience] || "bg-slate-100 text-slate-600"
    }`;
  };

  return (
    <div className="w-full">
      <div className="max-w-[1500px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-3">
              <i className="fas fa-bullhorn text-primary"></i>
              Notices
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Create and manage notices for consumers.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-primary to-accent-cyan text-white px-6 py-3 rounded-xl
              font-semibold text-sm shadow-md shadow-blue-500/20 transition-all
              hover:-translate-y-0.5 hover:shadow-lg cursor-pointer flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Notice
          </button>
        </div>

        {/* Stats */}
        <NoticeStats stats={stats} />

        {/* Main Content */}
        <div className="grid grid-cols-[300px_1fr] gap-6 max-lg:grid-cols-1">
          {/* Sidebar Filters */}
          <NoticeFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            typeFilter={typeFilter}
            onTypeFilterChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
            sortOrder={sortOrder}
            onSortOrderChange={(v) => {
              setSortOrder(v);
              setPage(1);
            }}
            onClear={clearFilters}
          />

          {/* Notice List */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between max-md:flex-col max-md:gap-3">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-list text-primary"></i>
                All Notices
                <span className="text-sm font-normal text-text-muted">
                  ({total} total)
                </span>
              </h2>
              <button
                onClick={() => {
                  setPage(1);
                  loadData();
                }}
                className="border border-border text-text-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer
                  transition-all hover:border-primary hover:text-primary hover:bg-primary/5 flex items-center gap-1.5"
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-error text-sm p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading ? (
              <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                Loading notices...
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-16 text-text-muted bg-card border border-border rounded-2xl">
                <i className="fas fa-bullhorn text-4xl mb-3 block opacity-30"></i>
                No notices found
                {search || statusFilter !== "all" || typeFilter !== "all"
                  ? " matching your filters"
                  : ". Click 'Add Notice' to create one."}
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div
                    key={notice._id}
                    className="bg-card border border-border rounded-2xl p-5 transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <div className="flex items-start gap-4 max-md:flex-col">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        <i className="fas fa-bullhorn text-lg"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-navy text-base">
                            {notice.title}
                          </h3>
                          <StatusBadge status={notice.status} />
                          <NoticeTypeBadge type={notice.type} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted mb-2 flex-wrap">
                          <span>
                            <i className="fas fa-users mr-1"></i>
                            <span className={getAudienceBadge(notice.audience)}>
                              {notice.audience}
                            </span>
                          </span>
                          <span>
                            <i className="fas fa-calendar-alt mr-1"></i>
                            {new Date(notice.startDate).toLocaleDateString()}{" "}
                            → {new Date(notice.endDate).toLocaleDateString()}
                          </span>
                          <span>
                            <i className="fas fa-clock mr-1"></i>
                            Created{" "}
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                          {notice.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap max-md:self-start">
                        <button
                          onClick={() => setViewingNotice(notice)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary
                            hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => setEditingNotice(notice)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-border text-text-secondary
                            hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(notice)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                            ${
                              notice.status === "Active"
                                ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400"
                                : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400"
                            }`}
                          title={
                            notice.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <i
                            className={`fas ${
                              notice.status === "Active"
                                ? "fa-pause"
                                : "fa-play"
                            }`}
                          ></i>
                        </button>
                        <button
                          onClick={() => setDeletingNotice(notice)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-border text-error
                            hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-text-secondary
                    hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fas fa-chevron-left mr-1"></i> Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        p === page
                          ? "bg-gradient-to-r from-primary to-accent-cyan text-white shadow-md shadow-blue-500/20"
                          : "border border-border text-text-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-text-secondary
                    hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Notice Modal */}
      <NoticeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      {/* Edit Notice Modal */}
      <NoticeModal
        isOpen={!!editingNotice}
        onClose={() => setEditingNotice(null)}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
        notice={editingNotice}
      />

      {/* View Notice Modal */}
      {viewingNotice && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={() => setViewingNotice(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <i className="fas fa-file-alt text-primary"></i>
                {viewingNotice.title}
              </h3>
              <button
                onClick={() => setViewingNotice(null)}
                className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">
                    Type
                  </p>
                  <NoticeTypeBadge type={viewingNotice.type} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">
                    Status
                  </p>
                  <StatusBadge status={viewingNotice.status} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">
                    Audience
                  </p>
                  <span
                    className={getAudienceBadge(viewingNotice.audience)}
                  >
                    {viewingNotice.audience}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="font-semibold text-navy">
                    {new Date(viewingNotice.startDate).toLocaleDateString()}{" "}
                    → {new Date(viewingNotice.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-2">
                  Message
                </p>
                <p className="bg-bg p-4 rounded-xl border-l-[3px] border-primary text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {viewingNotice.message}
                </p>
              </div>

              <p className="text-xs text-text-muted">
                Created: {new Date(viewingNotice.createdAt).toLocaleString()}
                {viewingNotice.updatedAt !== viewingNotice.createdAt &&
                  ` · Updated: ${new Date(
                    viewingNotice.updatedAt
                  ).toLocaleString()}`}
              </p>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setViewingNotice(null)}
                className="flex-1 bg-gradient-to-r from-primary to-accent-cyan text-white py-3 rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deletingNotice}
        onClose={() => setDeletingNotice(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Notice"
        message={`Are you sure you want to delete "${deletingNotice?.title}"? This action cannot be undone.`}
      />

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-24 right-6 px-5 py-3.5 rounded-xl text-white font-semibold text-sm
            shadow-lg z-[2000] max-w-[350px] animate-slide-in
            ${notification.type === "success" ? "bg-success" : "bg-error"}`}
        >
          <i
            className={`fas ${
              notification.type === "success"
                ? "fa-check-circle"
                : "fa-times-circle"
            } mr-2`}
          ></i>
          {notification.message}
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
