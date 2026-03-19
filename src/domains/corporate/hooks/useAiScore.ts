import { useMemo } from "react";

import { scoreApplications } from "../ai/aiScoreEngine";
import { RankedItem } from "../ai/ranking.types";
import { JobApplication } from "../recruitment/types/application.types";

/**
 * useAiScore
 * --------------------------------------------------
 * - UI-only hook
 * - JobApplication[] → RankedItem[]
 * - State TUTMAZ
 * - Side effect YOK
 * - Her zaman deterministik
 */
export function useAiScore(
  applications: JobApplication[]
): RankedItem[] {
  return useMemo(() => {
    if (!applications || applications.length === 0) return [];
    return scoreApplications(applications);
  }, [applications]);
}