// src/domains/corporate/analytics/types/analytics.types.ts

export type FunnelStep =
  | "applied"
  | "reviewing"
  | "shortlist"
  | "rejected"
  | "accepted";

export type FunnelMetric = {
  step: FunnelStep;
  count: number;
};

export type ScoreBucket = {
  range: string; // "0-49"
  count: number;
};

export type TimeMetric = {
  label: string;
  avgHours: number;
};

export type JobAnalytics = {
  totalApplications: number;
  funnel: FunnelMetric[];
  scoreDistribution: ScoreBucket[];
  timeMetrics: TimeMetric[];
  avgScore: number;
};