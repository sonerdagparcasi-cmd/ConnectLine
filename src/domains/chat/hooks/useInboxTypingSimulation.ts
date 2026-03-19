// src/domains/chat/hooks/useInboxTypingSimulation.ts
// Mock typing indicator for one chat in the inbox list

import { useEffect, useRef, useState } from "react";
import type { ChatId } from "../types/chat.types";

const TYPING_DURATION_MS = 3500;
const PAUSE_MIN_MS = 8000;
const PAUSE_MAX_MS = 18000;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function useInboxTypingSimulation(chatIds: ChatId[]): ChatId | null {
  const [typingId, setTypingId] = useState<ChatId | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatIdsKey = chatIds.join(",");

  useEffect(() => {
    if (chatIds.length === 0) return;

    const schedule = () => {
      const delay = randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS);
      scheduleRef.current = setTimeout(() => {
        const idx = Math.floor(Math.random() * chatIds.length);
        const id = chatIds[idx];
        setTypingId(id);
        timeoutRef.current = setTimeout(() => {
          setTypingId(null);
          schedule();
        }, TYPING_DURATION_MS);
      }, delay);
    };
    schedule();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scheduleRef.current) clearTimeout(scheduleRef.current);
    };
  }, [chatIdsKey, chatIds.length]);

  return typingId;
}
