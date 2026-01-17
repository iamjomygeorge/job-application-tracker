import { JobApplication, JobStatus } from "@/types";

interface StatsGridProps {
  jobs: JobApplication[];
  filterStatus: string;
  setFilterStatus: (status: JobStatus) => void;
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
              {/* Simplified icon rendering */}
              <div className="w-6 h-6 flex items-center justify-center font-bold text-lg">
                {status === "Applied" && "📄"}
                {status === "Interview" && "🎤"}
                {status === "Offer" && "🎉"}
                {status === "Rejected" && "✕"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
