"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomSelect from "@/components/CustomSelect";
import { useAuth } from "@/context/AuthContext";
import { JobApplication, JobStatus } from "@/types";
import { applicationsService } from "@/services/applications.service";

import AuthScreen from "@/components/auth/AuthScreen";
import StatsGrid from "@/components/dashboard/StatsGrid";
import JobCard from "@/components/dashboard/JobCard";
import JobFormModal from "@/components/modals/JobFormModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

function DashboardContent() {
  const { session } = useAuth();

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<JobStatus | "All">("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = useCallback(
    async (showLoading = true) => {
      if (!session?.access_token) return;
      if (showLoading) setLoading(true);
      try {
        const data = await applicationsService.getAll(session.access_token);
        setJobs(data || []);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  useEffect(() => {
    if (session) {
      fetchJobs(true);
    } else {
      setLoading(false);
    }
  }, [session, fetchJobs]);

  const handleSaveJob = async (formData: Partial<JobApplication>) => {
    if (!session?.access_token) return;
    try {
      if (editingJob) {
        await applicationsService.update(
          editingJob.id,
          formData,
          session.access_token
        );
      } else {
        await applicationsService.create(formData, session.access_token);
      }
      setIsFormOpen(false);
      setEditingJob(null);
      fetchJobs(false);
    } catch (error) {
      console.error("Failed to save job", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !session?.access_token) return;
    setIsDeleting(true);
    try {
      await applicationsService.delete(deleteId, session.access_token);
      setJobs(jobs.filter((j) => j.id !== deleteId));
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

  const filteredJobs = jobs.filter((job) =>
    filterStatus === "All" ? true : job.status === filterStatus
  );

  if (!session) {
    if (loading) return null;
    return <AuthScreen />;
  }

  return (
    <ProtectedRoute>
      {loading ? (
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
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pt-8">
            <div>
              <h1 className="text-4xl md:text-2xl font-extrabold text-foreground mb-4 tracking-tight">
                My Applications
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
                Manage your job applications.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await fetchJobs(false);
                  setIsRefreshing(false);
                }}
                className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-foreground transition-all shadow-sm"
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
              <div className="w-52">
                <CustomSelect
                  value={filterStatus}
                  onChange={(val: string) =>
                    setFilterStatus(val as JobStatus | "All")
                  }
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
                onClick={openNewJobModal}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg font-medium"
              >
                <span>+</span> New Application
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid
            jobs={jobs}
            filterStatus={filterStatus}
            setFilterStatus={(s) => setFilterStatus(s as JobStatus)}
          />

          {/* Job List */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <h3 className="text-xl font-medium text-foreground mb-2">
                No applications found
              </h3>
              <p className="text-gray-500 mb-6">
                Start tracking your job search by adding your first application.
              </p>
              <button
                onClick={openNewJobModal}
                className="text-primary hover:text-primary/80 font-medium"
              >
                + Add New Application
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

          {/* Modals */}
          {isFormOpen && (
            <JobFormModal
              isOpen={isFormOpen}
              editingJob={editingJob}
              onClose={() => setIsFormOpen(false)}
              onSave={handleSaveJob}
            />
          )}

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
