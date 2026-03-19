// src/domains/corporate/recruitment/ai/ankingEngine.ts

import type { ApplicationStatus } from "../types/application.types";
import type { RankedItem, RankingQuery } from "./ranking.types";
import { SortMode } from "./ranking.types";

/**
 * Recruitment Ranking Engine (UI MOCK)
 * ------------------------------------
 * - RankedItem[] üzerinde filtreleme + sıralama yapar
 * - Score üretmez (aiScoreEngine üretir)
 * - Backend alan varsayımı yapmaz
 */

/** ✅ ApplicationStatus union'ındaki HER durumu kapsar */
const STATUS_PRIORITY: Record<ApplicationStatus, number> = {
  new: 50,
  pending: 40,
  reviewing: 60,
  reviewed: 55,
  shortlist: 70,
  shortlisted: 75,
  rejected: 0,
};

function safeScore(item: Pick<RankedItem, "aiScore">): number {
  return typeof item.aiScore === "number" ? item.aiScore : 0;
}

function includesText(value: string, q: string): boolean {
  return value.toLowerCase().includes(q.toLowerCase());
}

/**
 * ✅ rankApplications
 * - Input: RankedItem[] (aiScore + rankReason zorunlu)
 * - Output: RankedItem[]
 */
export function rankApplications(
  items: RankedItem[],
  q: RankingQuery
): RankedItem[] {
  let list = [...items];

  /* ---------------- FILTERS ---------------- */

  if (q.status !== "all") {
    list = list.filter((a) => a.status === q.status);
  }

  if (typeof q.minScore === "number") {
    const min = q.minScore;
    list = list.filter((a) => safeScore(a) >= min);
  }

  if (q.search && q.search.trim().length > 0) {
    const search = q.search.trim();
    list = list.filter((a) => {
      // candidateName ve candidateId JobApplication üzerinde var
      const name = a.candidateName ?? "";
      const candidateId = a.candidateId ?? "";
      const jobTitle = a.jobTitle ?? "";

      return (
        includesText(name, search) ||
        includesText(candidateId, search) ||
        includesText(jobTitle, search)
      );
    });
  }

  /* ---------------- SORT ---------------- */

  switch (q.sortMode) {
    case SortMode.DATE:
      // appliedAt varsa onu baz al; yoksa stabil bırak
      return list.sort((a, b) => (b.appliedAt ?? 0) - (a.appliedAt ?? 0));

    case SortMode.SCORE:
      return list.sort((a, b) => safeScore(b) - safeScore(a));

    case SortMode.SMART:
    default:
      // SMART = önce score, sonra status önceliği, sonra tarih
      return list.sort((a, b) => {
        const sc = safeScore(b) - safeScore(a);
        if (sc !== 0) return sc;

        const st =
          (STATUS_PRIORITY[b.status] ?? 0) - (STATUS_PRIORITY[a.status] ?? 0);
        if (st !== 0) return st;

        return (b.appliedAt ?? 0) - (a.appliedAt ?? 0);
      });
  }
}