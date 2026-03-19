// src/domains/corporate/types/application.types.ts

export type ApplicationStatus =
  | "sent"
  | "reviewing"
  | "rejected"
  | "accepted";

export type JobApplication = {
  id: string;
  jobId: string;
  companyId: string;

  cvUrl?: string;          // pdf
  portfolioLinks?: string[];
  videoCvUrl?: string;

  coverLetter?: string;

  status: ApplicationStatus;
  createdAt: number;
};