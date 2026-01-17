"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { applicationsService } from "@/services/applications.service";
import { JobApplication, JobFormData } from "@/types";

interface ApplicationsContextType {
  jobs: JobApplication[];
  loading: boolean;
  error: string | null;
  refreshJobs: () => Promise<void>;
  addJob: (data: JobFormData) => Promise<void>;
  updateJob: (id: number, data: JobFormData) => Promise<void>;
  deleteJob: (id: number) => Promise<void>;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(
  undefined
);

export function ApplicationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadedRef = useRef(false);
  const sessionTokenRef = useRef<string | null>(null);

  const fetchJobs = useCallback(
    async (
      token: string,
      options: { force?: boolean; silent?: boolean } = {}
    ) => {
      const { force = false, silent = false } = options;

      if (loadedRef.current && !force) return;

      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await applicationsService.getAll(token);
        setJobs(data || []);
        loadedRef.current = true;
      } catch (err: unknown) {
        console.error("Failed to fetch jobs", err);
        setError("Failed to load applications");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (session?.access_token) {
      if (sessionTokenRef.current !== session.access_token) {
        loadedRef.current = false;
        sessionTokenRef.current = session.access_token;
      }

      if (!loadedRef.current) {
        fetchJobs(session.access_token);
      }
    } else {
      setJobs([]);
      loadedRef.current = false;
      sessionTokenRef.current = null;
    }
  }, [session, fetchJobs]);

  const refreshJobs = async () => {
    if (!session?.access_token) return;
    await fetchJobs(session.access_token, { force: true, silent: true });
  };

  const addJob = async (data: JobFormData) => {
    if (!session?.access_token) return;
    try {
      await applicationsService.create(data, session.access_token);
      await refreshJobs();
    } catch (err) {
      console.error("Failed to add job", err);
      throw err;
    }
  };

  const updateJob = async (id: number, data: JobFormData) => {
    if (!session?.access_token) return;
    try {
      await applicationsService.update(id, data, session.access_token);
      await refreshJobs();
    } catch (err) {
      console.error("Failed to update job", err);
      throw err;
    }
  };

  const deleteJob = async (id: number) => {
    if (!session?.access_token) return;
    try {
      await applicationsService.delete(id, session.access_token);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error("Failed to delete job", err);
      throw err;
    }
  };

  return (
    <ApplicationsContext.Provider
      value={{
        jobs,
        loading,
        error,
        refreshJobs,
        addJob,
        updateJob,
        deleteJob,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (context === undefined) {
    throw new Error(
      "useApplications must be used within an ApplicationsProvider"
    );
  }
  return context;
};
