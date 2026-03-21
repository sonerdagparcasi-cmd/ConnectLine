// src/domains/social/services/socialFollowService.ts
// 🔒 SOCIAL FOLLOW SERVICE – GRAPH ENGINE (UI-ONLY)

import { socialProfileStore } from "../state/socialProfileStore";
import { MOCK_POSTS } from "./socialMockData";
import {
  notifyFollowDirect,
  notifyFollowRequestReceived,
} from "./socialNotificationService";

/* ------------------------------------------------------------------ */
/* CURRENT USER                                                       */
/* ------------------------------------------------------------------ */

const CURRENT_USER_ID = "u1";

/** Aktif sosyal kullanıcı (mock); gönderi sahipliği / düzenleme kontrolü */
export function getCurrentSocialUserId(): string {
  return CURRENT_USER_ID;
}

/* ------------------------------------------------------------------ */
/* FOLLOW GRAPH                                                       */
/* ------------------------------------------------------------------ */

let FOLLOWING: Record<string, boolean> = {
  u2: true,
};

let BLOCKED: Set<string> = new Set();
let MUTED: Set<string> = new Set();

let listeners: Array<() => void> = [];

/* ------------------------------------------------------------------ */
/* FOLLOW REQUESTS                                                    */
/* ------------------------------------------------------------------ */

export type FollowRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
};

let FOLLOW_REQUESTS: FollowRequest[] = [];

function resolveSocialUserId(userId: string) {
  return userId === "me" ? CURRENT_USER_ID : userId;
}

/* ------------------------------------------------------------------ */
/* USERS                                                              */
/* ------------------------------------------------------------------ */

function getAllUsers() {
  const map: Record<string, { userId: string; username: string }> = {};

  MOCK_POSTS.forEach((p) => {
    map[p.userId] = {
      userId: p.userId,
      username: p.username,
    };
  });

  return Object.values(map);
}

/** Bildirim / feed için görünen kullanıcı adı (mock kullanıcı listesi) */
export function getSocialDisplayName(userId: string): string {
  const id = resolveSocialUserId(userId);
  const u = getAllUsers().find((x) => x.userId === id);
  return u?.username ?? id;
}

/* ------------------------------------------------------------------ */
/* FOLLOW ACTIONS                                                     */
/* ------------------------------------------------------------------ */

export function followUser(userId: string) {
  if (userId === CURRENT_USER_ID) return;

  const wasFollowing = !!FOLLOWING[userId];

  FOLLOWING = {
    ...FOLLOWING,
    [userId]: true,
  };

  socialProfileStore.setFollowingCount(getFollowingCount());
  emit();

  if (!wasFollowing) {
    notifyFollowDirect({
      actorUserId: CURRENT_USER_ID,
      actorUsername: getSocialDisplayName(CURRENT_USER_ID),
      targetUserId: userId,
    });
  }
}

export function unfollowUser(userId: string) {
  const next = { ...FOLLOWING };

  delete next[userId];

  FOLLOWING = next;

  socialProfileStore.setFollowingCount(getFollowingCount());
  emit();
}

export function toggleFollow(userId: string) {
  if (isFollowing(userId)) {
    unfollowUser(userId);
  } else {
    followUser(userId);
  }
}

export function sendFollowRequest(fromUserId: string, toUserId: string) {
  const fromId = resolveSocialUserId(fromUserId);
  const toId = resolveSocialUserId(toUserId);
  if (fromId === toId) return;

  FOLLOW_REQUESTS.push({
    id: `req_${Date.now()}`,
    fromUserId: fromId,
    toUserId: toId,
    createdAt: new Date().toISOString(),
  });

  notifyFollowRequestReceived({
    actorUserId: fromId,
    actorUsername: getSocialDisplayName(fromId),
    targetUserId: toId,
  });

  emit();
}

export function getFollowRequests(userId: string) {
  const uid = resolveSocialUserId(userId);
  return FOLLOW_REQUESTS.filter((r) => r.toUserId === uid);
}

/**
 * İsteği kabul et: istek gönderen (fromUserId) hedefi (toUserId) takip eder.
 * Mock’ta FOLLOWING sadece CURRENT_USER_ID için tutulduğundan, ilişki
 * yalnızca fromUserId === CURRENT_USER_ID iken followUser ile kurulur.
 */
export function acceptFollowRequest(id: string) {
  const req = FOLLOW_REQUESTS.find((r) => r.id === id);
  if (!req) return;

  if (req.fromUserId === CURRENT_USER_ID) {
    followUser(req.toUserId);
  }

  FOLLOW_REQUESTS = FOLLOW_REQUESTS.filter((r) => r.id !== id);
  emit();
}

export function rejectFollowRequest(id: string) {
  FOLLOW_REQUESTS = FOLLOW_REQUESTS.filter((r) => r.id !== id);
  emit();
}

/* ------------------------------------------------------------------ */
/* GETTERS                                                            */
/* ------------------------------------------------------------------ */

export function isFollowing(userId: string): boolean {
  return !!FOLLOWING[userId];
}

export function getFollowingIds(): string[] {
  return Object.keys(FOLLOWING);
}

export function getFollowingUsers() {
  const users = getAllUsers();

  return users.filter((u) => FOLLOWING[u.userId]);
}

/* ------------------------------------------------------------------ */
/* FOLLOWERS                                                          */
/* ------------------------------------------------------------------ */

export function getFollowers(userId?: string) {
  const users = getAllUsers();

  if (!userId) {
    userId = CURRENT_USER_ID;
  }

  return users.filter((u) => {
    if (u.userId === CURRENT_USER_ID) return false;

    if (FOLLOWING[u.userId] && u.userId !== userId) {
      return true;
    }

    return false;
  });
}

/* ------------------------------------------------------------------ */
/* MUTUAL CONNECTIONS                                                 */
/* ------------------------------------------------------------------ */

/** Ortak bağlantı kullanıcıları (liste ekranı); sayı ile aynı mantık */
export function getMutualConnectionUsers(userId: string) {
  const myFollowing = getFollowingIds();

  const otherFollowing: string[] = [];

  if (FOLLOWING[userId]) {
    otherFollowing.push(userId);
  }

  const mutualIds = myFollowing.filter((id) => otherFollowing.includes(id));
  const byId = Object.fromEntries(getAllUsers().map((u) => [u.userId, u]));

  return mutualIds.map((id) => byId[id]).filter(Boolean) as {
    userId: string;
    username: string;
  }[];
}

export function getMutualConnections(userId: string): number {
  return getMutualConnectionUsers(userId).length;
}

/* ------------------------------------------------------------------ */
/* SUGGESTED USERS                                                    */
/* ------------------------------------------------------------------ */

export function getSuggestedUsers(limit = 5) {
  const users = getAllUsers();

  return users
    .filter((u) => u.userId !== CURRENT_USER_ID)
    .filter((u) => !FOLLOWING[u.userId])
    .filter((u) => !BLOCKED.has(u.userId))
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* BLOCK / UNBLOCK                                                    */
/* ------------------------------------------------------------------ */

export function blockUser(userId: string): void {
  if (userId === CURRENT_USER_ID) return;
  BLOCKED.add(userId);
  const next = { ...FOLLOWING };
  delete next[userId];
  FOLLOWING = next;
  socialProfileStore.setFollowingCount(getFollowingCount());
  emit();
}

export function unblockUser(userId: string): void {
  BLOCKED.delete(userId);
  emit();
}

export function isBlocked(userId: string): boolean {
  return BLOCKED.has(userId);
}

export function getBlockedIds(): string[] {
  return Array.from(BLOCKED);
}

/* ------------------------------------------------------------------ */
/* MUTE                                                               */
/* ------------------------------------------------------------------ */

export function muteUser(userId: string): void {
  if (userId === CURRENT_USER_ID) return;
  MUTED.add(userId);
  emit();
}

export function unmuteUser(userId: string): void {
  MUTED.delete(userId);
  emit();
}

export function isMuted(userId: string): boolean {
  return MUTED.has(userId);
}

/* ------------------------------------------------------------------ */
/* FOLLOW COUNTS                                                      */
/* ------------------------------------------------------------------ */

export function getFollowingCount() {
  return Object.keys(FOLLOWING).length;
}

export function getFollowerCount() {
  return getFollowers().length;
}

/* ------------------------------------------------------------------ */
/* 🔒 FRIENDS ATTENDING EVENT (NEW)                                   */
/* ------------------------------------------------------------------ */

export function getFriendsAttending<
  T extends { userId: string; username: string }
>(participants: T[]) {
  const followingIds = getFollowingIds();

  return participants.filter((p) => followingIds.includes(p.userId));
}

/*
Kullanım:

const friends = getFriendsAttending(eventParticipants)

Ali ve 2 arkadaşın katılıyor
*/

/* ------------------------------------------------------------------ */
/* SUBSCRIBE                                                          */
/* ------------------------------------------------------------------ */

export function subscribeFollow(listener: () => void) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/* ------------------------------------------------------------------ */
/* INTERNAL                                                           */
/* ------------------------------------------------------------------ */

function emit() {
  listeners.forEach((l) => l());
}