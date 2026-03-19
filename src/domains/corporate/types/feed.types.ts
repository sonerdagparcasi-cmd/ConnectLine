/* ------------------------------------------------------------------ */
/* MEDIA                                                              */
/* ------------------------------------------------------------------ */

/**
 * Kurumsal feed medya türleri
 */
export type CorporateMediaType = "image" | "video";

/**
 * 🔒 ADIM 6 – TEK VE GERÇEK MEDYA TİPİ
 *
 * Kurallar:
 * - Feed, PostDetail ve MediaPreview aynı tipi kullanır
 * - Media her zaman ARRAY içinde taşınır
 * - order sıralama içindir (carousel)
 */
export type CorporateMediaItem = {
  id: string;
  type: CorporateMediaType;
  uri: string;
  order: number;
};

/* ------------------------------------------------------------------ */
/* FEED POST                                                          */
/* ------------------------------------------------------------------ */

/**
 * 🔒 CorporateFeedPost (KİLİTLİ)
 *
 * Kurallar:
 * - Feed state'in tek kaynağı
 * - Route’a DIRECT taşınabilir
 * - media her zaman CorporateMediaItem[]
 * - text alanı SADECE feed içeriğidir
 */
export type CorporateFeedPost = {
  id: string;
  companyId: string;

  /** Paylaşım metni */
  text: string;

  /**
   * 🔒 ADIM 6
   * - Her zaman ARRAY
   * - Tek medya bile olsa array
   * - Medya yoksa [] gönderilir
   */
  media: CorporateMediaItem[];

  /** Beğeni sayısı */
  likeCount: number;

  /** Kullanıcı beğendi mi */
  liked: boolean;

  /** ISO date string */
  createdAt: string;
};