// src/domains/social/services/socialFollowService.ts
// 🔒 SOCIAL FOLLOW SERVICE – GRAPH ENGINE (UI-ONLY)

import { socialProfileStore } from "../state/socialProfileStore";
import { MOCK_POSTS } from "./socialMockData";
import { emitSocialEvent, subscribeEvents } from "./socialFeedStateService";
import { socialNotificationService } from "./socialNotificationService";

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

let followersMap: Record<string, string[]> = {};
let followingMap: Record<string, string[]> = {
  [CURRENT_USER_ID]: ["u2"],
};

const BLOCKED_USER_IDS = new Set<string>();
let MUTED: Set<string> = new Set();

let listeners: Array<() => void> = [];

function updateFollowStats() {
  socialProfileStore.setFollowingCount(getFollowingCount(CURRENT_USER_ID));
  socialProfileStore.setFollowersMap(followersMap);
  socialProfileStore.setFollowingMap(followingMap);
}

let eventBridgeInitialized = false;
function ensureEventBridgeInitialized() {
  if (eventBridgeInitialized) return;
  eventBridgeInitialized = true;
  subscribeEvents((event) => {
    if (event.type === "FOLLOW" || event.type === "UNFOLLOW") {
      updateFollowStats();
    }
  });
}

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

export const socialFollowService = {
  follow(userId: string, targetId: string) {
    ensureEventBridgeInitialized();
    if (!userId || !targetId || userId === targetId) return;

    if (!followingMap[userId]) followingMap[userId] = [];
    if (!followersMap[targetId]) followersMap[targetId] = [];

    const alreadyFollowing = followingMap[userId].includes(targetId);
    if (alreadyFollowing) return;

    followingMap[userId] = [...followingMap[userId], targetId];
    followersMap[targetId] = [...followersMap[targetId], userId];

    updateFollowStats();
    emit();

    emitSocialEvent({
      type: "FOLLOW",
      targetUserId: targetId,
      userId,
      actorUsername: getSocialDisplayName(userId),
    });

    socialNotificationService.push({
      type: "follow",
      userId,
      targetId,
      message: "started_following_you",
    });
  },

  unfollow(userId: string, targetId: string) {
    ensureEventBridgeInitialized();
    if (!userId || !targetId || userId === targetId) return;

    followingMap[userId] = (followingMap[userId] || []).filter((id) => id !== targetId);
    followersMap[targetId] = (followersMap[targetId] || []).filter((id) => id !== userId);

    updateFollowStats();
    emit();

    emitSocialEvent({
      type: "UNFOLLOW",
      targetUserId: targetId,
      userId,
      actorUsername: getSocialDisplayName(userId),
    });
  },

  isFollowing(userId: string, targetId: string) {
    return (followingMap[userId] || []).includes(targetId);
  },

  getFollowers(userId: string) {
    return followersMap[userId] || [];
  },

  getFollowing(userId: string) {
    return followingMap[userId] || [];
  },
};

export function followUser(userId: string) {
  ensureEventBridgeInitialized();
  socialFollowService.follow(CURRENT_USER_ID, userId);
}

export function unfollowUser(userId: string) {
  ensureEventBridgeInitialized();
  socialFollowService.unfollow(CURRENT_USER_ID, userId);
}

export function toggleFollow(userId: string) {
  if (isFollowing(userId)) {
    unfollowUser(userId);
  } else {
    followUser(userId);
  }
}

export function sendFollowRequest(fromUserId: string, toUserId: string) {
  ensureEventBridgeInitialized();
  const fromId = resolveSocialUserId(fromUserId);
  const toId = resolveSocialUserId(toUserId);
  if (fromId === toId) return;

  FOLLOW_REQUESTS.push({
    id: `req_${Date.now()}`,
    fromUserId: fromId,
    toUserId: toId,
    createdAt: new Date().toISOString(),
  });

  emitSocialEvent({
    type: "FOLLOW_REQUEST",
    targetUserId: toId,
    userId: fromId,
    actorUsername: getSocialDisplayName(fromId),
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
  return socialFollowService.isFollowing(CURRENT_USER_ID, userId);
}

export function getFollowingIds(): string[] {
  return socialFollowService.getFollowing(CURRENT_USER_ID);
}

export function getFollowing(userId: string): string[] {
  return socialFollowService.getFollowing(userId);
}

export function getFollowingUsers() {
  const users = getAllUsers();

  const followingIds = new Set(socialFollowService.getFollowing(CURRENT_USER_ID));
  return users.filter((u) => followingIds.has(u.userId));
}

/* ------------------------------------------------------------------ */
/* FOLLOWERS                                                          */
/* ------------------------------------------------------------------ */

export function getFollowers(userId?: string) {
  const users = getAllUsers();

  const targetId = userId ?? CURRENT_USER_ID;
  const followerIds = new Set(socialFollowService.getFollowers(targetId));
  return users.filter((u) => followerIds.has(u.userId));
}

/* ------------------------------------------------------------------ */
/* MUTUAL CONNECTIONS                                                 */
/* ------------------------------------------------------------------ */

/** Ortak bağlantı kullanıcıları (liste ekranı); sayı ile aynı mantık */
export function getMutualConnectionUsers(userId: string) {
  const myFollowing = getFollowingIds();

  const otherFollowing: string[] = [];

  if (socialFollowService.isFollowing(CURRENT_USER_ID, userId)) {
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
    .filter((u) => !socialFollowService.isFollowing(CURRENT_USER_ID, u.userId))
    .filter((u) => !BLOCKED_USER_IDS.has(u.userId))
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* BLOCK / UNBLOCK                                                    */
/* ------------------------------------------------------------------ */

export function blockUser(userId: string): void {
  if (userId === CURRENT_USER_ID) return;
  BLOCKED_USER_IDS.add(userId);
  socialFollowService.unfollow(CURRENT_USER_ID, userId);
  updateFollowStats();
  emit();
}

export function unblockUser(userId: string): void {
  BLOCKED_USER_IDS.delete(userId);
  emit();
}

export function isBlocked(userId: string): boolean {
  return BLOCKED_USER_IDS.has(resolveSocialUserId(userId));
}

/** ADIM 5 — engel kontrolü (me → current user çözülür) */
export function isUserBlocked(userId: string): boolean {
  return BLOCKED_USER_IDS.has(resolveSocialUserId(userId));
}

export function getBlockedIds(): string[] {
  return Array.from(BLOCKED_USER_IDS);
}

export function getBlockedUserIds(): string[] {
  return getBlockedIds();
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

export function getFollowingCount(userId: string = CURRENT_USER_ID) {
  return socialFollowService.getFollowing(userId).length;
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
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }

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