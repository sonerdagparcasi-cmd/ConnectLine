// src/domains/social/services/socialNotificationService.ts
// 🔒 SOCIAL NOTIFICATION SERVICE – UI ONLY STORE
// UPDATED:
// - push-ready architecture
// - unread counter
// - duplicate guard
// - notification queue
// - realtime subscriptions

import type { SocialNotification } from "../types/social.types";
import { subscribeEvents, type SocialEvent } from "./socialFeedStateService";
import { socialMessageService } from "./socialMessageService";

/* ------------------------------------------------------------------ */
/* STORE                                                              */
/* ------------------------------------------------------------------ */

let NOTIFICATIONS: SocialNotification[] = [];
const RECENT_DEDUPE = new Map<string, number>();

/* ------------------------------------------------------------------ */
/* LISTENERS                                                          */
/* ------------------------------------------------------------------ */

let listeners: Array<() => void> = [];
let unreadListeners: Array<(count: number) => void> = [];

/* ------------------------------------------------------------------ */
/* CONFIG                                                             */
/* ------------------------------------------------------------------ */

const MAX_NOTIFICATIONS = 200;
const DEDUPE_WINDOW_MS = 2500;

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

export const socialNotificationService = {
  getAll() {
    return getNotifications();
  },

  push(notification: {
    type: string;
    userId?: string;
    targetId?: string;
    storyId?: string;
    postId?: string;
    message?: string;
  }) {
    const item: SocialNotification = {
      id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: (notification.type as SocialNotification["type"]) ?? "like",
      actorUserId: notification.userId ?? "u1",
      actorUsername: notification.userId ?? "u1",
      actorAvatarUri: null,
      targetUserId: notification.targetId ?? "u1",
      storyId: notification.storyId,
      postId: notification.postId,
      targetPostId: notification.postId,
      text: notification.message ?? "",
      createdAt: new Date().toISOString(),
      read: false,
    };

    addNotification(item);

    // 🔥 SYNC
    syncToInbox(item);
  },

  markAsRead(id: string) {
    markNotificationRead(id);
  },

  markAllAsRead() {
    markAllNotificationsRead();
  },
};

/* ------------------------------------------------------------------ */
/* GET UNREAD COUNT                                                   */
/* ------------------------------------------------------------------ */

export function getUnreadNotificationCount(): number {
  return NOTIFICATIONS.filter((n) => !n.read).length;
}

/** Alias (FAZ 5 / ADIM 4 API) */
export function getUnreadCount(): number {
  return getUnreadNotificationCount();
}

function notificationDedupeKey(notification: SocialNotification): string {
  return [
    notification.type,
    notification.actorUserId,
    notification.targetUserId,
    notification.targetPostId ?? notification.postId ?? "",
    notification.storyId ?? "",
    notification.eventId ?? "",
    notification.text,
  ].join("|");
}

function cleanupOldDedupeEntries(now: number): void {
  RECENT_DEDUPE.forEach((ts, key) => {
    if (now - ts > DEDUPE_WINDOW_MS) {
      RECENT_DEDUPE.delete(key);
    }
  });
}

function shouldDedupe(notification: SocialNotification): boolean {
  const now = Date.now();
  cleanupOldDedupeEntries(now);
  const key = notificationDedupeKey(notification);
  const last = RECENT_DEDUPE.get(key);
  if (typeof last === "number" && now - last <= DEDUPE_WINDOW_MS) {
    return true;
  }
  RECENT_DEDUPE.set(key, now);
  return false;
}

/* ------------------------------------------------------------------ */
/* ADD                                                                */
/* ------------------------------------------------------------------ */

export function addNotification(notification: SocialNotification) {
  if (!notification?.id) return;
  if (!notification.targetUserId) return;
  if (notification.actorUserId === notification.targetUserId) return;
  if (shouldDedupe(notification)) return;

  const exists = NOTIFICATIONS.some((n) => n.id === notification.id);

  if (exists) return;

  NOTIFICATIONS = [notification, ...NOTIFICATIONS];

  if (NOTIFICATIONS.length > MAX_NOTIFICATIONS) {
    NOTIFICATIONS = NOTIFICATIONS.slice(0, MAX_NOTIFICATIONS);
  }

  notify();
}

/* ------------------------------------------------------------------ */
/* BULK ADD (QUEUE)                                                   */
/* ------------------------------------------------------------------ */

export function addNotifications(list: SocialNotification[]) {
  if (!Array.isArray(list) || list.length === 0) return;

  const existingIds = new Set(NOTIFICATIONS.map((n) => n.id));

  const next = list.filter((n) => {
    if (!n?.id) return false;
    if (!n.targetUserId) return false;
    if (n.actorUserId === n.targetUserId) return false;
    if (existingIds.has(n.id)) return false;
    if (shouldDedupe(n)) return false;
    return true;
  });

  if (next.length === 0) return;

  NOTIFICATIONS = [...next, ...NOTIFICATIONS];

  if (NOTIFICATIONS.length > MAX_NOTIFICATIONS) {
    NOTIFICATIONS = NOTIFICATIONS.slice(0, MAX_NOTIFICATIONS);
  }

  notify();
}

/* ------------------------------------------------------------------ */
/* FAZ 5 — TETİKLEYİCİLER (like / comment / follow)                    */
/* Zorunlu anlam alanları: type, actorUserId, text, createdAt (+ id, read, hedef) */
/* ------------------------------------------------------------------ */

function nextNotificationId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function safeNotify(input: Omit<SocialNotification, "id" | "createdAt" | "read">) {
  addNotification({
    ...input,
    id: nextNotificationId(input.type),
    createdAt: new Date().toISOString(),
    read: false,
  });
}

function buildNotificationFromEvent(event: SocialEvent): SocialNotification | null {
  // Direct push path is used for LIKE / COMMENT / FOLLOW to avoid duplicates.
  if (
    event.type === "LIKE" ||
    event.type === "COMMENT" ||
    event.type === "FOLLOW" ||
    event.type === "STORY_REPLY"
  ) {
    return null;
  }
  if (event.type === "LIKE") {
    if (!event.targetUserId || !event.postId) return null;
    return {
      id: nextNotificationId("like"),
      type: "like",
      actorUserId: event.userId,
      actorUsername: event.actorUsername ?? event.userId,
      actorAvatarUri: null,
      targetUserId: event.targetUserId,
      postId: event.postId,
      targetPostId: event.postId,
      text: "paylasimini begendi",
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  if (event.type === "COMMENT") {
    if (!event.targetUserId || !event.postId) return null;
    const trimmed = (event.commentText ?? "").trim();
    const snippet = trimmed.slice(0, 72);
    const ell = trimmed.length > 72 ? "..." : "";
    return {
      id: nextNotificationId("comment"),
      type: "comment",
      actorUserId: event.userId,
      actorUsername: event.actorUsername ?? event.userId,
      actorAvatarUri: null,
      targetUserId: event.targetUserId,
      postId: event.postId,
      targetPostId: event.postId,
      text: snippet ? `yorum yapti: "${snippet}${ell}"` : "yorum yapti",
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  if (event.type === "FOLLOW") {
    return {
      id: nextNotificationId("follow"),
      type: "follow",
      actorUserId: event.userId,
      actorUsername: event.actorUsername ?? event.userId,
      actorAvatarUri: null,
      targetUserId: event.targetUserId,
      text: "seni takip etti",
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  if (event.type === "FOLLOW_REQUEST") {
    return {
      id: nextNotificationId("follow_request"),
      type: "follow_request",
      actorUserId: event.userId,
      actorUsername: event.actorUsername ?? event.userId,
      actorAvatarUri: null,
      targetUserId: event.targetUserId,
      text: "sana takip istegi gonderdi",
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  if (event.type === "STORY_REPLY") {
    if (!event.targetUserId) return null;
    return {
      id: nextNotificationId("story_reply"),
      type: "story_reply",
      actorUserId: event.userId,
      actorUsername: event.actorUsername ?? event.userId,
      actorAvatarUri: null,
      targetUserId: event.targetUserId,
      storyId: event.storyId,
      text: "hikayene yanit verdi",
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  if (event.type === "STORY_REACTION") {
    if (!event.targetUserId) return null;
    return {
      id: nextNotificationId("story_reaction"),
      type: "story_reaction",
      actorUserId: event.userId,
      actorUsername: event.actorUsername ?? event.userId,
      actorAvatarUri: null,
      targetUserId: event.targetUserId,
      storyId: event.storyId,
      text: `${event.reaction ?? ""} ile hikayene tepki verdi`,
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  if (event.type === "EVENT_INVITE") {
    if (!event.targetUserId) return null;
    return {
      id: nextNotificationId("event_invite"),
      type: "event_invite",
      actorUserId: event.userId,
      actorUsername: event.actorUsername ?? event.userId,
      actorAvatarUri: null,
      targetUserId: event.targetUserId,
      eventId: event.eventId,
      text: `${event.eventTitle ?? "etkinlik"} etkinligine davet etti`,
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
  return null;
}

/** Beğeni — gönderi sahibine (kendi gönderini beğenmez) */
export function notifyPostLiked(input: {
  actorUserId: string;
  actorUsername: string;
  actorAvatarUri?: string | null;
  postOwnerUserId: string;
  postId: string;
}) {
  if (input.actorUserId === input.postOwnerUserId) return;

  safeNotify({
    type: "like",
    actorUserId: input.actorUserId,
    actorUsername: input.actorUsername,
    actorAvatarUri: input.actorAvatarUri ?? null,
    targetUserId: input.postOwnerUserId,
    postId: input.postId,
    targetPostId: input.postId,
    text: "paylaşımını beğendi",
  });
}

/** Yorum — gönderi sahibine (kendi gönderine yorumda bildirim yok) */
export function notifyPostCommented(input: {
  actorUserId: string;
  actorUsername: string;
  actorAvatarUri?: string | null;
  postOwnerUserId: string;
  postId: string;
  commentText: string;
}) {
  if (input.actorUserId === input.postOwnerUserId) return;

  const snippet = input.commentText.trim().slice(0, 72);
  const ell = input.commentText.trim().length > 72 ? "…" : "";

  safeNotify({
    type: "comment",
    actorUserId: input.actorUserId,
    actorUsername: input.actorUsername,
    actorAvatarUri: input.actorAvatarUri ?? null,
    targetUserId: input.postOwnerUserId,
    postId: input.postId,
    targetPostId: input.postId,
    text: snippet ? `yorum yaptı: "${snippet}${ell}"` : "yorum yaptı",
  });
}

/** Doğrudan takip (followUser) */
export function notifyFollowDirect(input: {
  actorUserId: string;
  actorUsername: string;
  actorAvatarUri?: string | null;
  targetUserId: string;
}) {
  if (input.actorUserId === input.targetUserId) return;

  safeNotify({
    type: "follow",
    actorUserId: input.actorUserId,
    actorUsername: input.actorUsername,
    actorAvatarUri: input.actorAvatarUri ?? null,
    targetUserId: input.targetUserId,
    text: "seni takip etti",
  });
}

/** Takip isteği (sendFollowRequest) */
export function notifyFollowRequestReceived(input: {
  actorUserId: string;
  actorUsername: string;
  actorAvatarUri?: string | null;
  targetUserId: string;
}) {
  if (input.actorUserId === input.targetUserId) return;

  safeNotify({
    type: "follow_request",
    actorUserId: input.actorUserId,
    actorUsername: input.actorUsername,
    actorAvatarUri: input.actorAvatarUri ?? null,
    targetUserId: input.targetUserId,
    text: "sana takip isteği gönderdi",
  });
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

  if (changed) notify();
}

export function markRead(notificationId: string) {
  markNotificationRead(notificationId);
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

  if (changed) notify();
}

export function markAllRead() {
  markAllNotificationsRead();
}

/* ------------------------------------------------------------------ */
/* REMOVE                                                             */
/* ------------------------------------------------------------------ */

export function removeNotification(notificationId: string) {
  const next = NOTIFICATIONS.filter((n) => n.id !== notificationId);

  if (next.length === NOTIFICATIONS.length) return;

  NOTIFICATIONS = next;

  notify();
}

/* ------------------------------------------------------------------ */
/* CLEAR                                                              */
/* ------------------------------------------------------------------ */

export function clearNotifications() {
  if (NOTIFICATIONS.length === 0) return;

  NOTIFICATIONS = [];

  notify();
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

export function subscribeUnreadCount(listener: (count: number) => void) {
  if (!unreadListeners.includes(listener)) {
    unreadListeners.push(listener);
  }
  listener(getUnreadNotificationCount());

  return () => {
    unreadListeners = unreadListeners.filter((l) => l !== listener);
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

  if (notification.type === "follow") {
    navigate("SocialProfileContainer", { userId: notification.actorUserId });
    return true;
  }

  return false;
}

/* ------------------------------------------------------------------ */
/* INTERNAL                                                           */
/* ------------------------------------------------------------------ */

function notify() {
  listeners.forEach((l) => l());
  const unread = getUnreadNotificationCount();
  unreadListeners.forEach((l) => l(unread));
}

subscribeEvents((event) => {
  const notification = buildNotificationFromEvent(event);
  if (!notification) return;
  addNotification(notification);
});

function syncToInbox(notification: {
  id?: string;
  type: string;
  userId?: string;
  actorUserId?: string;
  storyId?: string;
  message?: string;
  text?: string;
  emoji?: string;
}) {
  const userId = notification.userId ?? notification.actorUserId;

  if (notification.type === "story_emoji") {
    socialMessageService.pushMessage({
      id: notification.id,
      type: "message",
      userId,
      text: `❤️ ${notification.emoji || ""}`.trim(),
      storyId: notification.storyId,
    } as any);
    return;
  }

  if (notification.type === "story_reply") {
    socialMessageService.pushMessage({
      id: notification.id,
      type: "message",
      userId,
      text: notification.message ?? notification.text ?? "",
      storyId: notification.storyId,
    } as any);
    return;
  }

  if (notification.type === "message") {
    socialMessageService.pushMessage({
      id: notification.id,
      type: "message",
      userId,
      text: notification.message ?? notification.text ?? "",
      storyId: notification.storyId,
    } as any);
  }
}