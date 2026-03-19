// src/domains/corporate/services/mockCorporateFeedApi.ts

import type { CorporateFeedPost } from "../types/feed.types";
import type { CorporateFeedApi } from "./corporateFeedApi";

/**
 * ✅ MOCK BACKEND (ADIM 13) — FINAL
 * --------------------------------
 * Kurallar:
 * - media HER ZAMAN CorporateMediaItem[]
 * - Her media item: id + type + uri + order
 * - Medya yoksa: []
 */

let REMOTE_FEED: CorporateFeedPost[] = [
  {
    id: "post-1",
    companyId: "c1",
    text: "Yeni iş ilanımız yayında 🚀",
    media: [
      {
        id: "media-1",
        type: "image",
        uri: "https://picsum.photos/600/400",
        order: 0,
      },
    ],
    likeCount: 12,
    liked: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "post-2",
    companyId: "c1",
    text: "Ekibimiz büyüyor 💼",
    media: [], // 🔒 medya yoksa boş array
    likeCount: 4,
    liked: false,
    createdAt: new Date().toISOString(),
  },
];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export const mockCorporateFeedApi: CorporateFeedApi = {
  async fetchFeed(companyId: string) {
    return REMOTE_FEED.filter((p) => p.companyId === companyId);
  },

  async createPost(post: CorporateFeedPost) {
    const syncedPost: CorporateFeedPost = {
      ...post,
      id: generateId("post"),
      createdAt: new Date().toISOString(),
      media: (post.media ?? []).map((m, i) => ({
        ...m,
        id: m.id ?? generateId("media"),
        order: typeof m.order === "number" ? m.order : i,
      })),
    };

    REMOTE_FEED = [syncedPost, ...REMOTE_FEED];
    return syncedPost;
  },

  async toggleLike(postId: string) {
    REMOTE_FEED = REMOTE_FEED.map((p) => {
      if (p.id !== postId) return p;

      const nextLiked = !p.liked;
      return {
        ...p,
        liked: nextLiked,
        likeCount: nextLiked ? p.likeCount + 1 : p.likeCount - 1,
      };
    });
  },
};