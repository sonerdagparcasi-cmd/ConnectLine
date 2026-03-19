// src/domains/corporate/recruitment/services/jobService.ts

import { JobPost } from "../types/job.types";

class JobService {
  private jobs: JobPost[] = [];

  async create(job: JobPost) {
    this.jobs.unshift(job);
    return job;
  }

  async listByCompany(companyId: string) {
    return this.jobs.filter((j) => j.companyId === companyId);
  }
}

export const jobService = new JobService();