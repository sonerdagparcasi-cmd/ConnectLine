// src/domains/chat/services/chatMessageFactory.ts

import { AttachmentType } from "../components/ChatComposerSheet";
import {
  createMessageIntegrity,
  verifyMessageIntegrity,
} from "./chatMessageSecurityService";
import type {
  MessageIntegrityMeta,
  MessageStatus,
} from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* TYPES (UI-ONLY, CHAT DOMAIN)                                        */
/* ------------------------------------------------------------------ */

export type MediaKind =
  | "image"
  | "video"
  | "file"
  | "contact"
  | "location";

export type ReplyMeta = {
  messageId: string;
  preview: string;
  mine: boolean;
};

export type ForwardMeta = {
  fromLabel: string;
};

export type MediaUploadStatus = "idle" | "uploading" | "uploaded" | "failed";
export type MediaDownloadStatus = "idle" | "downloading" | "downloaded" | "failed";

export type UiMessage = {
  id: string;
  mine: boolean;
  status: MessageStatus;
  createdAt: number;

  text?: string;

  storyReply?: {
    storyId: string;
    storyOwnerId: string;
    storyMediaUri?: string | null;
  };

  audio?: {
    uri: string;
    speed?: 1 | 1.5 | 2;
    durationSec?: number;
  };

  media?: {
    kind: MediaKind;
    uri?: string;
    fileName?: string;
    caption?: string;
    uploadStatus?: MediaUploadStatus;
    downloadStatus?: MediaDownloadStatus;
    uploadProgress?: number;
    /** contact kind */
    contactName?: string;
    contactPhone?: string;
    /** location kind */
    locationLat?: number;
    locationLng?: number;
    locationLabel?: string;
  };

  reminder?: {
    reminderId: string;
    note: string;
    date: string;
    time: string;
    targetUserIds: string[];
  };

  replyTo?: ReplyMeta;
  forwarded?: ForwardMeta;
  integrity?: MessageIntegrityMeta;
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function makeId() {
  return Date.now().toString();
}

function withIntegrity<T extends UiMessage>(message: T): T {
  return {
    ...message,
    integrity: createMessageIntegrity(message),
  };
}

export function verifyUiMessageIntegrity<T extends UiMessage>(message: T): T {
  return {
    ...message,
    integrity: verifyMessageIntegrity(message),
  };
}

export function getMessagePreview(m: UiMessage): string {
  if (m.text?.trim()) return m.text;
  if (m.audio) return "🎤 Sesli mesaj";
  if (m.reminder) return `⏰ ${m.reminder.note}`;
  if (m.media) {
    switch (m.media.kind) {
      case "image":
        return "🖼️ Fotoğraf";
      case "video":
        return "🎬 Video";
      case "file":
        return `📎 Dosya${m.media.fileName ? `: ${m.media.fileName}` : ""}`;
      case "contact":
        return "👤 Kişi";
      case "location":
        return "📍 Konum";
    }
  }
  return "—";
}

export function buildReplyMeta(target: UiMessage): ReplyMeta {
  return {
    messageId: target.id,
    preview: getMessagePreview(target),
    mine: target.mine,
  };
}

/* ------------------------------------------------------------------ */
/* FACTORY FUNCTIONS (🔒 C3.y CORE)                                    */
/* ------------------------------------------------------------------ */

export function createTextMessage(params: {
  text: string;
  replyTo?: ReplyMeta;
  status?: MessageStatus;
}): UiMessage {
  return withIntegrity({
    id: makeId(),
    mine: true,
    status: params.status ?? "sent",
    createdAt: Date.now(),
    text: params.text.trim(),
    replyTo: params.replyTo,
  });
}

export function createStoryReplyMessage(params: {
  text: string;
  storyId: string;
  storyOwnerId: string;
  storyMediaUri?: string | null;
  status?: MessageStatus;
}): UiMessage {
  return withIntegrity({
    id: makeId(),
    mine: true,
    status: params.status ?? "sent",
    createdAt: Date.now(),
    text: params.text.trim(),
    storyReply: {
      storyId: params.storyId,
      storyOwnerId: params.storyOwnerId,
      storyMediaUri: params.storyMediaUri ?? null,
    },
  });
}

export function createAudioMessage(params: {
  uri: string;
  replyTo?: ReplyMeta;
}): UiMessage {
  return withIntegrity({
    id: makeId(),
    mine: true,
    status: "sent",
    createdAt: Date.now(),
    audio: {
      uri: params.uri,
      speed: 1,
    },
    replyTo: params.replyTo,
  });
}

export function createMediaMessage(params: {
  type: AttachmentType;
  uri?: string;
  fileName?: string;
  caption?: string;
  replyTo?: ReplyMeta;
  uploadStatus?: MediaUploadStatus;
  contactName?: string;
  contactPhone?: string;
  locationLat?: number;
  locationLng?: number;
  locationLabel?: string;
}): UiMessage {
  if (
    params.type !== "image" &&
    params.type !== "video" &&
    params.type !== "file" &&
    params.type !== "contact" &&
    params.type !== "location"
  ) {
    throw new Error("Invalid media attachment type");
  }

  return withIntegrity({
    id: makeId(),
    mine: true,
    status: "sent",
    createdAt: Date.now(),
    media: {
      kind: params.type,
      uri: params.uri,
      fileName: params.fileName,
      caption: params.caption,
      uploadStatus: params.uploadStatus ?? "uploaded",
      contactName: params.contactName,
      contactPhone: params.contactPhone,
      locationLat: params.locationLat,
      locationLng: params.locationLng,
      locationLabel: params.locationLabel,
    },
    replyTo: params.replyTo,
  });
}

export function createReminderMessage(params: {
  reminderId: string;
  note: string;
  date: string;
  time: string;
  targetUserIds: string[];
  replyTo?: ReplyMeta;
}): UiMessage {
  return withIntegrity({
    id: makeId(),
    mine: true,
    status: "sent",
    createdAt: Date.now(),
    reminder: {
      reminderId: params.reminderId,
      note: params.note,
      date: params.date,
      time: params.time,
      targetUserIds: params.targetUserIds,
    },
    replyTo: params.replyTo,
  });
}

/* ------------------------------------------------------------------ */
/* FORWARD / COPY (UI-ONLY HELPERS)                                    */
/* ------------------------------------------------------------------ */

export function createForwardedMessage(
  source: UiMessage,
  fromLabel = "İletildi"
): UiMessage {
  return withIntegrity({
    ...source,
    id: makeId(),
    mine: true,
    status: "sent",
    createdAt: Date.now(),
    forwarded: { fromLabel },
  });
}
