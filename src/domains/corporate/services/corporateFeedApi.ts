// src/domains/corporate/services/corporateFeedApi.ts

import type { CorporatePost } from "../types/feed.types";

/**
 * 🔒 BACKEND ADAPTER CONTRACT (ADIM 13)
 */

export type CorporateFeedApi = {
  fetchFeed: (companyId: string) => Promise<CorporatePost[]>;
  createPost: (post: CorporatePost) => Promise<CorporatePost>;
  toggleLike: (postId: string) => Promise<void>;
};