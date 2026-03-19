// src/domains/chat/services/reactionService.ts
// Message reactions: add, remove, toggle. Mesaj içindeki reactions array setter ile güncellenir.

import type { MessageReaction } from "../types/chat.types";

type GetMessageReactions = (messageId: string) => MessageReaction[] | undefined;
type SetMessageReactions = (messageId: string, reactions: MessageReaction[]) => void;

let getReactions: GetMessageReactions = () => undefined;
let setReactions: SetMessageReactions = () => {};

/**
 * Servisi ekranın mesaj state'i ile bağlamak için çağrılır.
 * getMessageReactions / setMessageReactions ile mesaj içindeki reactions array okunur ve güncellenir.
 */
export function initReactionService(config: {
  getMessageReactions: GetMessageReactions;
  setMessageReactions: SetMessageReactions;
}): void {
  getReactions = config.getMessageReactions;
  setReactions = config.setMessageReactions;
}

/**
 * Get reactions for a message.
 */
export function getReactionsForMessage(messageId: string): MessageReaction[] {
  return getReactions(messageId) ?? [];
}

function hasReaction(reactions: MessageReaction[], emoji: string, userId: string): boolean {
  return reactions.some((r) => r.emoji === emoji && r.userId === userId);
}

/**
 * Add a reaction. No-op if same emoji+userId already exists.
 */
export function addReaction(messageId: string, emoji: string, userId: string): void {
  const current = getReactions(messageId) ?? [];
  if (hasReaction(current, emoji, userId)) return;
  setReactions(messageId, [...current, { emoji, userId, createdAt: Date.now() }]);
}

/**
 * Remove a reaction.
 */
export function removeReaction(messageId: string, emoji: string, userId: string): void {
  const current = getReactions(messageId) ?? [];
  const next = current.filter((r) => !(r.emoji === emoji && r.userId === userId));
  setReactions(messageId, next);
}

/**
 * Toggle: add if not present, remove if present.
 */
export function toggleReaction(messageId: string, emoji: string, userId: string): void {
  const current = getReactions(messageId) ?? [];
  if (hasReaction(current, emoji, userId)) {
    removeReaction(messageId, emoji, userId);
  } else {
    addReaction(messageId, emoji, userId);
  }
}

/**
 * Set the user's reaction (one per user per message).
 * Removes any existing reaction by this user, then adds the given emoji.
 * Use for quick reactions: tapping the other emoji replaces the previous one.
 * For "tap same to remove" use toggleReaction.
 */
export function setReaction(messageId: string, emoji: string, userId: string): void {
  const current = getReactions(messageId) ?? [];
  const withoutMine = current.filter((r) => r.userId !== userId);
  setReactions(messageId, [...withoutMine, { emoji, userId, createdAt: Date.now() }]);
}
