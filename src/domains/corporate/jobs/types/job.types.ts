// src/domains/corporate/jobs/types/job.types.ts

export type JobType = "full_time" | "part_time" | "contract" | "internship";

export type CorporateJob = {
  id: string;
  companyId: string;
  companyName: string;

  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryRange?: string;

  skills: string[];

  createdAt: number;
};

export type JobApplication = {
  id: string;
  jobId: string;

  fullName: string;
  email: string;

  coverLetter?: string;
  portfolioLinks?: string[];

  cvPdfUri?: string;
  videoCvUri?: string;

  createdAt: number;
};