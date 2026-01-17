export interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  applied_date: string | null;
  notes: string | null;
  job_link: string | null;
  created_at: string;
}

export type JobStatus = "All" | "Applied" | "Interview" | "Offer" | "Rejected";
