// src/domains/social/services/socialReportService.ts
// FAZ 5 / ADIM 5 — gönderi raporları (hafif yerel store)

import type { SocialReportReason } from "../types/social.types";

export type SocialPostReport = {
  id: string;
  postId: string;
  reporterUserId: string;
  reason: SocialReportReason;
  createdAt: string;
};

type UserReportEntry = {
  id: string;
  targetUserId: string;
  reason: SocialReportReason;
  reporterUserId: string;
  createdAt: string;
};

const POST_REPORTS: SocialPostReport[] = [];
const USER_REPORTS: UserReportEntry[] = [];

export function reportPost(
  postId: string,
  reason: SocialReportReason = "diger",
  reporterUserId: string = "me"
): void {
  POST_REPORTS.unshift({
    id: `r_${Date.now()}`,
    postId,
    reporterUserId,
    reason,
    createdAt: new Date().toISOString(),
  });
}

export function getReportsByPost(postId: string): SocialPostReport[] {
  return POST_REPORTS.filter((r) => r.postId === postId);
}

export function reportUser(
  userId: string,
  reason: SocialReportReason = "diger",
  reporterUserId: string = "me"
): void {
  USER_REPORTS.unshift({
    id: `ru_${Date.now()}`,
    targetUserId: userId,
    reason,
    reporterUserId,
    createdAt: new Date().toISOString(),
  });
}

/** Gönderi bildirimi — hızlı seçenekler (UI) */
export const REPORT_REASONS: {
  value: SocialReportReason;
  labelKey: string;
  labelTr: string;
}[] = [
  { value: "spam", labelKey: "social.report.reason.spam", labelTr: "Spam" },
  {
    value: "rahatsiz_edici",
    labelKey: "social.report.reason.disturbing",
    labelTr: "Rahatsız Edici",
  },
  {
    value: "uygunsuz",
    labelKey: "social.report.reason.inappropriate",
    labelTr: "Uygunsuz",
  },
  {
    value: "sahte_hesap",
    labelKey: "social.report.reason.fakeAccount",
    labelTr: "Sahte Hesap",
  },
  { value: "diger", labelKey: "social.report.reason.other", labelTr: "Diğer" },
];
