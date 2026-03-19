// src/domains/social/services/socialFollowService.ts
// 🔒 SOCIAL FOLLOW SERVICE – GRAPH ENGINE (UI-ONLY)

import { socialProfileStore } from "../state/socialProfileStore";
import { MOCK_POSTS } from "./socialMockData";

/* ------------------------------------------------------------------ */
/* CURRENT USER                                                       */
/* ------------------------------------------------------------------ */

const CURRENT_USER_ID = "u1";

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

/* ------------------------------------------------------------------ */
/* FOLLOW ACTIONS                                                     */
/* ------------------------------------------------------------------ */

export function followUser(userId: string) {
  if (userId === CURRENT_USER_ID) return;

  FOLLOWING = {
    ...FOLLOWING,
    [userId]: true,
  };

  socialProfileStore.setFollowingCount(getFollowingCount());
  emit();
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

export function getMutualConnections(userId: string): number {
  const myFollowing = getFollowingIds();

  const otherFollowing: string[] = [];

  if (FOLLOWING[userId]) {
    otherFollowing.push(userId);
  }

  const mutual = myFollowing.filter((id) => otherFollowing.includes(id));

  return mutual.length;
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