import type { StoreCampaign } from "../types/storeCampaign.types";
import {
  storeMockCampaignNotifications,
  storeMockCampaigns,
  type StoreCampaignNotification,
} from "./storeCampaignMockData";

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function simulateDelay(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

function toMs(iso: string) {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/* ------------------------------------------------------------------ */
/* status                                                             */
/* ------------------------------------------------------------------ */

export function getCampaignStatus(
  c: StoreCampaign
): "upcoming" | "active" | "ended" {
  const now = Date.now();
  const start = toMs(c.startsAt);
  const end = toMs(c.endsAt);

  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

/* ------------------------------------------------------------------ */
/* in-memory mock store (🔒 KİLİTLİ)                                  */
/* ------------------------------------------------------------------ */

let campaignStore: StoreCampaign[] = [...storeMockCampaigns];

/* ----------------------- */
/* invite tracking (UI)    */
/* ----------------------- */

type InviteChannel = "copy" | "share";

type StoreCampaignInviteLocal = {
  id: string;
  campaignId: string;
  channel: InviteChannel;
  createdAt: string;
};

let inviteStore: StoreCampaignInviteLocal[] = [];

/* ----------------------- */
/* event participation     */
/* ----------------------- */

type StoreCampaignParticipationLocal = {
  id: string;
  campaignId: string;
  joinedAt: string;
};

let participationStore: StoreCampaignParticipationLocal[] = [];

/* ------------------------------------------------------------------ */
/* utils                                                              */
/* ------------------------------------------------------------------ */

function sortCampaigns(list: StoreCampaign[]) {
  const priority: Record<"active" | "upcoming" | "ended", number> = {
    active: 0,
    upcoming: 1,
    ended: 2,
  };

  return [...list].sort((a, b) => {
    const sa = getCampaignStatus(a);
    const sb = getCampaignStatus(b);
    const byStatus = priority[sa] - priority[sb];
    if (byStatus !== 0) return byStatus;
    return toMs(a.startsAt) - toMs(b.startsAt);
  });
}

/* ------------------------------------------------------------------ */
/* service                                                            */
/* ------------------------------------------------------------------ */

export const storeCampaignService = {
  /* ----------------------- */
  /* campaigns               */
  /* ----------------------- */

  async getCampaigns(): Promise<StoreCampaign[]> {
    await simulateDelay(200);
    return sortCampaigns(campaignStore);
  },

  async getCampaignById(id: string): Promise<StoreCampaign | null> {
    await simulateDelay(120);
    return campaignStore.find((c) => c.id === id) ?? null;
  },

  /* ----------------------- */
  /* 🔥 EVENT CREATE (UI)    */
  /* ----------------------- */

  async createEventCampaign(params: {
    title: string;
    description: string;
    percent: number;
    startsInDays: number;
    durationDays: number;
    inviteOnly: boolean; // 🔒 UI-only, modelde tutulmaz
  }): Promise<StoreCampaign> {
    await simulateDelay(180);

    const now = new Date();
    const startsAt = addDays(now, params.startsInDays);
    const endsAt = addDays(startsAt, params.durationDays);

    const campaign: StoreCampaign = {
      id: uid("event"),
      type: "event",
      title: params.title,
      description: params.description,

      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),

      discount: {
        percent: params.percent,
      },

      target: undefined,
    };

    campaignStore = [campaign, ...campaignStore];
    return campaign;
  },

  /* ----------------------- */
  /* notifications           */
  /* ----------------------- */

  async getNotifications(): Promise<StoreCampaignNotification[]> {
    await simulateDelay(160);
    return [...storeMockCampaignNotifications].sort(
      (a, b) => toMs(b.createdAt) - toMs(a.createdAt)
    );
  },

  /* ----------------------- */
  /* invites (UI mock)       */
  /* ----------------------- */

  async getInviteCount(campaignId: string): Promise<number> {
    await simulateDelay(80);
    const base = 24;
    const tracked = inviteStore.filter((i) => i.campaignId === campaignId).length;
    return base + tracked;
  },

  async createInvite(params: {
    campaignId: string;
    channel: InviteChannel;
  }): Promise<void> {
    await simulateDelay(80);

    const exists = campaignStore.some((c) => c.id === params.campaignId);
    if (!exists) return;

    inviteStore.unshift({
      id: uid("inv"),
      campaignId: params.campaignId,
      channel: params.channel,
      createdAt: new Date().toISOString(),
    });
  },

  /* ----------------------- */
  /* event participation     */
  /* ----------------------- */

  async getParticipantCount(campaignId: string): Promise<number> {
    await simulateDelay(80);
    const base = 128;
    const joined = participationStore.filter(
      (p) => p.campaignId === campaignId
    ).length;
    return base + joined;
  },

  async joinEvent(campaignId: string): Promise<void> {
    await simulateDelay(100);

    const exists = campaignStore.some((c) => c.id === campaignId);
    if (!exists) return;

    participationStore.unshift({
      id: uid("join"),
      campaignId,
      joinedAt: new Date().toISOString(),
    });
  },

  /* ----------------------- */
  /* product matching        */
  /* ----------------------- */

  async getActiveCampaignsForProduct(params: {
    productId: string;
    categoryId: string;
  }): Promise<StoreCampaign[]> {
    await simulateDelay(80);

    const active = campaignStore.filter(
      (c) => getCampaignStatus(c) === "active"
    );

    const matched = active.filter((c) => {
      const target = c.target;
      if (!target) return true;

      const hasProductRule = !!target.productIds?.length;
      const hasCategoryRule = !!target.categoryIds?.length;

      if (!hasProductRule && !hasCategoryRule) return true;
      if (hasProductRule && target.productIds!.includes(params.productId)) return true;
      if (hasCategoryRule && target.categoryIds!.includes(params.categoryId)) return true;

      return false;
    });

    return [...matched].sort((a, b) => {
      const ta = a.type === "event" ? 0 : 1;
      const tb = b.type === "event" ? 0 : 1;
      if (ta !== tb) return ta - tb;

      const pa = a.discount?.percent ?? 0;
      const pb = b.discount?.percent ?? 0;
      return pb - pa;
    });
  },

  async getPrimaryActiveCampaignForProduct(params: {
    productId: string;
    categoryId: string;
  }): Promise<StoreCampaign | null> {
    const list = await this.getActiveCampaignsForProduct(params);
    return list[0] ?? null;
  },
};