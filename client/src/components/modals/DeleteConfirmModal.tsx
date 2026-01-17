interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl bg-background border border-border">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
            ✕
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            Delete Application?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Are you sure you want to delete this application? This action cannot
            be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
