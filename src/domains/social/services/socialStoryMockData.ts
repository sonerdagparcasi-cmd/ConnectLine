// src/domains/social/services/socialStoryMockData.ts
// 🔒 SOCIAL STORY MOCK DATA — UI ONLY (GROUPED STORIES READY)

import type { SocialStory } from "../types/social.types";

/* ------------------------------------------------------------------ */
/* MOCK STORIES                                                        */
/* ------------------------------------------------------------------ */

export const MOCK_STORIES: SocialStory[] = [
  /* ------------------------------------------------------------------ */
  /* USER 1 – 3 STORIES                                                 */
  /* ------------------------------------------------------------------ */

  {
    id: "s1",
    userId: "u1",
    username: "Sosyal Kullanıcı",
    userAvatarUri: null,
    media: {
      id: "m1",
      type: "image",
      uri: "https://picsum.photos/400/700?1",
    },
    textNote: "Yeni gün 🚀",
    music: null,
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },

  {
    id: "s2",
    userId: "u1",
    username: "Sosyal Kullanıcı",
    userAvatarUri: null,
    media: {
      id: "m2",
      type: "image",
      uri: "https://picsum.photos/400/700?2",
    },
    textNote: "Kahve zamanı ☕",
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },

  {
    id: "s3",
    userId: "u1",
    username: "Sosyal Kullanıcı",
    userAvatarUri: null,
    media: {
      id: "m3",
      type: "image",
      uri: "https://picsum.photos/400/700?3",
    },
    textNote: "Bugün güzel geçecek",
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },

  /* ------------------------------------------------------------------ */
  /* USER 2 – 2 STORIES                                                 */
  /* ------------------------------------------------------------------ */

  {
    id: "s4",
    userId: "u2",
    username: "Ayşe",
    userAvatarUri: null,
    media: {
      id: "m4",
      type: "image",
      uri: "https://picsum.photos/400/700?4",
    },
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },

  {
    id: "s5",
    userId: "u2",
    username: "Ayşe",
    userAvatarUri: null,
    media: {
      id: "m5",
      type: "image",
      uri: "https://picsum.photos/400/700?5",
    },
    textNote: "Deniz 🌊",
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },

  /* ------------------------------------------------------------------ */
  /* USER 3 – 1 STORY                                                   */
  /* ------------------------------------------------------------------ */

  {
    id: "s6",
    userId: "u3",
    username: "Mehmet",
    userAvatarUri: null,
    media: {
      id: "m6",
      type: "video",
      uri: "https://example.com/mock-video.mp4",
      durationSec: 12,
    },
    visibility: "public",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];