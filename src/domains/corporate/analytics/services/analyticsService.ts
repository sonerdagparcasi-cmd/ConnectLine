// src/domains/corporate/analytics/services/analyticsService.ts

import { JobAnalytics } from "../types/analytics.types";

class AnalyticsService {
  async getJobAnalytics(jobId: string): Promise<JobAnalytics> {
    return {
      totalApplications: 124,

      funnel: [
        { step: "applied", count: 124 },
        { step: "reviewing", count: 82 },
        { step: "shortlist", count: 28 },
        { step: "rejected", count: 68 },
        { step: "accepted", count: 6 },
      ],

      scoreDistribution: [
        { range: "0-49", count: 14 },
        { range: "50-69", count: 36 },
        { range: "70-84", count: 48 },
        { range: "85-100", count: 26 },
      ],

      timeMetrics: [
        { label: "İlk İnceleme", avgHours: 18 },
        { label: "Shortlist Süresi", avgHours: 36 },
        { label: "Karar Süresi", avgHours: 72 },
      ],

      avgScore: 74,
    };
  }
}

export const analyticsService = new AnalyticsService();