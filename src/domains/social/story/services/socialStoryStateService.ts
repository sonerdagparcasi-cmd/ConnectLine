// src/domains/social/story/services/socialStoryStateService.ts
// 🔒 SOCIAL STORY STATE – UI-ONLY (domain isolated)

import type { SocialStory } from "../../types/social.types";

const MOCK_USERS = [
  {
    userId: "u1",
    username: "Sen",
    avatarUri: "https://i.pravatar.cc/150?img=1",
  },
  {
    userId: "u2",
    username: "Mehmet",
    avatarUri: "https://i.pravatar.cc/150?img=2",
  },
  {
    userId: "u3",
    username: "Ayşe",
    avatarUri: "https://i.pravatar.cc/150?img=3",
  },
  {
    userId: "u4",
    username: "Ali",
    avatarUri: "https://i.pravatar.cc/150?img=4",
  },
  {
    userId: "u5",
    username: "Zeynep",
    avatarUri: "https://i.pravatar.cc/150?img=5",
  },
  {
    userId: "u6",
    username: "Kerem",
    avatarUri: "https://i.pravatar.cc/150?img=6",
  },
];

function generateMockStories(): SocialStory[] {
  const now = Date.now();

  return MOCK_USERS.map((u, i) => ({
    id: `s_mock_${i}`,
    userId: u.userId,
    username: u.username,
    userAvatarUri: u.avatarUri,
    createdAt: new Date(now - i * 600000).toISOString(),
    media: {
      id: `s_mock_m_${i}`,
      type: "image" as const,
      uri: "https://picsum.photos/400/700?random=" + i,
    },
    music: null,
    visibility: "public" as const,
  }));
}

export type SocialStoryUserDisplay = {
  userId: string;
  username: string;
  avatarUri: string | null;
};

type StoryMeta = {
  seenBy: string[];
  likedBy: string[];
  reactions?: {
    userId: string;
    emoji: string;
    createdAt: string;
  }[];
};

export type StoryViewEntry = { userId: string; username: string; seenAt: string };

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

const viewedStories = new Set<string>(); // for ring state (per story id)
const metaByStoryId: Record<string, StoryMeta> = {};
const storyViewers: Record<string, StoryViewEntry[]> = {};

let STORIES: SocialStory[] = [];
let userStories: SocialStory[] = [];
const storyIdIndex = new Set<string>();

function ensureMeta(storyId: string): StoryMeta {
  if (!metaByStoryId[storyId]) {
    metaByStoryId[storyId] = { seenBy: [], likedBy: [] };
  }
  return metaByStoryId[storyId];
}

function upsertStory(list: SocialStory[], story: SocialStory) {
  if (storyIdIndex.has(story.id)) return list;
  storyIdIndex.add(story.id);
  return [story, ...list];
}

export function isStoryExpired(createdAtISO: string) {
  const created = new Date(createdAtISO).getTime();
  return Date.now() - created > STORY_LIFETIME_MS;
}

export function markStoryViewed(storyId: string) {
  viewedStories.add(storyId);
}

export function isStoryViewed(storyId: string, ownerUserId?: string, currentUserId?: string) {
  // own story appears as "seen" for ring parity
  if (ownerUserId && currentUserId && ownerUserId === currentUserId) return true;
  return viewedStories.has(storyId);
}

export function getStories(): SocialStory[] {
  if (!STORIES.length) {
    STORIES = generateMockStories();
  }
  const combined = [...STORIES, ...userStories].filter(
    (s) => !s?.createdAt || !isStoryExpired(s.createdAt)
  );
  return combined;
}

export function addStory(
  story: Omit<SocialStory, "createdAt"> & { createdAt?: string }
) {
  userStories = upsertStory(userStories, {
    ...story,
    createdAt: story.createdAt ?? new Date().toISOString(),
  } as SocialStory);
}

export function deleteStory(storyId: string) {
  userStories = userStories.filter((s) => s.id !== storyId);
  viewedStories.delete(storyId);
  storyIdIndex.delete(storyId);
  delete metaByStoryId[storyId];
}

export function markStorySeen(storyId: string, viewerUserId: string) {
  const meta = ensureMeta(storyId);
  if (!meta.seenBy.includes(viewerUserId)) meta.seenBy.push(viewerUserId);
}

/** Compatibility: record viewer list for insights */
export function addStoryView(storyId: string, viewerUserId: string, viewerUsername: string) {
  const list = storyViewers[storyId] ?? [];
  if (list.some((v) => v.userId === viewerUserId)) return;
  storyViewers[storyId] = [
    ...list,
    { userId: viewerUserId, username: viewerUsername, seenAt: new Date().toISOString() },
  ];
}

export function getStoryViewers(storyId: string): StoryViewEntry[] {
  return storyViewers[storyId] ?? [];
}

export function toggleLike(storyId: string, userId: string) {
  const meta = ensureMeta(storyId);
  if (meta.likedBy.includes(userId)) {
    meta.likedBy = meta.likedBy.filter((id) => id !== userId);
  } else {
    meta.likedBy.push(userId);
  }
}

export function addReaction(storyId: string, userId: string, emoji: string) {
  const meta = ensureMeta(storyId);
  if (!meta.reactions) meta.reactions = [];
  meta.reactions = meta.reactions.filter((r) => r.userId !== userId);
  meta.reactions.push({
    userId,
    emoji,
    createdAt: new Date().toISOString(),
  });
}

export function getStoryMeta(storyId: string): StoryMeta {
  return ensureMeta(storyId);
}

export function getStoriesByUserId(userId: string): SocialStory[] {
  return getStories().filter((s) => s.userId === userId);
}

export function getUserDisplay(userId: string): SocialStoryUserDisplay {
  const u = (userId ?? "").toString();
  const mockRow = MOCK_USERS.find((m) => m.userId === u);
  if (mockRow) {
    return {
      userId: u,
      username: mockRow.username,
      avatarUri: mockRow.avatarUri,
    };
  }

  const stories = getStories();
  for (let i = stories.length - 1; i >= 0; i--) {
    const s = stories[i];
    if (s?.userId !== u) continue;
    const username = (s?.username ?? "").toString().trim() || "User";
    const avatarUri =
      typeof s?.userAvatarUri === "string" && s.userAvatarUri?.trim()
        ? s.userAvatarUri.trim()
        : null;
    return { userId: u, username, avatarUri };
  }

  return {
    userId: u,
    username: "User",
    avatarUri: null,
  };
}

