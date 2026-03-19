// src/domains/corporate/jobs/hooks/useCorporateJobs.ts

import { useEffect, useState } from "react";
import { corporateJobService } from "../services/corporateJobService";
import { CorporateJob } from "../types/job.types";

export function useCorporateJobs() {
  const [jobs, setJobs] = useState<CorporateJob[]>([]);

  async function refresh() {
    const list = await corporateJobService.listJobs();
    setJobs(list);
  }

  async function createJob(
    payload: Omit<CorporateJob, "id" | "createdAt">
  ) {
    await corporateJobService.createJob(payload);
    await refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  return { jobs, refresh, createJob };
}