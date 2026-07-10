import { useState, useEffect } from "react";
import type { Notice, NoticeFormData, NoticeStatus } from "../types/notice";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoticeFormData) => Promise<void>;
  isSubmitting: boolean;
  notice?: Notice | null;
}

const emptyForm: NoticeFormData = {
  title: "",
  message: "",
  type: "General",
  audience: "Citizen",
  status: "Active",
  startDate: "",
  endDate: "",
};

const toLocalDatetime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const noticeTypes = ["Maintenance", "Payment", "Outage", "General"] as const;
const audiences = ["Citizen", "Worker"] as const;
const statuses: NoticeStatus[] = ["Active", "Scheduled", "Inactive"];

export function NoticeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  notice,
}: NoticeModalProps) {
  const [form, setForm] = useState<NoticeFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof NoticeFormData, string>>>({});

  const isEditing = !!notice;

  useEffect(() => {
    if (notice) {
      setForm({
        title: notice.title,
        message: notice.message,
        type: notice.type,
        audience: notice.audience,
        status: notice.status,
        startDate: toLocalDatetime(notice.startDate),
        endDate: toLocalDatetime(notice.endDate),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [notice, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NoticeFormData, string>> = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    else if (form.title.length > 200)
      newErrors.title = "Title must not exceed 200 characters";

    if (!form.message.trim()) newErrors.message = "Message is required";
    else if (form.message.length > 5000)
      newErrors.message = "Message must not exceed 5000 characters";

    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      newErrors.endDate = "End date must be on or after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const handleChange = (
    field: keyof NoticeFormData,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl max-w-[580px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy flex items-center gap-2">
            <i className={`fas ${isEditing ? "fa-edit" : "fa-plus-circle"} text-primary`}></i>
            {isEditing ? "Edit Notice" : "Add Notice"}
          </h3>
          <button
            onClick={onClose}
            className="text-2xl text-text-muted hover:text-navy transition-colors bg-transparent border-none cursor-pointer leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter notice title"
              className={`w-full p-3 border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                errors.title ? "border-red-300 bg-red-50" : "border-border"
              }`}
            />
            {errors.title && (
              <p className="text-error text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Notice Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {noticeTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Audience *
              </label>
              <select
                value={form.audience}
                onChange={(e) => handleChange("audience", e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {audiences.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as NoticeStatus)
                }
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={`w-full p-3 border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                  errors.startDate ? "border-red-300 bg-red-50" : "border-border"
                }`}
              />
              {errors.startDate && (
                <p className="text-error text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={`w-full p-3 border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                  errors.endDate ? "border-red-300 bg-red-50" : "border-border"
                }`}
              />
              {errors.endDate && (
                <p className="text-error text-xs mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Message *
            </label>
            <textarea
              rows={6}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Write the notice message..."
              className={`w-full p-3 border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-vertical ${
                errors.message ? "border-red-300 bg-red-50" : "border-border"
              }`}
            />
            {errors.message && (
              <p className="text-error text-xs mt-1">{errors.message}</p>
            )}
            <p className="text-xs text-text-muted mt-1 text-right">
              {form.message.length}/5000
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-white border border-border text-text-secondary py-3 rounded-xl font-semibold text-sm cursor-pointer
                hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-accent-cyan text-white py-3 rounded-xl font-semibold text-sm
                cursor-pointer shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  {isEditing ? "Updating..." : "Adding..."}
                </span>
              ) : (
                <span>
                  <i className={`fas ${isEditing ? "fa-save" : "fa-plus"} mr-1.5`}></i>
                  {isEditing ? "Update Notice" : "Add Notice"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
