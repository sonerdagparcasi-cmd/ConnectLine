// src/domains/store/services/storeCampaignFilters.ts
import type { StoreCampaign } from "../types/storeCampaign.types";

export type CampaignStatus = "upcoming" | "active" | "ended";

/**
 * UI tarafı (CampaignFilterBar) "all" dahil istiyor.
 */
export type CampaignStatusFilter = "all" | CampaignStatus;

/**
 * UI tarafı (CampaignFilterBar) için sıralama seçenekleri.
 */
export type CampaignSort =
  | "discount_desc"
  | "discount_asc"
  | "ending_soon"
  | "newest";

function toMs(iso: string) {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Status hesaplama:
 * - startsAt / endsAt (ISO)
 */
export function getCampaignStatus(c: StoreCampaign): CampaignStatus {
  const now = Date.now();
  const start = toMs(c.startsAt);
  const end = toMs(c.endsAt);

  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

/**
 * Kampanyanın global olup olmadığını hesaplar:
 * - target yoksa global
 * - target var ama hiçbir kural yoksa global
 */
export function isGlobalCampaign(c: StoreCampaign) {
  const t = c.target;
  if (!t) return true;

  const hasProductRule = !!t.productIds?.length;
  const hasCategoryRule = !!t.categoryIds?.length;

  return !hasProductRule && !hasCategoryRule;
}

/**
 * Kampanyanın indirim yüzdesi (yoksa 0)
 */
export function getDiscountPercent(c: StoreCampaign) {
  return c.discount?.percent ?? 0;
}

/**
 * Status filtreleme
 */
export function filterCampaigns(list: StoreCampaign[], status: CampaignStatusFilter) {
  if (status === "all") return [...list];
  return list.filter((c) => getCampaignStatus(c) === status);
}

/**
 * UI sort seçeneklerine göre sıralama:
 * - Not: status önceliği her zaman korunur (active > upcoming > ended)
 * - Sonra seçili sort uygulanır
 * - Son olarak deterministic tie-break
 */
export function sortCampaigns(list: StoreCampaign[], sort: CampaignSort = "discount_desc") {
  const statusPriority: Record<CampaignStatus, number> = {
    active: 0,
    upcoming: 1,
    ended: 2,
  };

  return [...list].sort((a, b) => {
    const sa = getCampaignStatus(a);
    const sb = getCampaignStatus(b);

    const byStatus = statusPriority[sa] - statusPriority[sb];
    if (byStatus !== 0) return byStatus;

    // Aynı status içindeyken: event her zaman bir tık önde dursun
    const ta = a.type === "event" ? 0 : 1;
    const tb = b.type === "event" ? 0 : 1;
    const byType = ta - tb;
    if (byType !== 0) return byType;

    // Seçili sort
    if (sort === "discount_desc") {
      const pa = getDiscountPercent(a);
      const pb = getDiscountPercent(b);
      if (pa !== pb) return pb - pa;
      return toMs(a.startsAt) - toMs(b.startsAt);
    }

    if (sort === "discount_asc") {
      const pa = getDiscountPercent(a);
      const pb = getDiscountPercent(b);
      if (pa !== pb) return pa - pb;
      return toMs(a.startsAt) - toMs(b.startsAt);
    }

    if (sort === "ending_soon") {
      const ea = toMs(a.endsAt);
      const eb = toMs(b.endsAt);
      if (ea !== eb) return ea - eb;
      return toMs(a.startsAt) - toMs(b.startsAt);
    }

    // newest
    const na = toMs(a.startsAt);
    const nb = toMs(b.startsAt);
    if (na !== nb) return nb - na;
    return String(a.id).localeCompare(String(b.id));
  });
}

/**
 * Tek noktadan: filtre + sort
 * (StoreCampaignsScreen bunu kullanır)
 */
export function filterAndSortCampaigns(
  list: StoreCampaign[],
  params: { status: CampaignStatusFilter; sort: CampaignSort }
) {
  const filtered = filterCampaigns(list, params.status);
  return sortCampaigns(filtered, params.sort);
}