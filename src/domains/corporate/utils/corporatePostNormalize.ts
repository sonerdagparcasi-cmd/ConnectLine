// src/domains/corporate/utils/corporatePostNormalize.ts
// 🔒 Corporate domain — API / legacy → canonical CorporatePost

import type {
  CorporateMediaItem,
  CorporateOverlay,
  CorporatePost,
} from "../types/feed.types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function normalizeOverlay(raw: unknown, index: number): CorporateOverlay {
  const o = raw as Record<string, unknown>;
  const type = o.type === "tag" ? "tag" : "text";
  const x = typeof o.x === "number" ? clamp01(o.x) : 0.5;
  const y = typeof o.y === "number" ? clamp01(o.y) : 0.5;
  const style = o.style && typeof o.style === "object" ? (o.style as CorporateOverlay["style"]) : undefined;
  return {
    id: String(o.id ?? `ov-${index}`),
    type,
    x,
    y,
    value: String(o.value ?? ""),
    style,
  };
}

export function normalizeMediaItem(raw: unknown, index: number): CorporateMediaItem {
  const m = raw as Record<string, unknown>;
  const durationMs =
    typeof m.durationMs === "number"
      ? m.durationMs
      : typeof m.duration === "number"
        ? Math.round(m.duration * 1000)
        : undefined;

  return {
    id: String(m.id ?? `media-${index}`),
    type: m.type === "video" ? "video" : "image",
    uri: String(m.uri ?? ""),
    order: typeof m.order === "number" ? m.order : index,
    width: typeof m.width === "number" ? m.width : undefined,
    height: typeof m.height === "number" ? m.height : undefined,
    thumbnailUri: typeof m.thumbnailUri === "string" ? m.thumbnailUri : undefined,
    durationMs,
  };
}

export function normalizeCorporatePost(raw: unknown): CorporatePost {
  const p = raw as Record<string, unknown>;
  const createdAt =
    typeof p.createdAt === "number"
      ? p.createdAt
      : new Date(String(p.createdAt ?? Date.now())).getTime();

  const mediaRaw = p.media;
  const media: CorporateMediaItem[] = Array.isArray(mediaRaw)
    ? mediaRaw.map((m, i) => normalizeMediaItem(m, i))
    : [];

  const overlaysRaw = p.overlays;
  const overlays: CorporateOverlay[] | undefined = Array.isArray(overlaysRaw)
    ? overlaysRaw.map((o, i) => normalizeOverlay(o, i))
    : undefined;

  const caption =
    typeof p.caption === "string"
      ? p.caption
      : typeof p.text === "string"
        ? p.text
        : "";

  return {
    id: String(p.id ?? ""),
    companyId: String(p.companyId ?? ""),
    media,
    overlays: overlays?.length ? overlays : undefined,
    caption,
    visibility: p.visibility === "network" ? "network" : "public",
    likeCount: Math.max(0, Number(p.likeCount ?? 0)),
    likedByMe: !!(p.likedByMe ?? p.liked ?? p.isLiked),
    commentCount: Math.max(0, Number(p.commentCount ?? p.comments ?? 0)),
    createdAt,
    isAnnouncement: !!p.isAnnouncement,
    isHiring: !!p.isHiring,
    commentsDisabled: !!p.commentsDisabled,
    likeCountHidden: !!p.likeCountHidden,
  };
}

export function getCorporateCaption(post: {
  caption?: string;
  text?: string;
}): string {
  if (typeof post.caption === "string" && post.caption.trim().length > 0) {
    return post.caption;
  }
  if (typeof post.text === "string") return post.text;
  return "";
}

export function sortCorporateMedia(media: CorporateMediaItem[]): CorporateMediaItem[] {
  return [...media].sort((a, b) => a.order - b.order);
}
