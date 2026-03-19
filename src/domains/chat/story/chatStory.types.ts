/**
 * Chat Story Types
 *
 * - SADECE Chat domain
 * - Avatar ChatProfile’dan runtime alınır
 */

export type ChatStoryId = string;
export type ChatUserId = string;

/* ------------------------------------------------------------------ */
/* MEDIA                                                               */
/* ------------------------------------------------------------------ */

export type ChatStoryMediaType = "image" | "video";

export interface ChatStoryMedia {
  type: ChatStoryMediaType;
  uri: string;

  width?: number;
  height?: number;
  duration?: number;
}

/* ------------------------------------------------------------------ */
/* STORY                                                               */
/* ------------------------------------------------------------------ */

export interface ChatStory {
  id: ChatStoryId;

  ownerId: ChatUserId;
  ownerName: string;

  media: ChatStoryMedia;
  caption?: string;

  createdAt: number;
}

/* ------------------------------------------------------------------ */
/* GROUP                                                               */
/* ------------------------------------------------------------------ */

export interface ChatStoryGroup {
  ownerId: ChatUserId;
  ownerName: string;

  stories: ChatStory[];
}
