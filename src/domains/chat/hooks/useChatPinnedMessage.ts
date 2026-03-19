// src/domains/chat/hooks/useChatPinnedMessage.ts

import { useMemo, useState } from "react";
import type { FlatList } from "react-native";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type MessageLike = {
  id: string;
};

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */
/**
 * useChatPinnedMessage
 *
 * Kurallar:
 * - UI-only
 * - Sadece group chat’lerde aktif
 * - listRef null-safe (React standardı)
 */
export function useChatPinnedMessage<T extends MessageLike>(
  messages: T[],
  listRef: React.RefObject<FlatList<T> | null>,
  isGroup: boolean
) {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  /* ---------------- PINNED MESSAGE ---------------- */

  const pinnedMessage = useMemo(() => {
    if (!pinnedId) return null;
    return messages.find((m) => m.id === pinnedId) ?? null;
  }, [messages, pinnedId]);

  /* ---------------- ACTIONS ---------------- */

  function togglePin(target: T) {
    if (!isGroup) return;

    setPinnedId((current) =>
      current === target.id ? null : target.id
    );
  }

  function scrollToPinned() {
    if (!pinnedId) return;
    if (!listRef.current) return;

    const idx = messages.findIndex((m) => m.id === pinnedId);
    if (idx < 0) return;

    listRef.current.scrollToIndex({
      index: idx,
      animated: true,
      viewPosition: 0.2,
    });
  }

  /* ------------------------------------------------------------------ */

  return {
    pinnedId,
    pinnedMessage,

    togglePin,
    scrollToPinned,
  };
}