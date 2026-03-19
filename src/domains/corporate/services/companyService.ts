// src/domains/corporate/services/companyService.ts

import type { Company } from "../types/company.types";

/**
 * 🔒 UI-ONLY MOCK SERVICE
 *
 * Kurallar:
 * - Backend yok
 * - Algoritma yok
 * - Deterministik
 * - Telif riski yaratacak isim / yapı / davranış yok
 *
 * Kullanım:
 * - useCompany tek tüketici
 * - Screen'ler bu servisi doğrudan çağırmaz
 */

/* -------------------------------------------------------------------------- */
/* MOCK DATA                                                                  */
/* -------------------------------------------------------------------------- */

const MOCK_COMPANIES: Company[] = [
  {
    id: "c1",
    name: "Nova Tech",
    sector: "Yazılım & Teknoloji",
    description:
      "Geleceğin dijital ürünlerini geliştiren yenilikçi teknoloji şirketi.",
    location: "İstanbul / Remote",
    website: "novatech.com",
    followers: 1240,
    isFollowing: false,
    ownerUserId: "u1",
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_SUGGESTED_COMPANIES: Company[] = [
  {
    id: "c2",
    name: "BrightWorks",
    sector: "Yazılım & Teknoloji",
    description: "Ürün ekiplerine hız kazandıran modern iş çözümleri.",
    location: "Ankara",
    website: "brightworks.example",
    followers: 860,
    isFollowing: false,
    ownerUserId: "u2",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "c3",
    name: "Kora Labs",
    sector: "Yazılım & Teknoloji",
    description: "Veri odaklı ürünler ve ölçeklenebilir altyapılar.",
    location: "İzmir",
    website: "koralabs.example",
    followers: 1570,
    isFollowing: false,
    ownerUserId: "u3",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "c4",
    name: "Mira Studio",
    sector: "Tasarım & Ürün",
    description: "Dijital ürün tasarımı ve marka deneyimi stüdyosu.",
    location: "İstanbul",
    website: "mirastudio.example",
    followers: 620,
    isFollowing: false,
    ownerUserId: "u4",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "c5",
    name: "Pulse Commerce",
    sector: "E-ticaret",
    description: "Satış ekipleri için pratik e-ticaret altyapıları.",
    location: "Bursa",
    website: "pulsecommerce.example",
    followers: 980,
    isFollowing: false,
    ownerUserId: "u5",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "c6",
    name: "Harmoni Finans",
    sector: "Finans & Teknoloji",
    description: "KOBİ’ler için sade finans araçları ve otomasyon.",
    location: "İstanbul",
    website: "harmonifinans.example",
    followers: 1310,
    isFollowing: false,
    ownerUserId: "u6",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
];

/* -------------------------------------------------------------------------- */
/* FOLLOW STATE (UI-ONLY)                                                     */
/* -------------------------------------------------------------------------- */

const FOLLOW_STATE = new Map<string, boolean>();

/* -------------------------------------------------------------------------- */
/* MOCK USER CONNECTION GRAPH (UI-ONLY)                                       */
/* -------------------------------------------------------------------------- */

const USER_CONNECTIONS: Record<string, string[]> = {
  u1: ["u2", "u3", "u4"],
  u2: ["u1", "u3"],
  u3: ["u1"],
};

/* -------------------------------------------------------------------------- */
/* UTILS                                                                      */
/* -------------------------------------------------------------------------- */

function uniqById(list: Company[]): Company[] {
  const map = new Map<string, Company>();

  for (const item of list) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

/* -------------------------------------------------------------------------- */
/* SERVICE                                                                    */
/* -------------------------------------------------------------------------- */

class CompanyService {
  async getCompany(companyId: string): Promise<Company> {
    const found = MOCK_COMPANIES.find((c) => c.id === companyId);

    const company = found ?? MOCK_COMPANIES[0];

    const isFollowing = FOLLOW_STATE.get(companyId) ?? company.isFollowing;

    return {
      ...company,
      isFollowing,
    };
  }

  async getCurrentUserId(): Promise<string> {
    return "u1";
  }

  /* ------------------------------------------------------------------ */
  /* FOLLOW                                                             */
  /* ------------------------------------------------------------------ */

  async follow(companyId: string): Promise<void> {
    FOLLOW_STATE.set(companyId, true);

    const company = MOCK_COMPANIES.find((c) => c.id === companyId);
    if (company) {
      company.followers += 1;
      company.isFollowing = true;
    }
  }

  async unfollow(companyId: string): Promise<void> {
    FOLLOW_STATE.set(companyId, false);

    const company = MOCK_COMPANIES.find((c) => c.id === companyId);
    if (company && company.followers > 0) {
      company.followers -= 1;
      company.isFollowing = false;
    }
  }

  async followCompany(companyId: string): Promise<void> {
    return this.follow(companyId);
  }

  async unfollowCompany(companyId: string): Promise<void> {
    return this.unfollow(companyId);
  }

  /* ------------------------------------------------------------------ */
  /* SUGGESTED COMPANIES                                                */
  /* ------------------------------------------------------------------ */

  async getSuggestedCompanies(companyId: string): Promise<Company[]> {
    const current = await this.getCompany(companyId);

    const sameSector = MOCK_SUGGESTED_COMPANIES.filter(
      (c) => c.sector === current.sector && c.id !== current.id
    );

    const otherSector = MOCK_SUGGESTED_COMPANIES.filter(
      (c) => c.sector !== current.sector && c.id !== current.id
    );

    return uniqById([...sameSector, ...otherSector]).slice(0, 6);
  }

  /* ------------------------------------------------------------------ */
  /* MUTUAL CONNECTIONS (NEW)                                           */
  /* ------------------------------------------------------------------ */

  async getMutualConnections(companyId: string): Promise<{
    count: number;
    users: string[];
  }> {
    const company = await this.getCompany(companyId);

    const currentUser = await this.getCurrentUserId();

    const connections = USER_CONNECTIONS[currentUser] ?? [];

    const mutual = connections.filter(
      (userId) => userId !== company.ownerUserId
    );

    return {
      count: mutual.length,
      users: mutual,
    };
  }
}

export const companyService = new CompanyService();