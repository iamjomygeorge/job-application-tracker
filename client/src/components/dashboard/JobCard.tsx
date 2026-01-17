import { JobApplication } from "@/types";

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: number) => void;
}

const STATUS_COLORS = {
  Applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Interview: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Offer: "bg-green-500/10 text-green-500 border-green-500/20",
  Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  return (
    <div className="glass-panel group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-primary/10 overflow-hidden">
      <div
        className={`absolute top-0 inset-x-0 h-1.5 w-full bg-linear-to-r ${
          job.status === "Offer"
            ? "from-emerald-400 to-emerald-600"
            : job.status === "Interview"
            ? "from-violet-400 to-violet-600"
            : job.status === "Rejected"
            ? "from-rose-400 to-rose-600"
            : "from-blue-400 to-blue-600"
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100">
            {/* Icon Placeholder */}
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
              STATUS_COLORS[job.status]
            }`}
          >
            {job.status}
          </span>
        </div>

        <h3
          className="text-xl font-bold text-foreground mb-1 line-clamp-1"
          title={job.company}
        >
          {job.company}
        </h3>
        <p
          className="text-gray-500 dark:text-gray-400 font-medium mb-6 line-clamp-1"
          title={job.role}
        >
          {job.role}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-4 h-4 flex items-center justify-center">📅</span>
            {job.applied_date
              ? new Date(job.applied_date).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })
              : "No applied date"}
          </div>

          {job.job_link && (
            <a
              href={job.job_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors group/link w-fit"
            >
              <span className="w-4 h-4 flex items-center justify-center">
                🔗
              </span>
              Link to Job
            </a>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <button
          onClick={() => onEdit(job)}
          className="text-sm font-medium text-gray-500 hover:text-foreground transition-colors"
        >
          Edit Details
        </button>
        <button
          onClick={() => onDelete(job.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
