"use client";

import { useState, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomSelect from "@/components/CustomSelect";
import { useAuth } from "@/context/AuthContext";
import { JobApplication, JobFormData, JobStatus } from "@/types";
import { useApplications } from "@/context/ApplicationsContext";

import AuthScreen from "@/components/auth/AuthScreen";
import StatsGrid from "@/components/dashboard/StatsGrid";
import JobCard from "@/components/dashboard/JobCard";
import JobFormModal from "@/components/modals/JobFormModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

function DashboardContent() {
  const { session, loading: authLoading } = useAuth();
  const {
    jobs,
    loading: jobsLoading,
    refreshJobs,
    addJob,
    updateJob,
    deleteJob,
  } = useApplications();
  const [filterStatus, setFilterStatus] = useState<JobStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSaveJob = async (formData: JobFormData) => {
    try {
      if (editingJob) {
        await updateJob(editingJob.id, formData);
      } else {
        await addJob(formData);
      }
      setIsFormOpen(false);
      setEditingJob(null);
    } catch (error) {
      console.error("Failed to save job", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteJob(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openNewJobModal = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      filterStatus === "All" ? true : job.status === filterStatus;
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (authLoading) return null;
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <ProtectedRoute>
      {jobsLoading ? (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-gray-500 font-medium animate-pulse">
              Loading dashboard...
            </p>
          </div>
        </div>
      ) : (
        <div className="w-[95%] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pt-8">
            <div>
              <h1 className="text-4xl md:text-2xl font-extrabold text-foreground mb-4 tracking-tight">
                My Applications <span className="">({jobs.length})</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                Manage your job applications.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search company or role"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg glass-input w-full text-sm text-foreground placeholder-gray-400 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5"
                />
              </div>

              <div className="w-52">
                <CustomSelect
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val as JobStatus | "All")}
                  options={[
                    { label: "All Applications", value: "All" },
                    { label: "Applied", value: "Applied" },
                    { label: "Interview", value: "Interview" },
                    { label: "Offers", value: "Offer" },
                    { label: "Rejected", value: "Rejected" },
                  ]}
                />
              </div>

              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await refreshJobs();
                  setIsRefreshing(false);
                }}
                className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-foreground transition-all shadow-sm"
                title="Refresh List"
              >
                <svg
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              <button
                onClick={openNewJobModal}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg font-medium"
              >
                <span>+</span> New Application
              </button>
            </div>
          </div>

          <StatsGrid
            jobs={jobs}
            filterStatus={filterStatus}
            setFilterStatus={(s) => setFilterStatus(s)}
          />

          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <h3 className="text-xl font-medium text-foreground mb-2">
                {searchQuery || filterStatus !== "All"
                  ? "No matching applications"
                  : "No applications found"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterStatus !== "All"
                  ? "Try adjusting your search or filters."
                  : "Start tracking your job search by adding your first application."}
              </p>
              <button
                onClick={
                  searchQuery || filterStatus !== "All"
                    ? () => {
                        setSearchQuery("");
                        setFilterStatus("All");
                      }
                    : openNewJobModal
                }
                className="text-primary hover:text-primary/80 font-medium"
              >
                {searchQuery || filterStatus !== "All"
                  ? "Clear Filters"
                  : "+ Add New Application"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={(j) => {
                    setEditingJob(j);
                    setIsFormOpen(true);
                  }}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          )}

          <JobFormModal
            isOpen={isFormOpen}
            editingJob={editingJob}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSaveJob}
          />

          <DeleteConfirmModal
            isOpen={!!deleteId}
            isDeleting={isDeleting}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
          />
        </div>
      )}
    </ProtectedRoute>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
