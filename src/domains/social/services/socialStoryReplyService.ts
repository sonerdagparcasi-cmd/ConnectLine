// src/domains/social/services/socialStoryReplyService.ts
// 🔒 SOCIAL STORY REPLY SERVICE – UI ONLY
// PURPOSE:
// - story reply system
// - emoji reaction
// - reply inbox
// - owner analytics ready
// ARCHITECTURE SAFE

import type { SocialStory } from "../types/social.types";
import { emitSocialEvent } from "./socialFeedStateService";
import { socialNotificationService } from "./socialNotificationService";
/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type SocialStoryReplyType =
  | "message"
  | "reaction";

export type SocialStoryReply = {
  id: string;

  storyId: string;

  senderUserId: string;
  senderUsername: string;

  type: SocialStoryReplyType;

  message?: string;
  reaction?: string;

  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* STORE (UI ONLY)                                                    */
/* ------------------------------------------------------------------ */

let STORY_REPLIES: Record<string, SocialStoryReply[]> = {};

let replyListeners: Array<() => void> = [];

function emitReplyChange() {
  replyListeners.forEach((l) => l());
}

export function subscribeStoryReplies(listener: () => void) {
  if (!replyListeners.includes(listener)) replyListeners.push(listener);
  return () => {
    replyListeners = replyListeners.filter((l) => l !== listener);
  };
}

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return "reply_" + Math.random().toString(36).slice(2);
}

/* ------------------------------------------------------------------ */
/* ADD MESSAGE REPLY                                                  */
/* ------------------------------------------------------------------ */

export function addStoryReply(
  storyId: string,
  senderUserId: string,
  senderUsername: string,
  message: string,
  targetUserId?: string
) {
  const reply: SocialStoryReply = {
    id: generateId(),
    storyId,
    senderUserId,
    senderUsername,
    type: "message",
    message,
    createdAt: new Date().toISOString(),
  };

  const existing = STORY_REPLIES[storyId] ?? [];

  STORY_REPLIES = {
    ...STORY_REPLIES,
    [storyId]: [reply, ...existing],
  };

  emitReplyChange();
  emitSocialEvent({
    type: "STORY_REPLY",
    userId: senderUserId,
    actorUsername: senderUsername,
    targetUserId,
    storyId,
  });
  if (targetUserId && targetUserId !== senderUserId) {
    socialNotificationService.push({
      type: "story_reply",
      userId: senderUserId,
      targetId: targetUserId,
      storyId,
      message: "story_reply",
    });
  }
  return reply;
}

/* ------------------------------------------------------------------ */
/* ADD EMOJI REACTION                                                 */
/* ------------------------------------------------------------------ */

export function addStoryReaction(
  storyId: string,
  senderUserId: string,
  senderUsername: string,
  reaction: string,
  targetUserId?: string
) {
  const reply: SocialStoryReply = {
    id: generateId(),
    storyId,
    senderUserId,
    senderUsername,
    type: "reaction",
    reaction,
    createdAt: new Date().toISOString(),
  };

  const existing = STORY_REPLIES[storyId] ?? [];

  STORY_REPLIES = {
    ...STORY_REPLIES,
    [storyId]: [reply, ...existing],
  };

  emitReplyChange();
  emitSocialEvent({
    type: "STORY_REACTION",
    userId: senderUserId,
    actorUsername: senderUsername,
    targetUserId,
    storyId,
    reaction,
  });
  if (targetUserId && targetUserId !== senderUserId) {
    socialNotificationService.push({
      type: "story_emoji",
      userId: senderUserId,
      targetId: targetUserId,
      storyId,
      message: "story_emoji",
    });
  }
  return reply;
}

/* ------------------------------------------------------------------ */
/* GET STORY REPLIES                                                  */
/* ------------------------------------------------------------------ */

export function getStoryReplies(storyId: string) {
  return STORY_REPLIES[storyId] ?? [];
}

/* ------------------------------------------------------------------ */
/* GET OWNER INBOX                                                    */
/* ------------------------------------------------------------------ */

export function getRepliesForStories(
  stories: SocialStory[]
) {
  const ids = new Set(stories.map((s) => s.id));

  const replies: SocialStoryReply[] = [];

  Object.values(STORY_REPLIES).forEach((list) => {
    list.forEach((reply) => {
      if (ids.has(reply.storyId)) {
        replies.push(reply);
      }
    });
  });

  return replies.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

/* ------------------------------------------------------------------ */
/* GET STORY REPLY COUNT                                              */
/* ------------------------------------------------------------------ */

export function getStoryReplyCount(storyId: string) {
  const list = STORY_REPLIES[storyId];

  if (!list) return 0;

  return list.length;
}

/* ------------------------------------------------------------------ */
/* RESET (DEV TOOL)                                                   */
/* ------------------------------------------------------------------ */

export function resetStoryReplies() {
  STORY_REPLIES = {};
  emitReplyChange();
}

/** Story silindiğinde yanıtları temizle (tek kaynak tutarlılığı) */
export function clearRepliesForStory(storyId: string) {
  if (!STORY_REPLIES[storyId]) return;
  const { [storyId]: _removed, ...rest } = STORY_REPLIES;
  STORY_REPLIES = rest;
  emitReplyChange();
}