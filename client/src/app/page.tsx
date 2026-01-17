"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomSelect from "@/components/CustomSelect";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  applied_date: string | null;
  notes: string | null;
  job_link: string | null;
  created_at: string;
}

const STATUS_COLORS = {
  Applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Interview: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Offer: "bg-green-500/10 text-green-500 border-green-500/20",
  Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

function DashboardContent() {
  const { session } = useAuth();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Applied",
    applied_date: "",
    notes: "",
    job_link: "",
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialFetchDone = useRef(false);

  const fetchJobs = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/applications`,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const filteredJobs = jobs.filter((job) =>
    filterStatus === "All" ? true : job.status === filterStatus
  );

  useEffect(() => {
    if (session) {
      if (!initialFetchDone.current) {
        fetchJobs(true);
        initialFetchDone.current = true;
      } else {
        fetchJobs(false);
      }
    } else {
      setLoading(false);
    }
  }, [session, fetchJobs]);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthError(null);
  }, [session]);

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "signup") {
      setAuthView(authParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingJob
        ? `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/applications/${editingJob.id}`
        : `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/applications`;

      const method = editingJob ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingJob(null);
        setFormData({
          company: "",
          role: "",
          status: "Applied",
          applied_date: "",
          notes: "",
          job_link: "",
        });
        fetchJobs();
      }
    } catch (error) {
      console.error("Failed to save job", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setJobToDelete(id);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Artificial delay for better UX
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/applications/${jobToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (res.ok) {
        setJobs(jobs.filter((job) => job.id !== jobToDelete));
        setJobToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete job", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (job: JobApplication) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      role: job.role,
      status: job.status,
      applied_date: job.applied_date
        ? new Date(job.applied_date).toISOString().split("T")[0]
        : "",
      notes: job.notes || "",
      job_link: job.job_link || "",
    });
    setIsModalOpen(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (authView === "signup" && password !== confirmPassword) {
      setAuthError("Passwords do not match");
      setAuthLoading(false);
      return;
    }

    try {
      if (authView === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("An unknown error occurred");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  if (!session) {
    if (loading) return null;

    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center md:text-left animate-in fade-in slide-in-from-left-8 duration-1000 delay-100">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 leading-tight">
                Track Your <span className="text-primary">Applications</span>
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto md:mx-0">
                Stop losing track of your applications. Organize, track, and
                manage your job search journey in one beautiful dashboard.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Track All
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Keep all your applications in one place.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 text-purple-500">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Insights</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Visualize your progress with stats.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel w-full max-w-md mx-auto rounded-2xl p-8 shadow-2xl backdrop-blur-xl bg-background/50 border border-border animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {authView === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {authView === "login"
                  ? "Sign in to manage your applications"
                  : "Start tracking your applications today"}
              </p>
            </div>

            {authError && (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-input w-full rounded-xl px-4 py-3 text-foreground placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="glass-input w-full rounded-xl px-4 py-3 text-foreground placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your password"
                />
              </div>

              {authView === "signup" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="glass-input w-full rounded-xl px-4 py-3 text-foreground placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    {authView === "login"
                      ? "Signing in..."
                      : "Creating account..."}
                  </div>
                ) : authView === "login" ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {authView === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setAuthView(authView === "login" ? "signup" : "login");
                  setAuthError(null);
                }}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {authView === "login" ? "Sign up" : "Sign in instead"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
        <>
          <div className="w-[95%] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
                  className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-foreground hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow active:scale-95"
                  title="Load Latest"
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
                    onChange={setFilterStatus}
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
                  onClick={() => {
                    setEditingJob(null);
                    setFormData({
                      company: "",
                      role: "",
                      status: "Applied",
                      applied_date: "",
                      notes: "",
                      job_link: "",
                    });
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 font-medium"
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
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Application
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {["Applied", "Interview", "Offer", "Rejected"].map((status) => {
                const isSelected = filterStatus === status;

                const activeClasses = isSelected
                  ? status === "Offer"
                    ? "bg-green-600 text-white"
                    : status === "Interview"
                    ? "bg-purple-600 text-white"
                    : status === "Rejected"
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
                  : "glass-panel border border-transparent hover:border-gray-200 dark:hover:border-white/10";

                return (
                  <div
                    key={status}
                    onClick={() => setFilterStatus(isSelected ? "All" : status)}
                    className={`p-4 rounded-xl flex items-center justify-between group hover:scale-[1.02] transition-all cursor-pointer shadow-sm ${activeClasses}`}
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
                        {jobs.filter((j) => j.status === status).length}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : status === "Offer"
                          ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                          : status === "Interview"
                          ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                          : status === "Rejected"
                          ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                      }`}
                    >
                      {status === "Offer" && (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {status === "Interview" && (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                          />
                        </svg>
                      )}
                      {status === "Rejected" && (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      {status === "Applied" && (
                        <svg
                          className="w-6 h-6"
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
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-2xl">
                <h3 className="text-xl font-medium text-foreground mb-2">
                  {filterStatus === "All"
                    ? "No applications found"
                    : `No ${filterStatus} applications found`}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {filterStatus === "All"
                    ? "Start tracking your job search by adding your first application."
                    : `You don't have any applications with the status "${filterStatus}" yet.`}
                </p>
                <button
                  onClick={() => {
                    if (filterStatus === "All") {
                      setIsModalOpen(true);
                    } else {
                      setFilterStatus("All");
                    }
                  }}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {filterStatus === "All"
                    ? "+ Add New Application"
                    : "Show All Applications"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="glass-panel group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-primary/10 overflow-hidden"
                  >
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
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {job.applied_date
                            ? new Date(job.applied_date).toLocaleDateString(
                                undefined,
                                { dateStyle: "medium" }
                              )
                            : "No applied date"}
                        </div>

                        {job.job_link && (
                          <a
                            href={job.job_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors group/link w-fit"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            Link to Job
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => openEditModal(job)}
                        className="text-sm font-medium text-gray-500 hover:text-foreground transition-colors"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
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
                ))}
              </div>
            )}

            {isModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    const hasContent =
                      formData.company ||
                      formData.role ||
                      formData.job_link ||
                      formData.notes;
                    if (hasContent && !editingJob) {
                      // Only confirm for new applications to avoid annoying edits
                      setShowConfirmDialog(true);
                    } else {
                      setIsModalOpen(false);
                    }
                  }
                }}
              >
                <div
                  className="glass-panel w-full max-w-2xl rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 bg-background/95 dark:bg-background/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      {editingJob ? "Edit Application" : "Add Application"}
                    </h2>
                    <button
                      onClick={() => {
                        const hasContent =
                          formData.company ||
                          formData.role ||
                          formData.job_link ||
                          formData.notes;
                        if (hasContent && !editingJob) {
                          setShowConfirmDialog(true);
                        } else {
                          setIsModalOpen(false);
                        }
                      }}
                      className="text-gray-400 hover:text-foreground"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                          Company *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                          className="glass-input w-full rounded-lg px-3 py-2 text-foreground"
                          placeholder="e.g. Google"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
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
                          placeholder="e.g. Senior Dev"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                          Status *
                        </label>
                        <CustomSelect
                          value={formData.status}
                          onChange={(value) =>
                            setFormData({ ...formData, status: value })
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
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                          Applied Date
                        </label>
                        <input
                          type="date"
                          value={formData.applied_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              applied_date: e.target.value,
                            })
                          }
                          className="glass-input w-full rounded-lg px-3 py-2 text-foreground dark:scheme-dark"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                        Job Link
                      </label>
                      <input
                        type="url"
                        value={formData.job_link}
                        onChange={(e) =>
                          setFormData({ ...formData, job_link: e.target.value })
                        }
                        className="glass-input w-full rounded-lg px-3 py-2 text-foreground"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="glass-input w-full rounded-lg px-3 py-2 text-foreground"
                        placeholder="Interview notes, thoughts, etc..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          const hasContent =
                            formData.company ||
                            formData.role ||
                            formData.job_link ||
                            formData.notes;
                          if (hasContent && !editingJob) {
                            setShowConfirmDialog(true);
                          } else {
                            setIsModalOpen(false);
                          }
                        }}
                        className="flex-1 py-2 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                      >
                        {submitting && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {submitting
                          ? "Saving..."
                          : editingJob
                          ? "Update"
                          : "Add Application"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          {showConfirmDialog && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl bg-background border border-border transform transition-all scale-100">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Unsaved Changes
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                  You have unsaved changes. Are you sure you want to discard
                  them?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 py-2 text-sm font-medium rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setIsModalOpen(false);
                    }}
                    className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {jobToDelete && (
            <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl bg-background border border-border transform transition-all scale-100">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6"
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
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Delete Application?
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Are you sure you want to delete this application? This
                    action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setJobToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </ProtectedRoute>
  );
}

export default function Home() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
