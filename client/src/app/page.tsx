"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomSelect from "@/components/CustomSelect";
import { useAuth } from "@/context/AuthContext";
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

export default function Home() {
  const { session } = useAuth();

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

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/applications${
          filterStatus !== "All" ? `?status=${filterStatus}` : ""
        }`,
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
  }, [session, filterStatus]);

  useEffect(() => {
    if (session) {
      fetchJobs();
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/applications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (res.ok) {
        setJobs(jobs.filter((job) => job.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete job", error);
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center md:text-left animate-in slide-in-from-left duration-500">
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

          <div className="glass-panel w-full max-w-md mx-auto rounded-2xl p-8 shadow-2xl backdrop-blur-xl bg-background/50 border border-border">
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Applications
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track and manage your job search journey
            </p>
          </div>

          <div className="flex gap-4">
            <div className="w-40">
              <CustomSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { label: "All Status", value: "All" },
                  { label: "Applied", value: "Applied" },
                  { label: "Interview", value: "Interview" },
                  { label: "Offer", value: "Offer" },
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
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary/25"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Application
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {["Applied", "Interview", "Offer", "Rejected"].map((status) => (
            <div
              key={status}
              className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:scale-[1.02] transition-transform"
            >
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {status}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {jobs.filter((j) => j.status === status).length}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  status === "Offer"
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
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading your applications...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <h3 className="text-xl font-medium text-foreground mb-2">
              No applications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start tracking your job search by adding your first application.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary hover:text-primary/80 font-medium"
            >
              + Add New Application
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="glass-panel p-6 rounded-xl transition-all hover:border-primary/30 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {job.company}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          STATUS_COLORS[job.status]
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-lg text-gray-500 dark:text-gray-300 mb-2">
                      {job.role}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        Applied:{" "}
                        {job.applied_date
                          ? new Date(job.applied_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                      {job.job_link && (
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          View Job{" "}
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(job)}
                      className="p-2 text-gray-400 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
                {job.notes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {job.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 bg-background/95 dark:bg-background/80">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingJob ? "Edit Application" : "Add Application"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
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
                        setFormData({ ...formData, company: e.target.value })
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
                    onClick={() => setIsModalOpen(false)}
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
    </ProtectedRoute>
  );
}
