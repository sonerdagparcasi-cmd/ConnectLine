// src/domains/corporate/public/services/companyPublicService.ts

import { jobService } from "../../recruitment/services/jobService";
import { CompanyPublicProfile } from "../types/public.types";

class CompanyPublicService {
  async getProfile(companyId: string): Promise<CompanyPublicProfile> {
    const jobs = await jobService.listByCompany(companyId);

    return {
      id: companyId,
      name: "Acme Teknoloji",
      title: "Yazılım & Dijital Çözümler",
      about:
        "Ölçeklenebilir yazılım çözümleri geliştiren teknoloji şirketi.",
      followerCount: 1240,
      isFollowing: false,

      activeJobs: jobs.filter((j) => j.isActive),

      announcements: [
        {
          id: "a1",
          text: "Yeni mobil ekibimizi büyütüyoruz 🚀",
          createdAt: Date.now(),
        },
      ],
    };
  }

  async follow(companyId: string) {
    // mock
    return true;
  }

  async unfollow(companyId: string) {
    // mock
    return true;
  }
}

export const companyPublicService = new CompanyPublicService();