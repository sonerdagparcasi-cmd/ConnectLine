// src/domains/corporate/services/corporateFeedApi.ts

import type { CorporateFeedPost } from "../types/feed.types";

/**
 * 🔒 BACKEND ADAPTER CONTRACT (ADIM 13)
 * Service bu arayüzü kullanır.
 * Gerçek backend geldiğinde sadece implementasyon değişir.
 */

export type CorporateFeedApi = {
  fetchFeed: (companyId: string) => Promise<CorporateFeedPost[]>;
  createPost: (post: CorporateFeedPost) => Promise<CorporateFeedPost>;
  toggleLike: (postId: string) => Promise<void>;
};