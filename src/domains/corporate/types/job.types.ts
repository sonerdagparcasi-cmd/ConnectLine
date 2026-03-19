// src/domains/corporate/types/job.types.ts

export type JobType = "full_time" | "part_time" | "contract" | "intern";

export type Job = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryRange?: string;
  skills: string[];
  isActive: boolean;
  applicationsCount: number;
  createdAt: number;
};