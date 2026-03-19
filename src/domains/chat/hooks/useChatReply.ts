// src/domains/chat/hooks/useChatReply.ts

import { useEffect, useRef, useState } from "react";
import type { FlatList } from "react-native";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type ReplyMeta = {
  messageId: string;
  preview: string;
  mine: boolean;
};

type Params<T extends { id: string }> = {
  messages: T[];
  listRef: React.RefObject<FlatList<T> | null>;
};

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatReply<T extends { id: string; mine: boolean }>({
  messages,
  listRef,
}: Params<T>) {
  const [replyTo, setReplyTo] = useState<T | null>(null);
  const replyRef = useRef<T | null>(null);

  /* ---------------- SYNC REF ---------------- */

  useEffect(() => {
    replyRef.current = replyTo;
  }, [replyTo]);

  /* ---------------- ACTIONS ---------------- */

  function activateReply(target: T) {
    setReplyTo(target);
  }

  function clearReply() {
    setReplyTo(null);
  }

  /* ---------------- API ---------------- */

  return {
    replyTo,
    replyRef,
    activateReply,
    clearReply,
  };
}