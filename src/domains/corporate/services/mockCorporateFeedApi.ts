// src/domains/corporate/services/mockCorporateFeedApi.ts

import type { CorporatePost } from "../types/feed.types";
import type { CorporateFeedApi } from "./corporateFeedApi";

/**
 * MOCK BACKEND — CorporatePost şekli (caption, likedByMe, commentCount, createdAt ms)
 */

let REMOTE_FEED: CorporatePost[] = [
  {
    id: "post-1",
    companyId: "c1",
    caption: "Yeni iş ilanımız yayında.",
    media: [
      {
        id: "media-1",
        type: "image",
        uri: "https://picsum.photos/800/1000",
        order: 0,
        width: 800,
        height: 1000,
      },
      {
        id: "media-1b",
        type: "image",
        uri: "https://picsum.photos/1200/800",
        order: 1,
        width: 1200,
        height: 800,
      },
    ],
    overlays: [
      {
        id: "ov-1",
        type: "text",
        x: 0.08,
        y: 0.12,
        value: "Kurumsal duyuru",
        style: { fontWeight: "700", fontSize: 16 },
      },
      {
        id: "ov-2",
        type: "tag",
        x: 0.1,
        y: 0.78,
        value: "İK",
      },
    ],
    visibility: "public",
    likeCount: 12,
    likedByMe: false,
    commentCount: 2,
    createdAt: Date.now() - 86_400_000,
    isAnnouncement: true,
    commentsDisabled: false,
    likeCountHidden: false,
  },
  {
    id: "post-2",
    companyId: "c1",
    caption: "Ekibimiz büyüyor.",
    media: [
      {
        id: "media-v1",
        type: "video",
        uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        order: 0,
        width: 1280,
        height: 720,
        thumbnailUri: "https://picsum.photos/1280/720",
        durationMs: 596_000,
      },
    ],
    visibility: "public",
    likeCount: 4,
    likedByMe: false,
    commentCount: 0,
    createdAt: Date.now() - 172_800_000,
    isHiring: true,
    commentsDisabled: false,
    likeCountHidden: false,
  },
];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export const mockCorporateFeedApi: CorporateFeedApi = {
  async fetchFeed(companyId: string) {
    return REMOTE_FEED.filter((p) => p.companyId === companyId);
  },

  async createPost(post: CorporatePost) {
    const syncedPost: CorporatePost = {
      ...post,
      id: generateId("post"),
      createdAt: Date.now(),
      media: (post.media ?? []).map((m, i) => ({
        ...m,
        id: m.id || generateId("media"),
        order: typeof m.order === "number" ? m.order : i,
      })),
    };

    REMOTE_FEED = [syncedPost, ...REMOTE_FEED];
    return syncedPost;
  },

  async toggleLike(postId: string) {
    REMOTE_FEED = REMOTE_FEED.map((p) => {
      if (p.id !== postId) return p;

      const nextLiked = !p.likedByMe;
      return {
        ...p,
        likedByMe: nextLiked,
        likeCount: nextLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
      };
    });
  },
};
