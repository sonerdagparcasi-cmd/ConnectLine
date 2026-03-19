// src/domains/corporate/recruitment/hooks/useRecruitment.ts

import { useEffect, useMemo, useState } from "react";

import { SortMode, type RankedItem, type RankingQuery } from "../../ai/ranking.types";
import { rankApplications } from "../../ai/rankingEngine";
import { recruitmentService } from "../services/recruitmentService";
import { ApplicationStatus, JobApplication } from "../types/application.types";

/* ------------------------------------------------------------------ */
/* CONSTANTS (🔒 SOURCE OF TRUTH)                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_QUERY: RankingQuery = {
  sortMode: SortMode.SMART,
  status: "all",
  minScore: 0,
  search: "",
};

/* ------------------------------------------------------------------ */
/* HOOK                                                               */
/* ------------------------------------------------------------------ */

export function useRecruitment(jobId?: string) {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [query, setQuery] = useState<RankingQuery>(DEFAULT_QUERY);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    recruitmentService.listApplications(jobId).then(setApps);
  }, [jobId]);

  /* ---------------- AI RANKING ---------------- */
  // 🔒 rankApplications → RankedItem[] döndürmek ZORUNDA
  const ranked: RankedItem[] = useMemo(() => {
    return rankApplications(apps, query);
  }, [apps, query]);

  /* ---------------- ACTIONS ---------------- */

  async function setStatus(appId: string, status: ApplicationStatus) {
    await recruitmentService.updateStatus(appId, status);
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  }

  function updateQuery(patch: Partial<RankingQuery>) {
    setQuery((prev) => ({ ...prev, ...patch }));
  }

  return {
    ranked,
    query,
    updateQuery,
    setStatus,
  };
}