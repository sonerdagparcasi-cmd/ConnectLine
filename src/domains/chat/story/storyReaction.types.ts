/**
 * Chat Story Reaction Types
 *
 * - SADECE Chat domain
 * - UI-only
 */

export type StoryReactionType =
  | "❤️"
  | "🔥"
  | "😂"
  | "👍"
  | "😮"
  | "🙈"
  | "👌"
  | "👏"
  | "😢"
  | "😡";

export interface StoryReaction {
  storyId: string;
  fromUserId: string;
  reaction: StoryReactionType;
  createdAt: number;
}
