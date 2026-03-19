// src/domains/social/services/socialReportService.ts
// 🔒 REPORT – MOCK STORE (FAZ 2)

import type { SocialReportReason } from "../types/social.types";

type ReportEntry = {
  id: string;
  target: "user" | "post";
  targetId: string;
  reason: SocialReportReason;
  reporterUserId: string;
  createdAt: string;
};

const REPORTS: ReportEntry[] = [];

export function reportUser(
  userId: string,
  reason: SocialReportReason,
  reporterUserId: string = "me"
): void {
  REPORTS.push({
    id: `r_${Date.now()}`,
    target: "user",
    targetId: userId,
    reason,
    reporterUserId,
    createdAt: new Date().toISOString(),
  });
}

export function reportPost(
  postId: string,
  reason: SocialReportReason,
  reporterUserId: string = "me"
): void {
  REPORTS.push({
    id: `r_${Date.now()}`,
    target: "post",
    targetId: postId,
    reason,
    reporterUserId,
    createdAt: new Date().toISOString(),
  });
}

export const REPORT_REASONS: { value: SocialReportReason; labelKey: string }[] = [
  { value: "spam", labelKey: "social.report.reason.spam" },
  { value: "fake_account", labelKey: "social.report.reason.fakeAccount" },
  { value: "abuse", labelKey: "social.report.reason.abuse" },
  { value: "violence", labelKey: "social.report.reason.violence" },
  { value: "other", labelKey: "social.report.reason.other" },
];
