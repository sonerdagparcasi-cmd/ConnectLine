// src/domains/corporate/feed/types/feed.types.ts
// 🔒 FEED TYPE CONTRACT (EXTENDED & LOCKED)
// ADIM 13.1 — Job Post Support

import { RankedItem } from "../../ai/ranking.types";
import { JobPost } from "../../recruitment/types/job.types";

/* ------------------------------------------------------------------ */
/* MEDIA TYPES (ADIM 6)                                                */
/* ------------------------------------------------------------------ */

export type CorporateMediaType = "image" | "video";

export type CorporateMediaItem = {
  id: string;
  type: CorporateMediaType;
  uri: string;

  /** video için opsiyonel thumbnail */
  thumbnailUri?: string;

  /** video süresi (sn) – opsiyonel */
  duration?: number;

  /** carousel sırası */
  order: number;
};

/* ------------------------------------------------------------------ */
/* COMMENT TYPES (ADIM 7)                                              */
/* ------------------------------------------------------------------ */

export type CorporateFeedComment = {
  id: string;

  postId: string;

  authorId: string;
  authorName: string;
  authorAvatar?: string;

  content: string;

  createdAt: string;

  likeCount: number;
  isLiked?: boolean;
};

/**
 * 🔒 SADECE PostDetail için
 * Feed state içine GİRMEZ
 */
export type CorporatePostComments = {
  postId: string;
  comments: CorporateFeedComment[];
};

/* ------------------------------------------------------------------ */
/* FEED POST TYPES (🔒 SOURCE OF TRUTH)                                */
/* ------------------------------------------------------------------ */

/**
 * Feed post tipleri
 * - text  → normal paylaşım
 * - media → medya ağırlıklı paylaşım
 * - job   → iş ilanı paylaşımı (ADIM 13)
 */
export type CorporateFeedPostType = "text" | "media" | "job";

/**
 * 🔒 Job Post Payload (Feed içi)
 * Sadece job post’larda dolu olur
 */
export type CorporateFeedJobPayload = {
  jobId: string;
  title: string;
  location: string;
};

export type CorporateFeedPost = {
  id: string;

  /** 🔒 Feed post türü */
  type: CorporateFeedPostType;

  authorId: string;
  authorName: string;
  authorAvatar?: string;

  /** Text / açıklama */
  text?: string;

  /**
   * ADIM 6:
   * - Tek medya
   * - Çoklu medya (carousel)
   * - Boş olabilir
   */
  media?: CorporateMediaItem[];

  /** 🔒 SADECE type === "job" ise */
  job?: CorporateFeedJobPayload;

  createdAt: string;

  likeCount: number;
  commentCount?: number;
  shareCount?: number;

  isLiked?: boolean;
};

/* ------------------------------------------------------------------ */
/* FEED ROOT DATA                                                     */
/* ------------------------------------------------------------------ */

export type CorporateFeedData = {
  /**
   * Feed post listesi
   * (state FeedScreen’de tutulur, PostDetail mutate etmez)
   */
  posts: CorporateFeedPost[];

  /**
   * Mevcut yapılar korunuyor
   */
  activeJobs: JobPost[];
  recommendedCandidates: RankedItem[];
};