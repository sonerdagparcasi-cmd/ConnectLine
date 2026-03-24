// src/domains/social/services/socialFeedService.ts
// 🔒 SOCIAL FEED SERVICE – UI ONLY (FOLLOW + RECOMMENDED + EXPLORE)
// UPDATED:
// - explore algorithm
// - trending score
// - explore feed support
// - architecture preserved

import type { SocialPost } from "../types/social.types";
import { MOCK_POSTS } from "./socialMockData";
import { socialNotificationService } from "./socialNotificationService";

/* ------------------------------------------------------------------ */
/* MOCK FOLLOWING                                                     */
/* ------------------------------------------------------------------ */

const CURRENT_USER_ID = "u1";

/**
 * UI-only takip edilen kullanıcılar
 */
const FOLLOWING_IDS = ["u2", "u3", "u4"];

/* ------------------------------------------------------------------ */
/* CONFIG                                                             */
/* ------------------------------------------------------------------ */

const INITIAL_FEED_LIMIT = 20;
const INITIAL_EXPLORE_LIMIT = 30;
const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function sortByDate(posts: SocialPost[]): SocialPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

/* ------------------------------------------------------------------ */
/* TREND SCORE                                                        */
/* ------------------------------------------------------------------ */

function calculateTrendScore(post: SocialPost): number {
  const likeScore = (post.likeCount ?? 0) * 3;
  const commentScore = post.commentCount * 5;

  const postTime = new Date(post.createdAt).getTime();
  const now = Date.now();

  const hours = (now - postTime) / (1000 * 60 * 60);

  let recencyScore = 0;

  if (hours < 1) recencyScore = 50;
  else if (hours < 6) recencyScore = 25;
  else if (hours < 24) recencyScore = 10;

  return likeScore + commentScore + recencyScore;
}

function sortByTrend(posts: SocialPost[]): SocialPost[] {
  return [...posts].sort(
    (a, b) => calculateTrendScore(b) - calculateTrendScore(a)
  );
}

/* ------------------------------------------------------------------ */
/* RANK FEED (FAZ 5 ADIM 6)                                            */
/* Sıra: 1) Kendi gönderilerin 2) Takip edilenler 3) Popüler / keşif   */
/* Sinyaller: likeCount, commentCount (etkileşim), recency, likedByMe  */
/* ------------------------------------------------------------------ */

function feedRecencyScore(post: SocialPost): number {
  const created = new Date(post.createdAt).getTime();
  const now = Date.now();
  const hours = (now - created) / (1000 * 60 * 60);
  if (hours < 1) return 55;
  if (hours < 6) return 32;
  if (hours < 24) return 18;
  if (hours < 72) return 9;
  if (hours < 168) return 4;
  return Math.max(0, 2 - Math.floor(hours / (24 * 14)));
}

/** Beğeni + yorum + küçük kişisel etkileşim (sen beğendiysen hafif boost) */
function feedInteractionScore(post: SocialPost): number {
  const likes = (post.likeCount ?? 0) * 3;
  const comments = (post.commentCount ?? 0) * 5;
  const youLiked = post.likedByMe ? 12 : 0;
  return likes + comments + youLiked;
}

/**
 * @param currentUserId — `getCurrentSocialUserId()` ile beslenir (mock u1)
 */
export function rankFeedPosts(
  posts: SocialPost[],
  followingIds: string[],
  currentUserId: string = CURRENT_USER_ID
): SocialPost[] {
  const followingSet = new Set(followingIds);

  /** 0 = kendi, 1 = takip, 2 = diğer (popüler keşif) */
  function tier(p: SocialPost): number {
    if (p.userId === currentUserId) return 0;
    if (followingSet.has(p.userId)) return 1;
    return 2;
  }

  function withinTierRank(p: SocialPost): number {
    return feedInteractionScore(p) + feedRecencyScore(p);
  }

  return [...posts].sort((a, b) => {
    const ta = tier(a);
    const tb = tier(b);
    if (ta !== tb) return ta - tb;

    const ra = withinTierRank(a);
    const rb = withinTierRank(b);
    if (rb !== ra) return rb - ra;

    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
}

/* ------------------------------------------------------------------ */
/* FOLLOWING POSTS                                                    */
/* ------------------------------------------------------------------ */

function getFollowingPosts(): SocialPost[] {
  const posts = MOCK_POSTS.filter((p) =>
    FOLLOWING_IDS.includes(p.userId)
  );

  return sortByDate(posts);
}

/* ------------------------------------------------------------------ */
/* RECOMMENDED POSTS                                                  */
/* ------------------------------------------------------------------ */

function getRecommendedPosts(): SocialPost[] {
  const posts = MOCK_POSTS.filter(
    (p) => !FOLLOWING_IDS.includes(p.userId)
  );

  return sortByDate(posts);
}

function generateMockPosts(total: number): SocialPost[] {
  const seed = sortByDate([...getFollowingPosts(), ...getRecommendedPosts()]);
  if (seed.length === 0) return [];

  const generated: SocialPost[] = [];
  for (let i = 0; i < total; i += 1) {
    const base = seed[i % seed.length];
    const createdAt = new Date(
      new Date(base.createdAt).getTime() - i * 60 * 1000
    ).toISOString();
    generated.push({
      ...base,
      id: `${base.id}_page_${i}`,
      createdAt,
    });
  }
  return generated;
}

let allPosts = generateMockPosts(100);

export const socialFeedService = {
  getFeed(page = 0) {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return {
      data: allPosts.slice(start, end),
      hasMore: end < allPosts.length,
    };
  },
};

/* ------------------------------------------------------------------ */
/* MERGED FEED                                                        */
/* ------------------------------------------------------------------ */

export function getFeedPosts(): SocialPost[] {
  return allPosts.slice(0, INITIAL_FEED_LIMIT);
}

/* ------------------------------------------------------------------ */
/* EXPLORE POSTS                                                      */
/* ------------------------------------------------------------------ */

export function getExplorePosts(): SocialPost[] {
  const publicPosts = MOCK_POSTS.filter(
    (p) => p.visibility === "public"
  );

  const sorted = sortByTrend(publicPosts);

  return sorted.slice(0, INITIAL_EXPLORE_LIMIT);
}

/* ------------------------------------------------------------------ */
/* TRENDING POSTS                                                     */
/* ------------------------------------------------------------------ */

export function getTrendingPosts(): SocialPost[] {
  const sorted = sortByTrend(MOCK_POSTS);

  return sorted.slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* RECOMMENDED FOR USER                                               */
/* ------------------------------------------------------------------ */

export function getRecommendedForUser(): SocialPost[] {
  const posts = MOCK_POSTS.filter(
    (p) =>
      !FOLLOWING_IDS.includes(p.userId) &&
      p.userId !== CURRENT_USER_ID
  );

  return sortByTrend(posts).slice(0, 20);
}

export function pushLikeNotification(input: {
  postId: string;
  userId: string;
  targetId: string;
}) {
  socialNotificationService.push({
    type: "like",
    postId: input.postId,
    userId: input.userId,
    targetId: input.targetId,
    message: "liked_your_post",
  });
}