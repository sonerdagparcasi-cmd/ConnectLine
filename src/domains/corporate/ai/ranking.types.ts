// src/domains/corporate/ai/ranking.types.ts

import { ApplicationStatus, JobApplication } from "../recruitment/types/application.types";

/**
 * SortMode
 * - AI / ranking katmanına aittir
 * - UI'daki newest/oldest gibi değerler
 *   bu moda MAP edilmelidir
 */
export enum SortMode {
  SMART = "smart",
  DATE = "date",
  SCORE = "score",
}

export type StatusFilter = "all" | ApplicationStatus;

export type RankingQuery = {
  status: StatusFilter;
  minScore?: number;
  search?: string;
  sortMode: SortMode;
};

/**
 * RankedItem
 * - JobApplication tabanlıdır
 * - AI tarafından zenginleştirilmiş veri taşır
 * - Feed / recruitment listeleri bu tipe GÜVENİR
 */
export type RankedItem = JobApplication & {
  aiScore: number;
  rankReason: string[];
};