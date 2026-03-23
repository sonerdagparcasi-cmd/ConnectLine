// src/domains/corporate/services/corporateNotificationService.ts
// 🔒 Kurumsal bildirim motoru — social ile tamamen ayrı

import type { CorporateEvent } from "./corporateFeedStateService";
import { subscribeCorporateEvents } from "./corporateFeedStateService";
import { t } from "../../../shared/i18n/t";
import {
  getCorporateActorUserId,
  getCorporateManagedCompanyId,
  shouldSuppressCorporateSelfNotification,
} from "./corporateViewerIdentity";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type CorporateNotificationKind =
  | "like"
  | "comment"
  | "follow_company"
  | "mention"
  | "announcement_reaction"
  | "hiring_interest";

export type CorporateNotification = {
  id: string;
  type: CorporateNotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  dedupeKey: string;
  postId?: string;
  actorUserId: string;
  targetCompanyId: string;
  targetUserId?: string;
};

/* ------------------------------------------------------------------ */
/* STATE                                                              */
/* ------------------------------------------------------------------ */

let notifications: CorporateNotification[] = [];
const listListeners = new Set<() => void>();
const unreadListeners = new Set<(count: number) => void>();

/** kısa süreli spam dedupe: key -> son üretim zamanı (ms) */
const dedupeRecent = new Map<string, number>();
const DEDUPE_WINDOW_MS = 4500;

let eventBridgeStarted = false;

function genId() {
  return `cn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function recomputeUnread(): number {
  return notifications.filter((n) => !n.read).length;
}

function notifyLists() {
  listListeners.forEach((l) => l());
}

function notifyUnread() {
  const c = deriveUnreadForCurrentSession();
  unreadListeners.forEach((l) => l(c));
}

/**
 * Badge: yalnızca oturumun yönettiği şirkete gelen okunmamışlar.
 * Yönetilen şirket yoksa 0 (ziyaretçi).
 */
function deriveUnreadForCurrentSession(): number {
  const managed = getCorporateManagedCompanyId();
  if (!managed) return 0;
  return notifications.filter(
    (n) => !n.read && n.targetCompanyId === managed
  ).length;
}

/* ------------------------------------------------------------------ */
/* DEDUPE / SAFE NOTIFY                                               */
/* ------------------------------------------------------------------ */

export function dedupeNotification(dedupeKey: string): boolean {
  const now = Date.now();
  const prev = dedupeRecent.get(dedupeKey);
  if (prev !== undefined && now - prev < DEDUPE_WINDOW_MS) {
    return true;
  }
  dedupeRecent.set(dedupeKey, now);
  return false;
}

export type SafeNotifyInput = {
  type: CorporateNotificationKind;
  actorUserId: string;
  targetCompanyId: string;
  targetUserId?: string;
  postId?: string;
  title: string;
  body: string;
};

/**
 * @returns false ise bildirim eklenmedi (validasyon / self / dedupe)
 */
export function safeNotify(input: SafeNotifyInput): boolean {
  const actor = input.actorUserId?.trim();
  const targetCo = input.targetCompanyId?.trim();
  if (!actor || !targetCo) return false;

  if (shouldSuppressCorporateSelfNotification(targetCo)) {
    return false;
  }

  const dedupeKey = buildDedupeKey(input.type, actor, targetCo, input.postId);
  if (dedupeNotification(dedupeKey)) {
    return false;
  }

  const n: CorporateNotification = {
    id: genId(),
    type: input.type,
    title: input.title,
    body: input.body,
    createdAt: Date.now(),
    read: false,
    dedupeKey,
    postId: input.postId,
    actorUserId: actor,
    targetCompanyId: targetCo,
    targetUserId: input.targetUserId?.trim() || undefined,
  };

  notifications = [n, ...notifications];
  notifyLists();
  notifyUnread();
  return true;
}

export function buildDedupeKey(
  type: CorporateNotificationKind,
  actorId: string,
  targetCompanyId: string,
  postId?: string
): string {
  return `${type}:${actorId}:${targetCompanyId}:${postId ?? "_"}`;
}

export function addCorporateNotification(
  input: Omit<CorporateNotification, "id" | "createdAt" | "read" | "dedupeKey"> & {
    dedupeKey: string;
  }
): CorporateNotification | null {
  if (dedupeNotification(input.dedupeKey)) {
    return notifications.find((n) => n.dedupeKey === input.dedupeKey) ?? null;
  }
  const n: CorporateNotification = {
    ...input,
    id: genId(),
    createdAt: Date.now(),
    read: false,
  };
  notifications = [n, ...notifications];
  notifyLists();
  notifyUnread();
  return n;
}

/* ------------------------------------------------------------------ */
/* QUERIES + SUBSCRIPTIONS                                            */
/* ------------------------------------------------------------------ */

export function getCorporateNotifications(): CorporateNotification[] {
  return [...notifications];
}

export function getCorporateUnreadCount(): number {
  return deriveUnreadForCurrentSession();
}

export function subscribeCorporateNotifications(listener: () => void) {
  ensureCorporateEventBridge();
  listListeners.add(listener);
  return () => {
    listListeners.delete(listener);
  };
}

export function subscribeCorporateUnreadCount(listener: (count: number) => void) {
  ensureCorporateEventBridge();
  unreadListeners.add(listener);
  listener(getCorporateUnreadCount());
  return () => {
    unreadListeners.delete(listener);
  };
}

export function markCorporateNotificationRead(id: string) {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  notifyLists();
  notifyUnread();
}

export function markAllCorporateNotificationsRead() {
  const managed = getCorporateManagedCompanyId();
  notifications = notifications.map((n) => {
    if (!managed) return { ...n, read: true };
    return n.targetCompanyId === managed ? { ...n, read: true } : n;
  });
  notifyLists();
  notifyUnread();
}

/** Yönetilen şirket değişince badge yeniden hesaplanır */
export function refreshCorporateUnreadSubscribers() {
  notifyUnread();
}

/* ------------------------------------------------------------------ */
/* EVENT BRIDGE                                                       */
/* ------------------------------------------------------------------ */

function mapEventToNotifications(event: CorporateEvent) {
  if (event.type === "LIKE") {
    if (!event.likeAdded) return;
    const actor = event.actorUserId?.trim();
    const target = event.targetCompanyId?.trim();
    if (!actor || !target || !event.postId) return;

    safeNotify({
      type: "like",
      actorUserId: actor,
      targetCompanyId: target,
      postId: event.postId,
      title: t("corporate.notification.like.title"),
      body: t("corporate.notification.like.body"),
    });
    return;
  }

  if (event.type === "COMMENT") {
    const actor = event.actorUserId?.trim();
    const target = event.targetCompanyId?.trim();
    if (!actor || !target || !event.postId) return;

    safeNotify({
      type: "comment",
      actorUserId: actor,
      targetCompanyId: target,
      postId: event.postId,
      title: t("corporate.notification.comment.title"),
      body: t("corporate.notification.comment.body"),
    });
    return;
  }

  if (event.type === "FOLLOW_COMPANY") {
    const actor = event.actorUserId?.trim();
    const target = event.targetCompanyId?.trim();
    if (!actor || !target) return;

    safeNotify({
      type: "follow_company",
      actorUserId: actor,
      targetCompanyId: target,
      title: t("corporate.notification.follow.title"),
      body: t("corporate.notification.follow.body"),
    });
  }
}

function ensureCorporateEventBridge() {
  if (eventBridgeStarted) return;
  eventBridgeStarted = true;
  subscribeCorporateEvents((e) => {
    try {
      mapEventToNotifications(e);
    } catch {
      /* production: log */
    }
  });
}
