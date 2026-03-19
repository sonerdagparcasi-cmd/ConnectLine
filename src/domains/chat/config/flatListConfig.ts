// src/domains/chat/config/flatListConfig.ts
// Shared FlatList scroll/render options for chat lists

import { Platform } from "react-native";

/**
 * Default scroll optimizations for chat FlatLists:
 * - windowSize: number of viewports to render (smaller = less memory, more blank on fast scroll)
 * - maxToRenderPerBatch: items per batch when scrolling
 * - initialNumToRender: items on first paint (above-the-fold)
 * - removeClippedSubviews: unmount off-screen cells (Android; can help memory)
 */
export const CHAT_FLATLIST_DEFAULTS = {
  windowSize: 9,
  maxToRenderPerBatch: 8,
  initialNumToRender: 12,
  removeClippedSubviews: Platform.OS === "android",
} as const;

/** Conversation (message list): slightly more initial items for above-the-fold */
export const CONVERSATION_FLATLIST = {
  ...CHAT_FLATLIST_DEFAULTS,
  initialNumToRender: 15,
} as const;

/** Inbox (chat list): default initial render */
export const INBOX_FLATLIST = CHAT_FLATLIST_DEFAULTS;
