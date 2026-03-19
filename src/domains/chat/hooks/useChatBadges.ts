import { useEffect, useState } from "react";
import { chatService } from "../services/chatService";
import { ChatBadgeSummary } from "../types/chat.types";

/**
 * useChatBadges
 * - UI rozetleri buradan alır
 * - Subscribes to badge changes (e.g. after markAsSeen)
 */
export function useChatBadges() {
  const [badges, setBadges] = useState<ChatBadgeSummary>(
    chatService.getBadgeSummary()
  );

  useEffect(() => {
    const unsub = chatService.subscribeBadgeChange(() => {
      setBadges(chatService.getBadgeSummary());
    });
    return unsub;
  }, []);

  return {
    badges,
    refresh: () => setBadges(chatService.getBadgeSummary()),
  };
}