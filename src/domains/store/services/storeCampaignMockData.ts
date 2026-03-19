// src/domains/store/services/storeCampaignMockData.ts
import type { StoreCampaign } from "../types/storeCampaign.types";

// ISO string üretmek için basit helper (mock)
function isoPlusDays(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

export const storeMockCampaigns: StoreCampaign[] = [
  {
    id: "cmp_discount_01",
    type: "discount",
    title: "Sezon Fırsatları",
    subtitle: "Seçili ürünlerde indirim",
    description:
      "Seçili ürünlerde sınırlı süreli indirim. Stoklar sınırlı olabilir.",
    badgeText: "Fırsat",
    bannerEmoji: "✨",
    startsAt: isoPlusDays(-2),
    endsAt: isoPlusDays(5),
    target: {
      categoryIds: ["cat_1"],
    },
    discount: {
      percent: 20,
    },
  },
  {
    id: "cmp_discount_02",
    type: "discount",
    title: "Yeni Gelenler İndirimi",
    subtitle: "Yeni ürünlerde özel fiyat",
    description:
      "Yeni eklenen ürünlerde geçici indirim uygulanır. Detaylar kampanya sayfasında.",
    badgeText: "Yeni",
    bannerEmoji: "🆕",
    startsAt: isoPlusDays(-1),
    endsAt: isoPlusDays(3),
    target: {
      productIds: ["prd_1", "prd_2"],
    },
    discount: {
      percent: 15,
    },
  },

  // “%50 indirim günü” etkinliği (GENEL ifade, telif riski yok)
  {
    id: "cmp_event_halfday",
    type: "event",
    title: "%50 indirim günü",
    subtitle: "24 saatlik özel etkinlik",
    description:
      "Etkinlik süresince seçili ürünlerde %50 indirim uygulanır. Katılım ve davetler mock’tur.",
    badgeText: "%50",
    bannerEmoji: "🔥",
    startsAt: isoPlusDays(2),
    endsAt: isoPlusDays(3),
    target: {
      categoryIds: ["cat_2"],
    },
    discount: {
      percent: 50,
    },
    event: {
      code: "HALF_DAY",
      inviteOnly: false,
      maxParticipants: 100000,
    },
  },
];

export type StoreCampaignNotification = {
  id: string;
  createdAt: string; // ISO
  title: string;
  body: string;
  campaignId?: string;
};

export const storeMockCampaignNotifications: StoreCampaignNotification[] = [
  {
    id: "ntf_1",
    createdAt: isoPlusDays(-1),
    title: "Kampanya Güncellemesi",
    body: "Sezon Fırsatları kampanyasında yeni ürünler eklendi.",
    campaignId: "cmp_discount_01",
  },
  {
    id: "ntf_2",
    createdAt: isoPlusDays(0),
    title: "Etkinlik Yaklaşıyor",
    body: "%50 indirim günü etkinliği 2 gün sonra başlıyor.",
    campaignId: "cmp_event_halfday",
  },
];