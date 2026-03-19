// src/domains/corporate/ai/rankingEngine.ts

import type { JobApplication } from "../recruitment/types/application.types";
import { RankedItem, RankingQuery, SortMode } from "./ranking.types";

/**
 * Ranking Engine
 * ------------------------------------
 * - SADECE sıralama & filtreleme yapar
 * - Score üretmez (aiScoreEngine yapar) -> burada sadece fallback var
 * - Backend alan varsayımı yapmaz
 */
export function rankApplications(
  items: JobApplication[],
  query: RankingQuery
): RankedItem[] {
  // 1) normalize -> RankedItem
  let list: RankedItem[] = items.map((a) => ({
    ...a,
    aiScore: typeof a.aiScore === "number" ? a.aiScore : 0,
    rankReason: [],
  }));

  /* ---------------- FILTERS ---------------- */

  if (query.status !== "all") {
    list = list.filter((i) => i.status === query.status);
  }

  if (typeof query.minScore === "number") {
    const min = query.minScore;
    list = list.filter((i) => (i.aiScore ?? 0) >= min);
  }

  const search = (query.search ?? "").trim().toLowerCase();
  if (search) {
    list = list.filter((i) => {
      const name = (i.candidateName ?? "").toLowerCase();
      const cid = (i.candidateId ?? "").toLowerCase();
      const jt = (i.jobTitle ?? "").toLowerCase();
      return name.includes(search) || cid.includes(search) || jt.includes(search);
    });
  }

  /* ---------------- SORT ---------------- */

  switch (query.sortMode) {
    case SortMode.DATE: {
      // appliedAt var, yoksa 0
      return list.sort((a, b) => (b.appliedAt ?? 0) - (a.appliedAt ?? 0));
    }
    case SortMode.SCORE: {
      return list.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
    }
    case SortMode.SMART:
    default: {
      // smart = score ağırlıklı + tarih fallback
      return list.sort((a, b) => {
        const s = (b.aiScore ?? 0) - (a.aiScore ?? 0);
        if (s !== 0) return s;
        return (b.appliedAt ?? 0) - (a.appliedAt ?? 0);
      });
    }
  }
}