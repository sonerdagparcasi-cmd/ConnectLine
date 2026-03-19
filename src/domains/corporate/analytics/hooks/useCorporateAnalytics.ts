// src/domains/corporate/analytics/hooks/useCorporateAnalytics.ts

import { useEffect, useState } from "react";
import { analyticsService } from "../services/analyticsService";
import { JobAnalytics } from "../types/analytics.types";

export function useCorporateAnalytics(jobId: string) {
  const [data, setData] = useState<JobAnalytics | null>(null);

  useEffect(() => {
    analyticsService.getJobAnalytics(jobId).then(setData);
  }, [jobId]);

  return { data };
}