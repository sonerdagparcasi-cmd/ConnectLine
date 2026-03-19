// src/domains/corporate/recruitment/types/job.types.ts

export type JobType = "full-time" | "part-time" | "remote" | "contract";

export type JobPost = {
  id: string;
  companyId: string;

  title: string;
  description: string;
  location?: string;

  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;

  skills: string[];

  createdAt: number;
  isActive: boolean;
};