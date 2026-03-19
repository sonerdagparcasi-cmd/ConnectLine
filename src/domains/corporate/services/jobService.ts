// src/domains/corporate/services/jobService.ts

import { Job } from "../types/job.types";

const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    companyId: "c1",
    title: "Senior Frontend Developer",
    description:
      "Modern web ve mobil arayüzler geliştirecek deneyimli frontend geliştirici.",
    location: "İstanbul / Remote",
    jobType: "full_time",
    salaryRange: "60.000 – 90.000 ₺",
    skills: ["React", "TypeScript", "UI/UX"],
    isActive: true,
    applicationsCount: 18,
    createdAt: Date.now() - 86400000,
  },
];

class JobService {
  async getJobsByCompany(companyId: string): Promise<Job[]> {
    return MOCK_JOBS.filter((j) => j.companyId === companyId);
  }

  async getJob(jobId: string): Promise<Job | null> {
    return MOCK_JOBS.find((j) => j.id === jobId) ?? null;
  }

  async createJob(job: Job): Promise<void> {
    MOCK_JOBS.unshift(job);
  }

  async closeJob(jobId: string): Promise<void> {
    const j = MOCK_JOBS.find((x) => x.id === jobId);
    if (j) j.isActive = false;
  }
}

export const jobService = new JobService();