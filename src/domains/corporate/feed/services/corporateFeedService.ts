/**
 * @deprecated Hiçbir yerden import edilmiyor — AI/ranking ile ilişkili eski feed servisi.
 * Sonraki temizlikte kaldırılabilir veya yeni kurumsal işe alım akışına taşınabilir.
 */
import { RankedItem, RankingQuery, SortMode } from "../../ai/ranking.types";
import { rankApplications } from "../../ai/rankingEngine";
import { applicationService } from "../../recruitment/services/applicationService";
import { jobService } from "../../recruitment/services/jobService";
import type { JobApplication } from "../../recruitment/types/application.types";
import { CorporateFeedData } from "../types/feed.types";

/**
 * 🔒 DEFAULT QUERY
 * Feed tarafı AI ranking’i UI amaçlı kullanır
 */
const DEFAULT_QUERY: RankingQuery = {
  sortMode: SortMode.SMART,
  status: "all",
  minScore: 60,
  search: "",
};

class CorporateFeedService {
  async getFeed(companyId: string): Promise<CorporateFeedData> {
    /* ---------------- JOBS ---------------- */
    const jobs = await jobService.listByCompany(companyId);

    /* ---------------- APPLICATIONS ---------------- */
    const applications: JobApplication[] = (
      await Promise.all(jobs.map((j) => applicationService.list(j.id)))
    ).flat();

    /**
     * 🔒 FEED SADECE RankedItem ile çalışır
     * JobApplication → RankedItem dönüşümü
     * Backend varsayımı YOK (mock AI)
     */
    const rankedInput: RankedItem[] = applications.map((a) => ({
      ...a,
      aiScore: a.aiScore ?? Math.floor(50 + Math.random() * 50),
      rankReason: [],
    }));

    const ranked = rankApplications(rankedInput, DEFAULT_QUERY);

    return {
      /** 🔒 Feed post’ları bu adımda yok (UI-only boş) */
      posts: [],

      activeJobs: jobs.filter((j) => j.isActive),

      recommendedCandidates: ranked.slice(0, 5),
    };
  }
}

export const corporateFeedService = new CorporateFeedService();