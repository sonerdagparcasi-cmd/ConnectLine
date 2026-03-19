// src/domains/social/services/socialFeedService.ts
// 🔒 SOCIAL FEED SERVICE – UI ONLY (FOLLOW + RECOMMENDED + EXPLORE)
// UPDATED:
// - explore algorithm
// - trending score
// - explore feed support
// - architecture preserved

import type { SocialPost } from "../types/social.types";
import { MOCK_POSTS } from "./socialMockData";

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
  const likeScore = post.likeCount * 3;
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
/* RANK FEED (FAZ 5 – following priority + activity + recency)        */
/* ------------------------------------------------------------------ */

export function rankFeedPosts(
  posts: SocialPost[],
  followingIds: string[]
): SocialPost[] {
  const followingSet = new Set(followingIds);

  function score(p: SocialPost): number {
    const followBonus = followingSet.has(p.userId) ? 100 : 0;
    const likeScore = (p.likeCount ?? 0) * 2;
    const commentScore = (p.commentCount ?? 0) * 3;
    const created = new Date(p.createdAt).getTime();
    const now = Date.now();
    const hours = (now - created) / (1000 * 60 * 60);
    let recency = 0;
    if (hours < 1) recency = 30;
    else if (hours < 6) recency = 15;
    else if (hours < 24) recency = 5;
    return followBonus + likeScore + commentScore + recency;
  }

  return [...posts].sort((a, b) => score(b) - score(a));
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

/* ------------------------------------------------------------------ */
/* MERGED FEED                                                        */
/* ------------------------------------------------------------------ */

export function getFeedPosts(): SocialPost[] {
  const following = getFollowingPosts();
  const recommended = getRecommendedPosts();

  const merged = [...following, ...recommended];

  return merged.slice(0, INITIAL_FEED_LIMIT);
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