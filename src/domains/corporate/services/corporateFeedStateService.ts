import type { CorporatePost } from "../types/feed.types";
import { normalizeCorporatePost } from "../utils/corporatePostNormalize";
import { mockCorporateFeedApi } from "./mockCorporateFeedApi";
import {
  getCorporateActorUserId,
  getCorporateManagedCompanyId,
} from "./corporateViewerIdentity";

export type CorporateEvent =
  | {
      type: "LIKE";
      postId: string;
      actorUserId: string;
      targetCompanyId: string;
      likeAdded: boolean;
    }
  | {
      type: "COMMENT";
      postId: string;
      actorUserId: string;
      targetCompanyId: string;
    }
  | {
      type: "FOLLOW_COMPANY";
      companyId: string;
      actorUserId: string;
      targetCompanyId: string;
    }
  | { type: "SAVE"; postId: string }
  | { type: "DELETE_POST"; postId: string }
  | { type: "EDIT_POST"; postId: string }
  | { type: "TOGGLE_COMMENTS"; postId: string }
  | { type: "TOGGLE_LIKE_VISIBILITY"; postId: string };

export type CorporateComment = {
  id: string;
  postId: string;
  text: string;
  createdAt: number;
  authorUserId: string;
};

let posts: CorporatePost[] = [];
let listeners: Array<() => void> = [];
let eventListeners: Array<(event: CorporateEvent) => void> = [];
let commentsByPost: Record<string, CorporateComment[]> = {};

function seedDemoCommentsIfNeeded() {
  if (commentsByPost["post-1"]?.length) return;
  commentsByPost["post-1"] = [
    {
      id: "demo-c1",
      postId: "post-1",
      text: "Tebrikler, başarılar dileriz.",
      createdAt: Date.now() - 50_000,
      authorUserId: "demo-peer-1",
    },
    {
      id: "demo-c2",
      postId: "post-1",
      text: "Detaylar için web sitemize bakabilir miyiz?",
      createdAt: Date.now() - 20_000,
      authorUserId: "demo-peer-2",
    },
  ];
}
const savedPostIds = new Set<string>();
const hydratedCompanies = new Set<string>();

function notify() {
  listeners.forEach((l) => l());
}

function emitCorporateEvent(event: CorporateEvent) {
  eventListeners.forEach((l) => l(event));
}

export function subscribeCorporateFeed(listener: () => void) {
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function subscribeCorporateEvents(listener: (event: CorporateEvent) => void) {
  if (!eventListeners.includes(listener)) {
    eventListeners.push(listener);
  }
  return () => {
    eventListeners = eventListeners.filter((l) => l !== listener);
  };
}

export function getCorporateFeed(): CorporatePost[] {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt);
}

export function getCompanyPosts(companyId: string): CorporatePost[] {
  return getCorporateFeed().filter((p) => p.companyId === companyId);
}

export function getCorporateReels(): CorporatePost[] {
  return getCorporateFeed().filter((p) => {
    if (p.visibility !== "public") return false;
    return p.media.some((m) => m.type === "video");
  });
}

export function getCorporatePostById(postId: string): CorporatePost | undefined {
  return posts.find((p) => p.id === postId);
}

export function getCorporateComments(postId: string): CorporateComment[] {
  return commentsByPost[postId] ?? [];
}

export function setCorporatePosts(nextPosts: CorporatePost[]) {
  posts = [...nextPosts];
  notify();
}

export function addCorporatePost(post: CorporatePost) {
  if (posts.some((p) => p.id === post.id)) return;
  posts = [post, ...posts];
  notify();
}

export function toggleLike(postId: string) {
  const before = posts.find((p) => p.id === postId);
  if (!before) return;

  const likeAdded = !before.likedByMe;
  let changed = false;
  posts = posts.map((p) => {
    if (p.id !== postId) return p;
    changed = true;
    const likedByMe = !p.likedByMe;
    const likeCount = likedByMe ? p.likeCount + 1 : Math.max(0, p.likeCount - 1);
    return { ...p, likedByMe, likeCount };
  });
  if (!changed) return;
  notify();
  emitCorporateEvent({
    type: "LIKE",
    postId,
    actorUserId: getCorporateActorUserId(),
    targetCompanyId: before.companyId,
    likeAdded,
  });
}

export function addComment(postId: string, comment: string) {
  const text = comment.trim();
  if (!text) return;
  const post = posts.find((p) => p.id === postId);
  if (!post || post.commentsDisabled) return;

  const actorUserId = getCorporateActorUserId();
  const newComment: CorporateComment = {
    id: `cc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    postId,
    text,
    createdAt: Date.now(),
    authorUserId: actorUserId,
  };

  commentsByPost[postId] = [newComment, ...(commentsByPost[postId] ?? [])];
  posts = posts.map((p) =>
    p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
  );

  notify();
  emitCorporateEvent({
    type: "COMMENT",
    postId,
    actorUserId,
    targetCompanyId: post.companyId,
  });
}

/**
 * Yorum yazarı veya gönderi şirketinin yöneticisi silebilir (kimlik servisten).
 */
export function deleteCorporateComment(postId: string, commentId: string): boolean {
  const post = posts.find((p) => p.id === postId);
  if (!post) return false;

  const list = commentsByPost[postId] ?? [];
  const comment = list.find((c) => c.id === commentId);
  if (!comment) return false;

  const actor = getCorporateActorUserId();
  const managed = getCorporateManagedCompanyId();
  const isCompanyModerator = managed != null && managed === post.companyId;
  const isAuthor = comment.authorUserId === actor;

  if (!isAuthor && !isCompanyModerator) return false;

  commentsByPost[postId] = list.filter((c) => c.id !== commentId);
  posts = posts.map((p) =>
    p.id === postId
      ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
      : p
  );

  notify();
  return true;
}

export function deletePost(postId: string) {
  const before = posts.length;
  posts = posts.filter((p) => p.id !== postId);
  if (posts.length === before) return;
  delete commentsByPost[postId];
  savedPostIds.delete(postId);
  notify();
  emitCorporateEvent({ type: "DELETE_POST", postId });
}

export function editPost(postId: string, updates: Partial<CorporatePost>) {
  let changed = false;
  posts = posts.map((p) => {
    if (p.id !== postId) return p;
    changed = true;
    return { ...p, ...updates, id: p.id, companyId: p.companyId };
  });
  if (!changed) return;
  notify();
  emitCorporateEvent({ type: "EDIT_POST", postId });
}

export function toggleComments(postId: string) {
  let changed = false;
  posts = posts.map((p) => {
    if (p.id !== postId) return p;
    changed = true;
    return { ...p, commentsDisabled: !p.commentsDisabled };
  });
  if (!changed) return;
  notify();
  emitCorporateEvent({ type: "TOGGLE_COMMENTS", postId });
}

export function toggleLikeVisibility(postId: string) {
  let changed = false;
  posts = posts.map((p) => {
    if (p.id !== postId) return p;
    changed = true;
    return { ...p, likeCountHidden: !p.likeCountHidden };
  });
  if (!changed) return;
  notify();
  emitCorporateEvent({ type: "TOGGLE_LIKE_VISIBILITY", postId });
}

export function toggleSave(postId: string) {
  if (!posts.some((p) => p.id === postId)) return;
  if (savedPostIds.has(postId)) savedPostIds.delete(postId);
  else savedPostIds.add(postId);
  notify();
  emitCorporateEvent({ type: "SAVE", postId });
}

export function getSavedCorporatePosts(): CorporatePost[] {
  return getCorporateFeed().filter((p) => savedPostIds.has(p.id));
}

export function isCorporatePostSaved(postId: string): boolean {
  return savedPostIds.has(postId);
}

/**
 * İlk yüklemede mock API’den şirket akışını çeker; yerel state ile birleştirir.
 * Tek kaynak: bu servis.
 */
export async function hydrateCorporateFeedForCompany(companyId: string): Promise<void> {
  if (hydratedCompanies.has(companyId)) return;
  hydratedCompanies.add(companyId);

  try {
    const remote = await mockCorporateFeedApi.fetchFeed(companyId);
    const normalized = remote.map((r) => normalizeCorporatePost(r));
    const remoteIds = new Set(normalized.map((p) => p.id));
    const localOnly = posts.filter(
      (p) => p.companyId === companyId && !remoteIds.has(p.id)
    );
    posts = [
      ...posts.filter((p) => p.companyId !== companyId),
      ...normalized,
      ...localOnly,
    ];
    seedDemoCommentsIfNeeded();
    notify();
  } catch {
    hydratedCompanies.delete(companyId);
  }
}

export { emitCorporateEvent };
