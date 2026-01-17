import { useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import { JobApplication, JobFormData, ApplicationStatus } from "@/types";

interface JobFormModalProps {
  isOpen: boolean;
  editingJob: JobApplication | null;
  onClose: () => void;
  onSave: (data: JobFormData) => Promise<void>;
}

const INITIAL_DATA: JobFormData = {
  company: "",
  role: "",
  status: "Applied",
  applied_date: "",
  notes: "",
  job_link: "",
};

function JobForm({ editingJob, onClose, onSave }: JobFormModalProps) {
  const [formData, setFormData] = useState<JobFormData>(() => {
    if (editingJob) {
      return {
        company: editingJob.company,
        role: editingJob.role,
        status: editingJob.status,
        applied_date: editingJob.applied_date
          ? new Date(editingJob.applied_date).toISOString().split("T")[0]
          : "",
        notes: editingJob.notes || "",
        job_link: editingJob.job_link || "",
      };
    }
    return INITIAL_DATA;
  });

  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const isValidUrl = (string: string) => {
    if (!string) return true;
    try {
      const url = new URL(string);
      // Basic check for TLD (must have at least one dot in hostname)
      return url.protocol.startsWith("http") && url.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    if (formData.job_link && !isValidUrl(formData.job_link)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    const payload = {
      ...formData,
      applied_date: formData.applied_date || null,
      notes: formData.notes || null,
      job_link: formData.job_link || null,
    };

    setSubmitting(true);
    await onSave(payload as unknown as JobFormData);
    setSubmitting(false);
  };

  const handleClose = () => {
    const originalData = editingJob
      ? {
          company: editingJob.company,
          role: editingJob.role,
          status: editingJob.status,
          applied_date: editingJob.applied_date
            ? new Date(editingJob.applied_date).toISOString().split("T")[0]
            : "",
          notes: editingJob.notes || "",
          job_link: editingJob.job_link || "",
        }
      : INITIAL_DATA;

    const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);

    if (isDirty) {
      setShowConfirmDiscard(true);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {!showConfirmDiscard && (
        <div className="glass-panel w-full max-w-2xl rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 bg-background/95">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {editingJob ? "Edit Application" : "Add Application"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="glass-input w-full rounded-lg px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="glass-input w-full rounded-lg px-3 py-2 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Status *
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as ApplicationStatus,
                    })
                  }
                  options={[
                    { label: "Applied", value: "Applied" },
                    { label: "Interview", value: "Interview" },
                    { label: "Offer", value: "Offer" },
                    { label: "Rejected", value: "Rejected" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Applied Date
                </label>
                <input
                  type="date"
                  value={formData.applied_date}
                  onChange={(e) =>
                    setFormData({ ...formData, applied_date: e.target.value })
                  }
                  className="glass-input w-full rounded-lg px-3 py-2 text-foreground dark:scheme-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Job Link
              </label>
              <input
                type="url"
                value={formData.job_link}
                onChange={(e) =>
                  setFormData({ ...formData, job_link: e.target.value })
                }
                className={`glass-input w-full rounded-lg px-3 py-2 text-foreground ${
                  urlError ? "border-red-500 ring-2 ring-red-500/20" : ""
                }`}
              />
              {urlError && (
                <p className="mt-1 text-xs text-red-500">{urlError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="glass-input w-full rounded-lg px-3 py-2 text-foreground"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-lg"
              >
                {submitting
                  ? "Saving..."
                  : editingJob
                  ? "Update"
                  : "Add Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showConfirmDiscard && (
        <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl bg-background border border-border">
          <h3 className="text-lg font-bold text-foreground mb-2">
            Unsaved Changes
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            You have unsaved changes. Are you sure you want to discard them?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmDiscard(false)}
              className="flex-1 py-2 text-sm font-medium rounded-lg border border-border"
            >
              Keep Editing
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-500 text-white"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobFormModal(props: JobFormModalProps) {
  if (!props.isOpen) return null;
  return (
    <JobForm key={props.editingJob ? props.editingJob.id : "new"} {...props} />
  );
}
