// src/domains/corporate/hooks/useJobs.ts

import { useEffect, useState } from "react";
import { jobService } from "../services/jobService";
import { Job } from "../types/job.types";

export function useJobs(companyId: string) {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    jobService.getJobsByCompany(companyId).then(setJobs);
  }, [companyId]);

  async function closeJob(jobId: string) {
    await jobService.closeJob(jobId);
    setJobs((p) =>
      p.map((j) =>
        j.id === jobId ? { ...j, isActive: false } : j
      )
    );
  }

  return { jobs, closeJob };
}