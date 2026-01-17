import { api } from "./api.service";
import { JobApplication } from "@/types";

export const applicationsService = {
  getAll: (token: string) =>
    api.get<JobApplication[]>("/api/applications", token),

  create: (data: Partial<JobApplication>, token: string) =>
    api.post<JobApplication>("/api/applications", data, token),

  update: (id: number, data: Partial<JobApplication>, token: string) =>
    api.patch<JobApplication>(`/api/applications/${id}`, data, token),

  delete: (id: number, token: string) =>
    api.delete(`/api/applications/${id}`, token),
};
