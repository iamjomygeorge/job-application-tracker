export type ApplicationStatus = "Applied" | "Interview" | "Offer" | "Rejected";
export type JobStatus = ApplicationStatus;

export type FilterStatus = "All" | ApplicationStatus;

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_date: string | null;
  notes: string | null;
  job_link: string | null;
  created_at: string;
}

export interface JobFormData {
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_date: string;
  notes: string;
  job_link: string;
}
