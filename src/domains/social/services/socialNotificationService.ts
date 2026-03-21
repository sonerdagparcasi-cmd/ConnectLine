// src/domains/social/services/socialNotificationService.ts
// 🔒 SOCIAL NOTIFICATION SERVICE – UI ONLY STORE
// UPDATED:
// - push-ready architecture
// - unread counter
// - duplicate guard
// - notification queue
// - realtime subscriptions

import type { SocialNotification } from "../types/social.types";

/* ------------------------------------------------------------------ */
/* STORE                                                              */
/* ------------------------------------------------------------------ */

let NOTIFICATIONS: SocialNotification[] = [];

/* ------------------------------------------------------------------ */
/* LISTENERS                                                          */
/* ------------------------------------------------------------------ */

let listeners: Array<() => void> = [];

/* ------------------------------------------------------------------ */
/* CONFIG                                                             */
/* ------------------------------------------------------------------ */

const MAX_NOTIFICATIONS = 200;

/* ------------------------------------------------------------------ */
/* GET                                                                */
/* ------------------------------------------------------------------ */

export function getNotifications(): SocialNotification[] {
  return [...NOTIFICATIONS].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

/* ------------------------------------------------------------------ */
/* GET UNREAD COUNT                                                   */
/* ------------------------------------------------------------------ */

export function getUnreadNotificationCount(): number {
  return NOTIFICATIONS.filter((n) => !n.read).length;
}

/* ------------------------------------------------------------------ */
/* ADD                                                                */
/* ------------------------------------------------------------------ */

export function addNotification(notification: SocialNotification) {
  if (!notification?.id) return;

  const exists = NOTIFICATIONS.some((n) => n.id === notification.id);

  if (exists) return;

  NOTIFICATIONS = [notification, ...NOTIFICATIONS];

  if (NOTIFICATIONS.length > MAX_NOTIFICATIONS) {
    NOTIFICATIONS = NOTIFICATIONS.slice(0, MAX_NOTIFICATIONS);
  }

  emit();
}

/* ------------------------------------------------------------------ */
/* BULK ADD (QUEUE)                                                   */
/* ------------------------------------------------------------------ */

export function addNotifications(list: SocialNotification[]) {
  if (!Array.isArray(list) || list.length === 0) return;

  const existingIds = new Set(NOTIFICATIONS.map((n) => n.id));

  const next = list.filter((n) => !existingIds.has(n.id));

  if (next.length === 0) return;

  NOTIFICATIONS = [...next, ...NOTIFICATIONS];

  if (NOTIFICATIONS.length > MAX_NOTIFICATIONS) {
    NOTIFICATIONS = NOTIFICATIONS.slice(0, MAX_NOTIFICATIONS);
  }

  emit();
}

/* ------------------------------------------------------------------ */
/* MARK READ                                                          */
/* ------------------------------------------------------------------ */

export function markNotificationRead(notificationId: string) {
  let changed = false;

  NOTIFICATIONS = NOTIFICATIONS.map((n) => {
    if (n.id === notificationId && !n.read) {
      changed = true;
      return { ...n, read: true };
    }

    return n;
  });

  if (changed) emit();
}

/* ------------------------------------------------------------------ */
/* MARK ALL READ                                                      */
/* ------------------------------------------------------------------ */

export function markAllNotificationsRead() {
  let changed = false;

  NOTIFICATIONS = NOTIFICATIONS.map((n) => {
    if (!n.read) {
      changed = true;
      return { ...n, read: true };
    }

    return n;
  });

  if (changed) emit();
}

/* ------------------------------------------------------------------ */
/* REMOVE                                                             */
/* ------------------------------------------------------------------ */

export function removeNotification(notificationId: string) {
  const next = NOTIFICATIONS.filter((n) => n.id !== notificationId);

  if (next.length === NOTIFICATIONS.length) return;

  NOTIFICATIONS = next;

  emit();
}

/* ------------------------------------------------------------------ */
/* CLEAR                                                              */
/* ------------------------------------------------------------------ */

export function clearNotifications() {
  if (NOTIFICATIONS.length === 0) return;

  NOTIFICATIONS = [];

  emit();
}

/* ------------------------------------------------------------------ */
/* SUBSCRIBE                                                          */
/* ------------------------------------------------------------------ */

export function subscribeNotifications(listener: () => void) {
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/* ------------------------------------------------------------------ */
/* NAVIGATION (UI: navigate callback ile çağır)                        */
/* ------------------------------------------------------------------ */

/**
 * Bildirim tipine göre hedef ekranı aç.
 * @returns true ise eşleşen rota işlendi; çağıran başka yönlendirme yapmasın.
 */
export function applySocialNotificationNavigation(
  notification: SocialNotification,
  navigate: (screen: string, params?: Record<string, unknown>) => void
): boolean {
  if (notification.type === "follow_request") {
    navigate("SocialFollowRequests");
    return true;
  }

  return false;
}

/* ------------------------------------------------------------------ */
/* INTERNAL                                                           */
/* ------------------------------------------------------------------ */

function emit() {
  listeners.forEach((l) => l());
}