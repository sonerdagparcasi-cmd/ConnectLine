// src/domains/chat/utils/chatMessageUtils.ts

import { AttachmentType } from "../components/ChatComposerSheet";
import type {
  MessageIntegrityMeta,
  MessageIntegrityStatus,
} from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* TYPES (🔒 KİLİTLİ)                                                   */
/* ------------------------------------------------------------------ */

export type MediaKind = "image" | "video" | "file" | "contact" | "location";

export type UiMessagePreview = {
  text?: string;
  audio?: unknown;
  media?: {
    kind: MediaKind;
    fileName?: string;
  };
  integrity?: MessageIntegrityMeta;
};

/* ------------------------------------------------------------------ */
/* ATTACHMENT HELPERS                                                  */
/* ------------------------------------------------------------------ */

export function isMediaAttachment(
  type: AttachmentType
): type is MediaKind {
  return (
    type === "image" ||
    type === "video" ||
    type === "file" ||
    type === "contact" ||
    type === "location"
  );
}

/* ------------------------------------------------------------------ */
/* DATE / TIME HELPERS                                                 */
/* ------------------------------------------------------------------ */

export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatDateLabel(ts: number) {
  const today = startOfDay(Date.now());
  const day = startOfDay(ts);
  const diff = (today - day) / 86400000;

  if (diff === 0) return "Bugün";
  if (diff === 1) return "Dün";

  return new Date(ts).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* TEXT HELPERS                                                        */
/* ------------------------------------------------------------------ */

export function clampText(s: string, max = 60) {
  const t = (s ?? "").trim();
  if (!t) return "—";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/* ------------------------------------------------------------------ */
/* MESSAGE PREVIEW                                                     */
/* ------------------------------------------------------------------ */

export function getMessagePreview(m: UiMessagePreview) {
  if (m.text?.trim()) return clampText(m.text, 70);
  if (m.audio) return "🎤 Sesli mesaj";
  if (m.media) {
    if (m.media.kind === "image") return "🖼️ Fotoğraf";
    if (m.media.kind === "video") return "🎬 Video";
    if (m.media.kind === "file")
      return `📎 Dosya${m.media.fileName ? `: ${m.media.fileName}` : ""}`;
    if (m.media.kind === "contact") return "👤 Kişi";
    if (m.media.kind === "location") return "📍 Konum";
  }
  return "—";
}

/* ------------------------------------------------------------------ */
/* MESSAGE INTEGRITY                                                   */
/* ------------------------------------------------------------------ */

export function getMessageIntegrityStatus(message?: {
  integrity?: MessageIntegrityMeta;
}): MessageIntegrityStatus {
  return message?.integrity?.status ?? "invalid";
}

export function isMessageIntegrityVerified(message?: {
  integrity?: MessageIntegrityMeta;
}): boolean {
  return getMessageIntegrityStatus(message) === "verified";
}

/* ------------------------------------------------------------------ */
/* AUDIO SPEED                                                         */
/* ------------------------------------------------------------------ */

const SPEEDS: Array<1 | 1.5 | 2> = [1, 1.5, 2];

export function nextSpeed(cur?: 1 | 1.5 | 2) {
  const idx = SPEEDS.indexOf(cur ?? 1);
  return SPEEDS[(idx + 1) % SPEEDS.length];
}
