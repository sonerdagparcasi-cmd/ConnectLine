import { JobApplication } from "../recruitment/types/application.types";
import { RankedItem } from "./ranking.types";

/**
 * AI Score Engine (UI MOCK)
 * --------------------------------------------------
 * - JobApplication[] → RankedItem[]
 * - SADECE skor & açıklama üretir
 * - SIRALAMA YAPMAZ
 * - Backend varsayımı YOK
 */
export function scoreApplications(
  applications: JobApplication[]
): RankedItem[] {
  return applications.map((app) => {
    const aiScore = generateScore(app);

    return {
      ...app,
      aiScore,
      rankReason: generateReasons(app, aiScore),
    };
  });
}

/* ------------------------------------------------------------------ */
/* MOCK AI LOGIC                                                       */
/* ------------------------------------------------------------------ */

function generateScore(app: JobApplication): number {
  let score = 50;

  if (app.status === "shortlisted") score += 20;
  if (app.status === "rejected") score -= 15;

  if (app.videoCvUri) score += 10;

  return Math.max(0, Math.min(100, score));
}

function generateReasons(
  app: JobApplication,
  score: number
): string[] {
  const reasons: string[] = [];

  if (score >= 80) reasons.push("AI: Güçlü eşleşme");
  else if (score >= 60) reasons.push("AI: Uygun aday");
  else reasons.push("AI: Düşük eşleşme");

  if (app.videoCvUri) {
    reasons.push("Video CV mevcut");
  }

  return reasons;
}