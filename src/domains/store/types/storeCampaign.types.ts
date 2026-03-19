/* ------------------------------------------------------------------ */
/* STORE CAMPAIGN TYPES (KİLİTLİ)                                      */
/* ------------------------------------------------------------------ */

/**
 * Kampanya türleri
 */
export type StoreCampaignType =
  | "discount"
  | "event";

/**
 * Kampanya hedefleme kuralları
 * - Ürün bazlı
 * - Kategori bazlı
 * - Yoksa global kabul edilir
 */
export type StoreCampaignTarget = {
  productIds?: string[];
  categoryIds?: string[];
};

/**
 * İndirim bilgisi
 */
export type StoreCampaignDiscount = {
  percent: number;
};

/**
 * Etkinlik (event) bilgisi
 */
export type StoreCampaignEvent = {
  code: string;
  inviteOnly: boolean;
  maxParticipants?: number;
};

/**
 * ANA KAMPANYA MODELİ
 * ⚠️ Başka dosyadan import YOK
 * ⚠️ Circular reference YOK
 */
export type StoreCampaign = {
  id: string;
  type: StoreCampaignType;

  title: string;
  subtitle?: string;
  description?: string;

  /**
   * C-31: ProductCard badge text
   * Sadece active kampanyalarda gösterilir
   */
  badgeText?: string | null;

  bannerEmoji?: string;

  startsAt: string; // ISO
  endsAt: string;   // ISO

  target?: StoreCampaignTarget;

  discount?: StoreCampaignDiscount;
  event?: StoreCampaignEvent;
};

/**
 * Kampanya durumları
 */
export type StoreCampaignStatus =
  | "active"
  | "upcoming"
  | "ended";

/**
 * Kampanya + runtime status birleşimi
 * (servis katmanında kullanılır)
 */
export type StoreCampaignWithStatus = StoreCampaign & {
  status: StoreCampaignStatus;
};