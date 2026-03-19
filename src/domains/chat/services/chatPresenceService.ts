import { chatRealtimeAdapter } from "../realtime/chatRealtimeAdapter";

export type ChatPresenceState = {
  userId: string;
  isOnline: boolean;
  lastSeenAt: number;
};

/** Backward-compat for useChatPresence (same shape without userId) */
export type Presence = { isOnline: boolean; lastSeenAt: number };

const presenceMap = new Map<string, ChatPresenceState>();

export const chatPresenceService = {
  setOnline(userId: string) {
    const next: ChatPresenceState = {
      userId,
      isOnline: true,
      lastSeenAt: Date.now(),
    };

    presenceMap.set(userId, next);

    chatRealtimeAdapter.publish({
      type: "presence:update",
      userId,
      isOnline: next.isOnline,
      lastSeenAt: next.lastSeenAt,
      occurredAt: Date.now(),
    });
  },

  setOffline(userId: string) {
    const next: ChatPresenceState = {
      userId,
      isOnline: false,
      lastSeenAt: Date.now(),
    };

    presenceMap.set(userId, next);

    chatRealtimeAdapter.publish({
      type: "presence:update",
      userId,
      isOnline: next.isOnline,
      lastSeenAt: next.lastSeenAt,
      occurredAt: Date.now(),
    });
  },

  touch(userId: string) {
    const prev = presenceMap.get(userId);

    const next: ChatPresenceState = {
      userId,
      isOnline: prev?.isOnline ?? true,
      lastSeenAt: Date.now(),
    };

    presenceMap.set(userId, next);

    chatRealtimeAdapter.publish({
      type: "presence:update",
      userId,
      isOnline: next.isOnline,
      lastSeenAt: next.lastSeenAt,
      occurredAt: Date.now(),
    });
  },

  getPresence(userId: string): ChatPresenceState {
    return (
      presenceMap.get(userId) ?? {
        userId,
        isOnline: false,
        lastSeenAt: Date.now(),
      }
    );
  },

  /** Backward-compat: subscribe to presence updates via event bus */
  subscribe(listener: () => void): () => void {
    return chatRealtimeAdapter.subscribe((event) => {
      if (event.type === "presence:update") listener();
    });
  },
};
