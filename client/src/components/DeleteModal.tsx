interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title: string;
  message: string;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title,
  message,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-navy/70 backdrop-blur-sm z-[60] flex items-center justify-center p-5"
      onClick={!isDeleting ? onClose : undefined}
    >
      <div
        className="bg-card rounded-2xl max-w-[460px] w-full shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-navy flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-error"></i>
            {title}
          </h3>
        </div>

        <div className="p-6">
          <p className="text-sm text-text-secondary leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-white border border-border text-text-secondary py-3 rounded-xl font-semibold text-sm cursor-pointer
              hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-error text-white py-3 rounded-xl font-semibold text-sm cursor-pointer
              shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Deleting...
              </span>
            ) : (
              <span>
                <i className="fas fa-trash mr-1.5"></i> Delete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
