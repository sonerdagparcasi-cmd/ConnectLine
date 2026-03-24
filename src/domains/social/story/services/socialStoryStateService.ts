// src/domains/social/story/services/socialStoryStateService.ts
// 🔒 SOCIAL STORY STATE – UI-ONLY (domain isolated)

import type { SocialStory } from "../../types/social.types";
import { clearRepliesForStory } from "../../services/socialStoryReplyService";
import { addStoryReply, getStoryReplies } from "../../services/socialStoryReplyService";
import { socialMessageService } from "../../services/socialMessageService";

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

let storyListeners: Array<() => void> = [];

function emitStoryChange() {
  storyListeners.forEach((l) => l());
}

export function subscribeStories(listener: () => void) {
  if (!storyListeners.includes(listener)) storyListeners.push(listener);
  return () => {
    storyListeners = storyListeners.filter((l) => l !== listener);
  };
}

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
  if (viewedStories.has(storyId)) return;
  viewedStories.add(storyId);
  emitStoryChange();
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
  const next = upsertStory(userStories, {
    ...story,
    createdAt: story.createdAt ?? new Date().toISOString(),
  } as SocialStory);
  if (next !== userStories) {
    userStories = next;
    emitStoryChange();
  }
}

export function createStory(
  story: Partial<SocialStory> & {
    userId: string;
    media?: SocialStory["media"];
    text?: string;
  }
) {
  const newStory: SocialStory = {
    id: story.id ?? Date.now().toString(),
    userId: story.userId,
    username: story.username ?? getUserDisplay(story.userId).username,
    userAvatarUri: story.userAvatarUri ?? getUserDisplay(story.userId).avatarUri,
    media: story.media ?? null,
    visibility: story.visibility ?? "public",
    createdAt:
      typeof story.createdAt === "string"
        ? story.createdAt
        : new Date().toISOString(),
    textNote: story.text ?? story.textNote,
    caption: story.caption,
    overlays: story.overlays,
    music: story.music ?? null,
  };

  addStory(newStory);
  return newStory;
}

export function deleteStory(storyId: string) {
  userStories = userStories.filter((s) => s.id !== storyId);
  viewedStories.delete(storyId);
  storyIdIndex.delete(storyId);
  delete metaByStoryId[storyId];
  delete storyViewers[storyId];
  clearRepliesForStory(storyId);
  emitStoryChange();
}

export function markStorySeen(storyId: string, viewerUserId: string) {
  const meta = ensureMeta(storyId);
  if (meta.seenBy.includes(viewerUserId)) return;
  meta.seenBy.push(viewerUserId);
  emitStoryChange();
}

/** Compatibility: record viewer list for insights */
export function addStoryView(storyId: string, viewerUserId: string, viewerUsername: string) {
  const list = storyViewers[storyId] ?? [];
  if (list.some((v) => v.userId === viewerUserId)) return;
  storyViewers[storyId] = [
    ...list,
    { userId: viewerUserId, username: viewerUsername, seenAt: new Date().toISOString() },
  ];
  emitStoryChange();
}

export function addView(storyId: string, userId: string) {
  const display = getUserDisplay(userId);
  markStorySeen(storyId, userId);
  addStoryView(storyId, userId, display.username);
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
  emitStoryChange();
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
  emitStoryChange();
}

export function addReply(
  storyId: string,
  reply: { userId: string; text: string; username?: string; targetUserId?: string }
) {
  if (!reply.text.trim()) return null;
  const sender = getUserDisplay(reply.userId);
  const created = addStoryReply(
    storyId,
    reply.userId,
    reply.username ?? sender.username,
    reply.text.trim(),
    reply.targetUserId
  );
  socialMessageService.pushMessage({
    type: "story_reply",
    userId: reply.userId,
    text: reply.text.trim(),
    storyId,
    targetUserId: reply.targetUserId,
  });
  return created;
}

export function getReplies(storyId: string) {
  return getStoryReplies(storyId);
}

export const socialStoryStateService = {
  createStory,
  getStories,
  addView,
  addReply,
  getReplies,
  subscribeStories,
};

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

