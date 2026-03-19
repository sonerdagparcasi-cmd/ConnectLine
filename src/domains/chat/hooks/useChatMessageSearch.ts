// src/domains/chat/hooks/useChatMessageSearch.ts

import { useEffect, useMemo, useState } from "react";
import type { FlatList } from "react-native";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type MessageLike = {
  text?: string;
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

function normalize(s: string) {
  return s.toLowerCase();
}

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatMessageSearch<T extends MessageLike>(
  messages: T[],
  listRef: React.RefObject<FlatList<any> | null>,
  options?: { getScrollIndex?: (messageIndex: number) => number }
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);

  /* ---------------- MATCHES ---------------- */

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query.trim());

    return messages
      .map((m, idx) =>
        m.text && normalize(m.text).includes(q) ? idx : -1
      )
      .filter((i) => i >= 0);
  }, [messages, query]);

  /* ---------------- SCROLL ---------------- */

  useEffect(() => {
    if (!open) return;
    if (!matches.length) return;
    if (matchIndex >= matches.length) return;

    const scrollIndex = options?.getScrollIndex
      ? options.getScrollIndex(matches[matchIndex])
      : matches[matchIndex];

    if (scrollIndex >= 0) {
      listRef.current?.scrollToIndex({
        index: scrollIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [open, matches, matchIndex, listRef, options]);

  /* ---------------- ACTIONS ---------------- */

  function openSearch() {
    setOpen(true);
    setQuery("");
    setMatchIndex(0);
  }

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setMatchIndex(0);
  }

  function next() {
    setMatchIndex((i) =>
      Math.min(matches.length - 1, i + 1)
    );
  }

  function prev() {
    setMatchIndex((i) => Math.max(0, i - 1));
  }

  /* ------------------------------------------------------------------ */

  return {
    open,
    query,
    setQuery,

    matches,
    matchIndex,

    openSearch,
    closeSearch,
    next,
    prev,
  };
}