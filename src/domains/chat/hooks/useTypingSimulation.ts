// src/domains/chat/hooks/useTypingSimulation.ts
// Mock "peer is typing" for a conversation

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatId } from "../types/chat.types";

const TYPING_ON_MIN_MS = 6000;
const TYPING_ON_MAX_MS = 14000;
const TYPING_DURATION_MIN_MS = 2000;
const TYPING_DURATION_MAX_MS = 4500;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function useTypingSimulation(chatId: ChatId | undefined): { isTyping: boolean } {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (scheduleRef.current) {
      clearTimeout(scheduleRef.current);
      scheduleRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const scheduleNext = () => {
      const delay = randomBetween(TYPING_ON_MIN_MS, TYPING_ON_MAX_MS);
      scheduleRef.current = setTimeout(() => {
        setIsTyping(true);
        const duration = randomBetween(TYPING_DURATION_MIN_MS, TYPING_DURATION_MAX_MS);
        timeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          scheduleNext();
        }, duration);
      }, delay);
    };

    scheduleNext();
    return clear;
  }, [chatId, clear]);

  return { isTyping };
}
