import { chatRealtimeAdapter } from "../realtime/chatRealtimeAdapter";

type TypingEntry = {
  chatId: string;
  userId: string;
  isTyping: boolean;
  updatedAt: number;
};

const TYPING_TTL = 4000;
const typingMap = new Map<string, TypingEntry>();

function makeKey(chatId: string, userId: string) {
  return `${chatId}:${userId}`;
}

function cleanupExpired() {
  const now = Date.now();

  typingMap.forEach((entry, key) => {
    if (now - entry.updatedAt > TYPING_TTL) {
      typingMap.delete(key);
    }
  });
}

export const typingService = {
  setTyping(chatId: string, userId: string, isTyping: boolean) {
    cleanupExpired();

    const key = makeKey(chatId, userId);

    if (!isTyping) {
      typingMap.delete(key);
    } else {
      typingMap.set(key, {
        chatId,
        userId,
        isTyping: true,
        updatedAt: Date.now(),
      });
    }

    chatRealtimeAdapter.publish({
      type: "typing:update",
      chatId,
      userId,
      isTyping,
      occurredAt: Date.now(),
    });
  },

  isTyping(chatId: string, userId: string) {
    cleanupExpired();
    return typingMap.has(makeKey(chatId, userId));
  },

  getTypingUsers(chatId: string) {
    cleanupExpired();

    return Array.from(typingMap.values())
      .filter((entry) => entry.chatId === chatId && entry.isTyping)
      .map((entry) => entry.userId);
  },

  clearChat(chatId: string) {
    Array.from(typingMap.keys()).forEach((key) => {
      if (key.startsWith(`${chatId}:`)) {
        typingMap.delete(key);
      }
    });
  },
};
