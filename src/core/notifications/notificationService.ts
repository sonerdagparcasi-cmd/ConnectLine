// src/core/notifications/notificationService.ts
// 🔒 CONNECTLINE NOTIFICATION CENTER – CORE SERVICE

export type NotificationDomain =
  | "chat"
  | "corporate"
  | "social"
  | "store";

export type AppNotification = {
  id: string;
  domain: NotificationDomain;

  title: string;
  body: string;

  createdAt: number;

  read: boolean;

  payload?: Record<string, any>;
};

/* ------------------------------------------------------------------ */
/* MOCK STORAGE                                                       */
/* ------------------------------------------------------------------ */

let NOTIFICATIONS: AppNotification[] = [];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return "nt_" + Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const notificationService = {

  /* CREATE */

  async push(input: {
    domain: NotificationDomain;
    title: string;
    body: string;
    payload?: Record<string, any>;
  }): Promise<AppNotification> {

    const n: AppNotification = {
      id: generateId(),

      domain: input.domain,

      title: input.title,
      body: input.body,

      payload: input.payload,

      createdAt: Date.now(),

      read: false,
    };

    NOTIFICATIONS = [n, ...NOTIFICATIONS];

    return n;
  },

  /* LIST */

  async getAll(): Promise<AppNotification[]> {
    return [...NOTIFICATIONS];
  },

  /* DOMAIN LIST */

  async getByDomain(
    domain: NotificationDomain
  ): Promise<AppNotification[]> {
    return NOTIFICATIONS.filter(
      (n) => n.domain === domain
    );
  },

  /* UNREAD COUNT */

  async getUnreadCount(
    domain?: NotificationDomain
  ): Promise<number> {

    if (!domain) {
      return NOTIFICATIONS.filter((n) => !n.read).length;
    }

    return NOTIFICATIONS.filter(
      (n) => !n.read && n.domain === domain
    ).length;
  },

  /* MARK READ */

  async markRead(id: string) {

    const i = NOTIFICATIONS.findIndex(
      (n) => n.id === id
    );

    if (i === -1) return;

    NOTIFICATIONS[i] = {
      ...NOTIFICATIONS[i],
      read: true,
    };
  },

  /* MARK ALL READ */

  async markAllRead(domain?: NotificationDomain) {

    NOTIFICATIONS = NOTIFICATIONS.map((n) => {

      if (!domain) {
        return { ...n, read: true };
      }

      if (n.domain === domain) {
        return { ...n, read: true };
      }

      return n;

    });
  },

  /* DELETE */

  async remove(id: string) {

    NOTIFICATIONS = NOTIFICATIONS.filter(
      (n) => n.id !== id
    );

  },

};