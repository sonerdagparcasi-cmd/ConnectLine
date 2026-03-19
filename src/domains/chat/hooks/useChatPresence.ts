// src/domains/chat/hooks/useChatPresence.ts
// Subscribe to presence (online / last seen) for a user

import { useEffect, useState } from "react";
import { chatPresenceService } from "../services/chatPresenceService";
import type { UserId } from "../types/chat.types";
import type { Presence } from "../services/chatPresenceService";

export function useChatPresence(userId: UserId | undefined): Presence {
  const [presence, setPresence] = useState<Presence>(() =>
    userId ? chatPresenceService.getPresence(userId) : { isOnline: false, lastSeenAt: 0 }
  );

  useEffect(() => {
    if (!userId) return;
    setPresence(chatPresenceService.getPresence(userId));
    const unsub = chatPresenceService.subscribe(() => {
      setPresence(chatPresenceService.getPresence(userId));
    });
    return unsub;
  }, [userId]);

  return presence;
}
