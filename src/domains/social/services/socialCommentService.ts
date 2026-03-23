// src/domains/social/services/socialCommentService.ts
// FAZ 5 / ADIM 3 — Yorum API (UI); depolama: socialFeedStateService (tek kaynak)

import type { SocialComment } from "../types/social.types";
import {
  addComment as addCommentToFeed,
  deleteComment as deleteCommentFromFeed,
  getComments as getCommentsFromFeed,
  subscribeFeed,
} from "./socialFeedStateService";
import { getCurrentSocialUserId } from "./socialFollowService";

/** Gönderi yorumu (feed ile aynı şema) */
export type Comment = SocialComment;

/**
 * Yorum ekler; feed’deki `commentCount` / önizleme güncellenir.
 * Bildirim: `socialFeedStateService.addComment` → `notifyPostCommented` (tek kaynak).
 */
export function addComment(postId: string, text: string): void {
  if (!text.trim()) return;
  addCommentToFeed(postId, {
    userId: getCurrentSocialUserId(),
    username: "Sen",
    text: text.trim(),
  });
}

export function getComments(postId: string): SocialComment[] {
  return getCommentsFromFeed(postId);
}

export function deleteComment(postId: string, commentId: string): void {
  deleteCommentFromFeed(postId, commentId);
}

/** Feed ile aynı olay döngüsü — yorum eklendiğinde tetiklenir. */
export function subscribeComments(listener: () => void) {
  return subscribeFeed(listener);
}
