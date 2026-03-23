/* ------------------------------------------------------------------ */
/* MEDIA                                                              */
/* ------------------------------------------------------------------ */

/**
 * Kurumsal feed medya türleri
 */
export type CorporateMediaType = "image" | "video";

/**
 * 🔒 TEK MEDYA TİPİ — Feed, PostDetail, MediaPreview, fullscreen
 */
export type CorporateMediaItem = {
  id: string;
  type: CorporateMediaType;
  uri: string;
  order: number;
  width?: number;
  height?: number;
  thumbnailUri?: string;
  /** video süresi (ms) */
  durationMs?: number;
};

export type CorporateOverlay = {
  id: string;
  type: "text" | "tag";
  /** 0..1 relative X */
  x: number;
  /** 0..1 relative Y */
  y: number;
  value: string;
  style?: {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
  };
};

/* ------------------------------------------------------------------ */
/* FEED POST — canonical (corporateFeedStateService)                  */
/* ------------------------------------------------------------------ */

export type CorporatePost = {
  id: string;
  companyId: string;
  media: CorporateMediaItem[];
  overlays?: CorporateOverlay[];
  caption: string;
  visibility: "public" | "network";
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: number;
  isAnnouncement?: boolean;
  isHiring?: boolean;
  commentsDisabled?: boolean;
  likeCountHidden?: boolean;
};

/**
 * Legacy isim — CorporatePost ile aynı (feed bileşenleri uyumu)
 */
export type CorporateFeedPost = CorporatePost;
