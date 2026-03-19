// src/domains/corporate/services/recommendationService.ts
// 🔒 RECOMMENDATION SERVICE (UI-ONLY)

import type { Company } from "../types/company.types";
import { companyService } from "./companyService";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type RecommendedPerson = {
  id: string;
  fullName: string;
  headline: string;
  location?: string;
  mutualConnections: number;
};

export type RecommendedJob = {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  level?: string;
  isEasyApply?: boolean;
};

export type RecommendationsBundle = {
  companies: Company[];
  people: RecommendedPerson[];
  jobs: RecommendedJob[];
};

/* -------------------------------------------------------------------------- */
/* MOCK                                                                       */
/* -------------------------------------------------------------------------- */

const MOCK_PEOPLE: RecommendedPerson[] = [
  {
    id: "p1",
    fullName: "Ece Yılmaz",
    headline: "Ürün Yöneticisi • Büyüme & Deneyim",
    location: "İstanbul",
    mutualConnections: 3,
  },
  {
    id: "p2",
    fullName: "Mert Kaya",
    headline: "Frontend Geliştirici • Mobil & Web",
    location: "Ankara",
    mutualConnections: 2,
  },
  {
    id: "p3",
    fullName: "Selin Demir",
    headline: "İK Uzmanı • İşe Alım & Kültür",
    location: "İzmir",
    mutualConnections: 4,
  },
  {
    id: "p4",
    fullName: "Arda Şen",
    headline: "Veri Analisti • Raporlama & İçgörü",
    location: "Bursa",
    mutualConnections: 1,
  },
];

const MOCK_JOBS: RecommendedJob[] = [
  {
    id: "j1",
    title: "React Native Geliştirici",
    companyName: "Nova Tech",
    location: "İstanbul / Remote",
    level: "Mid",
    isEasyApply: true,
  },
  {
    id: "j2",
    title: "Ürün Tasarımcısı",
    companyName: "Mira Studio",
    location: "İstanbul",
    level: "Senior",
    isEasyApply: false,
  },
  {
    id: "j3",
    title: "Veri Analisti",
    companyName: "Kora Labs",
    location: "İzmir",
    level: "Junior",
    isEasyApply: true,
  },
  {
    id: "j4",
    title: "Satış Operasyon Uzmanı",
    companyName: "Pulse Commerce",
    location: "Bursa",
    level: "Mid",
    isEasyApply: false,
  },
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function pickTopDeterministic<T>(items: T[], max: number): T[] {
  return items.slice(0, Math.max(0, max));
}

function stablePeople(max: number): RecommendedPerson[] {
  const sorted = [...MOCK_PEOPLE].sort(
    (a, b) => b.mutualConnections - a.mutualConnections
  );

  return pickTopDeterministic(sorted, max);
}

function stableJobs(max: number): RecommendedJob[] {
  const sorted = [...MOCK_JOBS].sort((a, b) => {
    const ea = (b.isEasyApply ? 1 : 0) - (a.isEasyApply ? 1 : 0);

    if (ea !== 0) return ea;

    return a.title.localeCompare(b.title);
  });

  return pickTopDeterministic(sorted, max);
}

/* -------------------------------------------------------------------------- */
/* SERVICE                                                                    */
/* -------------------------------------------------------------------------- */

class RecommendationService {
  /**
   * 🔒 PROFILE RECOMMENDATIONS
   */
  async getForProfile(
    companyId: string,
    opts?: {
      maxCompanies?: number;
      maxPeople?: number;
      maxJobs?: number;
    }
  ): Promise<RecommendationsBundle> {
    const maxCompanies = opts?.maxCompanies ?? 6;
    const maxPeople = opts?.maxPeople ?? 4;
    const maxJobs = opts?.maxJobs ?? 4;

    const companiesAll =
      await companyService.getSuggestedCompanies(companyId);

    const companies = pickTopDeterministic(
      companiesAll,
      maxCompanies
    );

    const people = stablePeople(maxPeople);
    const jobs = stableJobs(maxJobs);

    return { companies, people, jobs };
  }

  /**
   * 🔒 COMPANY RECOMMENDATIONS
   */
  async getCompanyRecommendations(
    companyId: string,
    max = 6
  ): Promise<Company[]> {
    const companies =
      await companyService.getSuggestedCompanies(companyId);

    return pickTopDeterministic(companies, max);
  }

  /**
   * 🔒 JOB RECOMMENDATIONS
   */
  async getJobRecommendations(max = 4): Promise<RecommendedJob[]> {
    return stableJobs(max);
  }

  /**
   * 🔒 PEOPLE RECOMMENDATIONS
   */
  async getPeopleRecommendations(
    max = 4
  ): Promise<RecommendedPerson[]> {
    return stablePeople(max);
  }
}

export const recommendationService = new RecommendationService();