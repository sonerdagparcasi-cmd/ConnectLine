// src/domains/chat/hooks/useChatRoomReply.ts
// (ADIM 5.3 – Reply + Scroll + Highlight hook, UI-only, Chat domain)
//
// Sorumluluk:
// - replyTo state + replyRef (record/send için güncel reply)
// - reply set/clear
// - reply banner tap → scrollToMessage + highlight
//
// Kurallar:
// - Navigation YOK
// - Audio YOK
// - Composer YOK
// - Message create YOK
// - Sadece reply / scroll / highlight

import { useCallback, useEffect, useRef, useState } from "react";
import type { FlatList } from "react-native";

type WithId = { id: string };

type Params<T extends WithId> = {
  messages: T[];
  listRef: React.RefObject<FlatList<T>>;
  highlightDurationMs?: number;

  /**
   * Reply set edildiği anda ekranın yapacağı UI işleri:
   * - edit cancel
   * - input focus
   * vb.
   *
   * Hook UI kararını vermez, sadece callback çağırır.
   */
  onReplyActivated?: () => void;
};

export function useChatRoomReply<T extends WithId>({
  messages,
  listRef,
  highlightDurationMs = 2200,
  onReplyActivated,
}: Params<T>) {
  const [replyTo, setReplyTo] = useState<T | null>(null);
  const replyRef = useRef<T | null>(null);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    replyRef.current = replyTo;
  }, [replyTo]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
    };
  }, []);

  const clearReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const activateReply = useCallback(
    (m: T) => {
      setReplyTo(m);
      onReplyActivated?.();
    },
    [onReplyActivated]
  );

  const scrollToMessage = useCallback(
    (messageId: string) => {
      const index = messages.findIndex((m) => m.id === messageId);
      if (index < 0) return;

      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });

      setHighlightedId(messageId);

      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedId(null);
        highlightTimerRef.current = null;
      }, highlightDurationMs);
    },
    [messages, listRef, highlightDurationMs]
  );

  return {
    // state
    replyTo,
    highlightedId,

    // refs
    replyRef,

    // actions
    setReplyTo,
    clearReply,
    activateReply,
    scrollToMessage,
  };
}