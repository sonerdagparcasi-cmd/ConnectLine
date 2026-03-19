// src/domains/social/services/socialEventChatService.ts
// 🔒 SOCIAL EVENT CHAT SERVICE (UI-ONLY)

export type SocialEventChatMessage = {
  id: string;
  eventId: string;

  userId: string;
  username: string;

  text: string;

  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* MOCK USER                                                          */
/* ------------------------------------------------------------------ */

const CURRENT_USER = {
  userId: "u1",
  username: "Ben",
};

/* ------------------------------------------------------------------ */
/* STORAGE                                                            */
/* ------------------------------------------------------------------ */

let chatStorage: Record<string, SocialEventChatMessage[]> = {};

let listeners: Record<string, Array<() => void>> = {};

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const socialEventChatService = {
  /* --------------------------------------------------------------- */
  /* GET MESSAGES                                                    */
  /* --------------------------------------------------------------- */

  async getMessages(eventId: string): Promise<SocialEventChatMessage[]> {
    return chatStorage[eventId] ?? [];
  },

  /* --------------------------------------------------------------- */
  /* SEND MESSAGE                                                    */
  /* --------------------------------------------------------------- */

  async sendMessage(eventId: string, text: string) {
    if (!text.trim()) return;

    const message: SocialEventChatMessage = {
      id: `msg_${Date.now()}`,
      eventId,

      userId: CURRENT_USER.userId,
      username: CURRENT_USER.username,

      text,

      createdAt: new Date().toISOString(),
    };

    if (!chatStorage[eventId]) {
      chatStorage[eventId] = [];
    }

    chatStorage[eventId].push(message);

    emit(eventId);
  },

  /* --------------------------------------------------------------- */
  /* SUBSCRIBE                                                       */
  /* --------------------------------------------------------------- */

  subscribe(eventId: string, listener: () => void) {
    if (!listeners[eventId]) {
      listeners[eventId] = [];
    }

    listeners[eventId].push(listener);

    return () => {
      listeners[eventId] = listeners[eventId].filter((l) => l !== listener);
    };
  },
};

/* ------------------------------------------------------------------ */
/* INTERNAL                                                           */
/* ------------------------------------------------------------------ */

function emit(eventId: string) {
  if (!listeners[eventId]) return;

  listeners[eventId].forEach((l) => l());
}