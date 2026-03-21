// src/domains/social/services/socialMockData.ts

import type { SocialEvent, SocialMusicTrack, SocialPost, SocialStory } from "../types/social.types";

export const MOCK_TRACKS: SocialMusicTrack[] = [
  { id: "t1", title: "Night Drive", artist: "ConnetctLine", durationSec: 22 },
  { id: "t2", title: "Deep Blue", artist: "ConnetctLine", durationSec: 35 },
];

export const MOCK_POSTS: SocialPost[] = [
  {
    id: "p1",
    userId: "u1",
    username: "soner",
    userAvatarUri: null,
    media: [
      { id: "m1", type: "image", uri: "https://picsum.photos/900/900?1" },
    ],
    caption: "Bugün yeni bir şey denedim ✨",
    music: MOCK_TRACKS[0],
    visibility: "public",
    createdAt: new Date().toISOString(),
    likeCount: 18,
    likedByMe: false,
    commentCount: 4,
    commentsPreview: [
      {
        id: "c1",
        postId: "p1",
        userId: "u2",
        username: "ayse",
        text: "Çok iyi görünüyor!",
        createdAt: new Date().toISOString(),
        likedByMe: false,
        likeCount: 1,
      },
    ],
  },
  {
    id: "p2",
    userId: "u3",
    username: "mehmet",
    userAvatarUri: null,
    media: [
      { id: "m2", type: "video", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", durationSec: 4 },
    ],
    caption: "Kısa bir video 🎬",
    music: null,
    visibility: "public",
    createdAt: new Date().toISOString(),
    likeCount: 120,
    likedByMe: true,
    commentCount: 12,
    commentsPreview: [],
  },
];

export const MOCK_STORIES: SocialStory[] = [
  {
    id: "s1",
    userId: "u1",
    username: "soner",
    userAvatarUri: null,
    media: { id: "sm1", type: "image", uri: "https://picsum.photos/900/1600?11" },
    textNote: "Günaydın ☀️",
    music: MOCK_TRACKS[1],
    visibility: "public",
    createdAt: new Date().toISOString(),
  },
  {
    id: "s2",
    userId: "u2",
    username: "ayse",
    userAvatarUri: null,
    media: { id: "sm2", type: "video", uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", durationSec: 4 },
    textNote: undefined,
    music: null,
    visibility: "public",
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_EVENTS: SocialEvent[] = [
  {
    id: "e1",
    ownerUserId: "u1",
    title: "Hafta Sonu Buluşması",
    description: "Kısa bir etkinlik, katılmak ister misin?",
    dateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    visibility: "public",
    participantCount: 23,
    joinedByMe: false,
    invites: [
      { userId: "u2", username: "ayse", status: "pending" },
      { userId: "u3", username: "mehmet", status: "accepted" },
    ],
  },
];