import { JobApplication, JobStatus, FilterStatus } from "@/types";

interface StatsGridProps {
  jobs: JobApplication[];
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
}

export default function StatsGrid({
  jobs,
  filterStatus,
  setFilterStatus,
}: StatsGridProps) {
  const stats: JobStatus[] = ["Applied", "Interview", "Offer", "Rejected"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((status) => {
        const isSelected = filterStatus === status;
        const count = jobs.filter((j) => j.status === status).length;

        let activeClass = "";
        let iconClass = "";

        if (status === "Offer") {
          activeClass = "bg-green-600 text-white";
          iconClass =
            "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400";
        } else if (status === "Interview") {
          activeClass = "bg-purple-600 text-white";
          iconClass =
            "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
        } else if (status === "Rejected") {
          activeClass = "bg-red-600 text-white";
          iconClass =
            "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400";
        } else {
          activeClass = "bg-blue-600 text-white";
          iconClass =
            "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
        }

        const containerClass = isSelected
          ? activeClass
          : "glass-panel border border-transparent hover:border-gray-200 dark:hover:border-white/10";

        const iconContainerClass = isSelected
          ? "bg-white/20 text-white"
          : iconClass;

        return (
          <div
            key={status}
            onClick={() => setFilterStatus(isSelected ? "All" : status)}
            className={`p-4 rounded-xl flex items-center justify-between group hover:scale-[1.02] transition-all cursor-pointer shadow-sm ${containerClass}`}
          >
            <div>
              <p
                className={`text-sm font-medium ${
                  isSelected
                    ? "text-white/90"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {status}
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  isSelected ? "text-white" : "text-foreground"
                }`}
              >
                {count}
              </p>
            </div>
            <div className={`p-3 rounded-full ${iconContainerClass}`}>
              <div className="w-6 h-6 flex items-center justify-center font-bold text-lg">
                {status === "Applied" && (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
                {status === "Interview" && (
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
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
                {status === "Offer" && (
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {status === "Rejected" && (
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
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
