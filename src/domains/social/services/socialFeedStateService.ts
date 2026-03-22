// src/domains/social/services/socialFeedStateService.ts
// 🔒 SOCIAL FEED STATE (UI-ONLY STORE + TIMELINE CACHE)
// UPDATED:
// - timeline cache
// - duplicate guard
// - pagination stabilization
// - explore cache
// - updatePost safety
// - EVENT FEED SUPPORT

import type { SocialComment, SocialPost, SocialPostShareSettings } from "../types/social.types";
import {
  getCurrentSocialUserId,
  getSocialDisplayName,
  isMuted,
  isUserBlocked,
} from "./socialFollowService";

/** Engellenen / sessize alınan yazarların gönderileri (feed, keşfet, kayıtlı vb.) */
function filterBlockedAndMutedAuthors(posts: SocialPost[]): SocialPost[] {
  return posts.filter((p) => !isUserBlocked(p.userId) && !isMuted(p.userId));
}
import { notifyPostCommented, notifyPostLiked } from "./socialNotificationService";
import { socialEventService } from "./socialEventService";
import { getFeedPosts as getBaseFeedPosts } from "./socialFeedService";

/* ------------------------------------------------------------------ */
/* INTERNAL STORE                                                     */
/* ------------------------------------------------------------------ */

let POST_MAP: Record<string, SocialPost> = {};
let POST_ORDER: string[] = [];

/* ------------------------------------------------------------------ */
/* TIMELINE CACHE                                                     */
/* ------------------------------------------------------------------ */

let TIMELINE_CACHE: SocialPost[] | null = null;
let EXPLORE_CACHE: SocialPost[] | null = null;

/* ------------------------------------------------------------------ */
/* PAGINATION STATE                                                   */
/* ------------------------------------------------------------------ */

let PAGE = 1;
let PAGE_SIZE = 5;
let HAS_MORE = true;
let LOADING = false;

/* ------------------------------------------------------------------ */
/* SAVED POSTS                                                        */
/* ------------------------------------------------------------------ */

const SAVED_POST_IDS = new Set<string>();

/* ------------------------------------------------------------------ */
/* COMMENTS (per post)                                                 */
/* ------------------------------------------------------------------ */

let COMMENTS: Record<string, SocialComment[]> = {};

/* ------------------------------------------------------------------ */
/* LISTENERS                                                          */
/* ------------------------------------------------------------------ */

let listeners: Array<() => void> = [];

/* ------------------------------------------------------------------ */
/* EVENT → POST CONVERTER                                             */
/* ------------------------------------------------------------------ */

async function getEventFeedPosts(): Promise<SocialPost[]> {
  const events = await socialEventService.getEvents();

  return events.map((e) => ({
    id: "event_" + e.id,

    userId: e.hostId,
    username: e.hostName,

    media: [],
    caption: "",

    visibility: "public",

    createdAt: e.date,

    likeCount: 0,
    likedByMe: false,

    commentCount: 0,

    event: {
      eventId: e.id,
      title: e.title,
      dateISO: e.date,
      location: e.location,
      coverImage: e.coverImage,
    },
  }));
}

/* ------------------------------------------------------------------ */
/* INIT STORE                                                         */
/* ------------------------------------------------------------------ */

async function initStore() {
  const base = getBaseFeedPosts();

  const events = await getEventFeedPosts();

  const merged = [...events, ...base];

  POST_MAP = {};
  POST_ORDER = [];
  COMMENTS = {};

  merged.forEach((p) => {
    POST_MAP[p.id] = p;
    POST_ORDER.push(p.id);
    const preview = p.commentsPreview;
    if (preview?.length) {
      COMMENTS[p.id] = preview.map((c) => ({
        ...c,
        postId: c.postId ?? p.id,
      }));
    }
  });

  TIMELINE_CACHE = null;
  EXPLORE_CACHE = null;
}

initStore();

/* ------------------------------------------------------------------ */
/* CORE STORE                                                         */
/* ------------------------------------------------------------------ */

export function getAllPosts(): SocialPost[] {
  return POST_ORDER.map((id) => POST_MAP[id]);
}

export function getPostById(postId: string): SocialPost | undefined {
  const p = POST_MAP[postId];
  if (!p) return undefined;
  const me = getCurrentSocialUserId();
  if (p.userId !== me && isUserBlocked(p.userId)) return undefined;
  return p;
}

/** Liste görünümleri: arşivlenmiş gönderileri dışla */
function filterPublished(posts: SocialPost[]): SocialPost[] {
  return posts.filter((p) => !p.archived);
}

function mergeSettings(
  cur: SocialPostShareSettings | undefined,
  patch: Partial<SocialPostShareSettings>
): SocialPostShareSettings {
  const merged = { comments: true, likesVisible: true, ...cur, ...patch };
  const commentsVal = merged.commentsEnabled ?? merged.comments;
  const likesVal = merged.likesVisible;
  return {
    comments: commentsVal !== false,
    likesVisible: likesVal !== false,
    commentsEnabled: commentsVal !== false,
  };
}

/* ------------------------------------------------------------------ */
/* TIMELINE FEED (ranked + filtered by blocked/muted)                  */
/* ------------------------------------------------------------------ */

export function getFeedPosts(): SocialPost[] {
  const posts = filterPublished(getAllPosts());
  const filtered = posts.filter(
    (p) => !isUserBlocked(p.userId) && !isMuted(p.userId)
  );
  return [...filtered].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/* ------------------------------------------------------------------ */
/* SPAM / RATE LIMIT (FAZ 5)                                          */
/* ------------------------------------------------------------------ */

const POST_COOLDOWN_MS = 5 * 60 * 1000;
const COMMENT_COOLDOWN_MS = 30 * 1000;

let lastPostCreatedAt = 0;
const lastCommentAtByPost: Record<string, number> = {};

export function canCreatePost(): boolean {
  const now = Date.now();
  return now - lastPostCreatedAt >= POST_COOLDOWN_MS;
}

export function recordPostCreated(): void {
  lastPostCreatedAt = Date.now();
}

export function canAddComment(postId: string): boolean {
  const now = Date.now();
  const last = lastCommentAtByPost[postId] ?? 0;
  return now - last >= COMMENT_COOLDOWN_MS;
}

export function recordCommentAdded(postId: string): void {
  lastCommentAtByPost[postId] = Date.now();
}

/* ------------------------------------------------------------------ */
/* PROFILE POSTS                                                      */
/* ------------------------------------------------------------------ */

export function getPostsByUser(userId: string): SocialPost[] {
  const me = getCurrentSocialUserId();
  if (userId !== me && isUserBlocked(userId)) return [];
  return filterPublished(
    POST_ORDER.map((id) => POST_MAP[id]).filter((p) => p.userId === userId)
  );
}

/**
 * Profil grid / sayıları; engellenen profillerde boş liste (getPostsByUser ile aynı kural).
 */
export function getProfilePostsVisibleToCurrentUser(profileUserId: string): SocialPost[] {
  return getPostsByUser(profileUserId);
}

/* ------------------------------------------------------------------ */
/* TREND SCORE (FAZ 4 – single source for trending)                  */
/* ------------------------------------------------------------------ */

function calculateTrendScore(post: SocialPost): number {
  const likeScore = (post.likeCount ?? 0) * 3;
  const commentScore = (post.commentCount ?? 0) * 5;
  const created = new Date(post.createdAt).getTime();
  const now = Date.now();
  const hours = (now - created) / (1000 * 60 * 60);
  let recency = 0;
  if (hours < 1) recency = 50;
  else if (hours < 6) recency = 25;
  else if (hours < 24) recency = 10;
  return likeScore + commentScore + recency;
}

export function getTrendingPosts(limit = 15): SocialPost[] {
  const posts = filterBlockedAndMutedAuthors(filterPublished(getAllPosts()));
  return [...posts]
    .sort((a, b) => calculateTrendScore(b) - calculateTrendScore(a))
    .slice(0, limit);
}

export function getTrendingVideos(limit = 20): SocialPost[] {
  const posts = filterBlockedAndMutedAuthors(filterPublished(getAllPosts())).filter(
    (p) => p.media?.some((m) => m.type === "video")
  );
  return [...posts]
    .sort((a, b) => calculateTrendScore(b) - calculateTrendScore(a))
    .slice(0, limit);
}

/** Extract unique hashtags from post captions (e.g. #technology) */
export function getHashtagsFromPosts(): { tag: string; count: number }[] {
  const count: Record<string, number> = {};
  filterBlockedAndMutedAuthors(filterPublished(getAllPosts())).forEach((p) => {
    const matches = (p.caption ?? "").match(/#[\wğüşıöçĞÜŞİÖÇ]+/g) ?? [];
    matches.forEach((tag) => {
      const key = tag.toLowerCase();
      count[key] = (count[key] ?? 0) + 1;
    });
  });
  return Object.entries(count)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

/* ------------------------------------------------------------------ */
/* EXPLORE POSTS                                                      */
/* ------------------------------------------------------------------ */

export function getExplorePosts(): SocialPost[] {
  if (!EXPLORE_CACHE) {
    const posts = filterBlockedAndMutedAuthors(filterPublished(getAllPosts()));
    EXPLORE_CACHE = [...posts].sort(() => Math.random() - 0.5);
  }
  return filterBlockedAndMutedAuthors(EXPLORE_CACHE);
}

/* ------------------------------------------------------------------ */
/* PAGINATION                                                         */
/* ------------------------------------------------------------------ */

export function getFeedPagination() {
  return {
    page: PAGE,
    pageSize: PAGE_SIZE,
    hasMore: HAS_MORE,
    loading: LOADING,
  };
}

/* ------------------------------------------------------------------ */
/* LOAD MORE                                                          */
/* ------------------------------------------------------------------ */

export function loadMoreFeedPosts() {
  if (LOADING || !HAS_MORE) return;

  LOADING = true;

  setTimeout(() => {
    const base = getBaseFeedPosts();

    const start = PAGE * PAGE_SIZE;
    const next = filterBlockedAndMutedAuthors(
      base.slice(start, start + PAGE_SIZE)
    );

    if (next.length === 0) {
      HAS_MORE = false;
    } else {
      appendFeedPosts(next);
      PAGE += 1;
    }

    LOADING = false;

    emit();
  }, 600);
}

/* ------------------------------------------------------------------ */
/* ADD POST                                                           */
/* ------------------------------------------------------------------ */

/** Yeni gönderi her zaman feed tepesinde (unshift; push kullanılmaz). */
export function addFeedPost(post: SocialPost) {
  if (POST_MAP[post.id]) return;

  POST_MAP[post.id] = post;
  POST_ORDER.unshift(post.id);

  invalidateCache();

  emit();
}

/* ------------------------------------------------------------------ */
/* APPEND POSTS                                                       */
/* ------------------------------------------------------------------ */

export function appendFeedPosts(posts: SocialPost[]) {
  let changed = false;

  posts.forEach((p) => {
    if (!POST_MAP[p.id]) {
      POST_MAP[p.id] = p;
      POST_ORDER.push(p.id);
      changed = true;
    }
  });

  if (!changed) return;

  invalidateCache();

  emit();
}

/* ------------------------------------------------------------------ */
/* UPDATE POST                                                        */
/* ------------------------------------------------------------------ */

export function updatePost(post: SocialPost) {
  if (!POST_MAP[post.id]) return;

  POST_MAP[post.id] = post;

  invalidateCache();

  emit();
}

/**
 * Kısmi alan güncellemesi — tek kaynak POST_MAP.
 * İç içe `settings` / `videoCovers` birleştirilir.
 */
export function updateFeedPost(postId: string, patch: Partial<SocialPost>) {
  const cur = POST_MAP[postId];
  if (!cur) return;

  const next: SocialPost = { ...cur, ...patch };

  if (patch.settings !== undefined) {
    next.settings = mergeSettings(cur.settings, patch.settings);
  }

  if (patch.videoCovers !== undefined) {
    next.videoCovers = { ...(cur.videoCovers ?? {}), ...patch.videoCovers };
  }

  POST_MAP[postId] = next;
  invalidateCache();
  emit();
}

export function archiveFeedPost(postId: string) {
  const p = POST_MAP[postId];
  if (!p) return;
  POST_MAP[postId] = { ...p, archived: true };
  invalidateCache();
  emit();
}

export function unarchiveFeedPost(postId: string) {
  const p = POST_MAP[postId];
  if (!p) return;
  POST_MAP[postId] = { ...p, archived: false };
  invalidateCache();
  emit();
}

export function removeFeedPost(postId: string) {
  if (!POST_MAP[postId]) return;

  delete POST_MAP[postId];
  POST_ORDER = POST_ORDER.filter((id) => id !== postId);
  delete COMMENTS[postId];
  SAVED_POST_IDS.delete(postId);

  invalidateCache();
  emit();
}

/* ------------------------------------------------------------------ */
/* REPLACE FEED                                                       */
/* ------------------------------------------------------------------ */

export function replaceFeedPosts(nextPosts: SocialPost[]) {
  POST_MAP = {};
  POST_ORDER = [];

  nextPosts.forEach((p) => {
    POST_MAP[p.id] = p;
    POST_ORDER.push(p.id);
  });

  invalidateCache();

  emit();
}

/* ------------------------------------------------------------------ */
/* LIKE (FAZ 5 — tek kaynak: likedByMe + likeCount)                    */
/* ------------------------------------------------------------------ */

/** Beğen / beğeniyi kaldır; sayaç ve `likedByMe` güncellenir, abonelere bildirilir. */
export function toggleLike(postId: string): void {
  const post = POST_MAP[postId];
  if (!post) return;

  const wasLiked = post.likedByMe;
  const n = post.likeCount ?? 0;
  const next = {
    ...post,
    likedByMe: !post.likedByMe,
    likeCount: post.likedByMe ? Math.max(0, n - 1) : n + 1,
  };
  POST_MAP[postId] = next;
  invalidateCache();
  emit();

  const me = getCurrentSocialUserId();
  if (!wasLiked && next.likedByMe && post.userId !== me) {
    notifyPostLiked({
      actorUserId: me,
      actorUsername: getSocialDisplayName(me),
      actorAvatarUri: null,
      postOwnerUserId: post.userId,
      postId,
    });
  }
}

/** `toggleLike` ile aynı — API uyumluluğu (interaction core). Beğeni bildirimi `toggleLike` içinde `notifyPostLiked`. */
export function toggleLikePost(postId: string): void {
  toggleLike(postId);
}

/* ------------------------------------------------------------------ */
/* COMMENTS (single source)                                           */
/* ------------------------------------------------------------------ */

export function getComments(postId: string): SocialComment[] {
  return COMMENTS[postId] ?? [];
}

export function addComment(
  postId: string,
  comment: Omit<SocialComment, "id" | "createdAt" | "postId">
): SocialComment {
  const post = POST_MAP[postId];
  const newComment: SocialComment = {
    ...comment,
    postId,
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  const list = COMMENTS[postId] ?? [];
  COMMENTS[postId] = [newComment, ...list];

  if (post) {
    post.commentCount = (post.commentCount ?? 0) + 1;
    const preview = COMMENTS[postId].slice(0, 3);
    post.commentsPreview = preview;
    invalidateCache();
  }
  recordCommentAdded(postId);
  emit();

  if (post && comment.userId !== post.userId) {
    notifyPostCommented({
      actorUserId: comment.userId,
      actorUsername: comment.username,
      actorAvatarUri: null,
      postOwnerUserId: post.userId,
      postId,
      commentText: comment.text,
    });
  }

  return newComment;
}

/* ------------------------------------------------------------------ */
/* RESET                                                              */
/* ------------------------------------------------------------------ */

export function resetFeedPosts() {
  initStore();

  PAGE = 1;
  HAS_MORE = true;
  LOADING = false;

  emit();
}

/* ------------------------------------------------------------------ */
/* SAVED POSTS                                                        */
/* ------------------------------------------------------------------ */

export function toggleSave(postId: string): void {
  toggleSavePost(postId);
}

export function toggleSavedPost(postId: string) {
  toggleSavePost(postId);
}

export function toggleSavePost(postId: string) {
  if (SAVED_POST_IDS.has(postId)) {
    SAVED_POST_IDS.delete(postId);
  } else {
    SAVED_POST_IDS.add(postId);
  }
  notifyFeedSubscribers();
}

export function isPostSaved(postId: string): boolean {
  return SAVED_POST_IDS.has(postId);
}

export function getSavedPosts(): SocialPost[] {
  return filterBlockedAndMutedAuthors(
    filterPublished(
      POST_ORDER.map((id) => POST_MAP[id]).filter(
        (p) => SAVED_POST_IDS.has(p.id) && !p.archived
      )
    )
  );
}

/* ------------------------------------------------------------------ */
/* SUBSCRIBE                                                          */
/* ------------------------------------------------------------------ */

export function subscribeFeed(listener: () => void) {
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/* ------------------------------------------------------------------ */
/* CACHE CONTROL                                                      */
/* ------------------------------------------------------------------ */

function invalidateCache() {
  TIMELINE_CACHE = null;
  EXPLORE_CACHE = null;
}

/* ------------------------------------------------------------------ */
/* INTERNAL                                                           */
/* ------------------------------------------------------------------ */

function emit() {
  listeners.forEach((l) => l());
}

/** Kayıt / beğeni / feed listesi değişimlerinde UI aboneleri. */
export function notifyFeedSubscribers() {
  emit();
}