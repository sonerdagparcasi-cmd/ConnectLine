// src/domains/social/services/socialCommentService.ts
// FAZ 5 — Yorum API’si (depolama: socialFeedStateService tek kaynak)

import type { SocialComment } from "../types/social.types";
import {
  addComment as addCommentToFeedStore,
  getComments as getCommentsFromFeedStore,
} from "./socialFeedStateService";

export type AddSocialCommentInput = {
  userId: string;
  text: string;
  username?: string;
};

/** Gönderiye yorum ekler; post.commentCount ve commentsPreview güncellenir. */
export function addComment(
  postId: string,
  input: AddSocialCommentInput
): SocialComment {
  const username = input.username?.trim() || input.userId;
  return addCommentToFeedStore(postId, {
    userId: input.userId,
    username,
    text: input.text.trim(),
  });
}

/** Gönderinin yorum listesi (en yeni üstte). */
export function getComments(postId: string): SocialComment[] {
  return getCommentsFromFeedStore(postId);
}
