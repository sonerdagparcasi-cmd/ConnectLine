// src/domains/chat/types/chat.types.ts
// -----------------------------------------------------------------------------
// 🔒 CHAT DOMAIN – SOURCE OF TRUTH TYPES
// Kurallar:
// - Add-only (geri uyum bozulmaz)
// - UI-only ama backend-ready
// - Chat domain dışına SIZMAZ
// -----------------------------------------------------------------------------

export type ChatId = string;
export type MessageId = string;
export type UserId = string;
export type PhoneNumber = string;

/* ----------------------------- CHAT CORE ----------------------------- */

export type ChatType = "direct" | "group";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "seen"
  | "listening"
  | "listened"
  | "failed";

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "file"
  | "audio"
  | "location"
  | "contact";

export type MessageIntegrityStatus = "verified" | "invalid";
export type MessageIntegrityAlgorithm = "fnv1a-32";

export type MessageIntegrityMeta = {
  version: 1;
  algorithm: MessageIntegrityAlgorithm;
  salt: "connectline-chat-v1";
  contentHash: string;
  signature: string;
  verifiedAt: number;
  status: MessageIntegrityStatus;
};

export type MessageReaction = {
  emoji: string;
  userId: UserId;
  createdAt?: number;
};

export interface Chat {
  id: ChatId;
  type: ChatType;
  participantIds: UserId[];
  title?: string;
  lastMessage?: Message;
  unreadCount: number;
  groupInfo?: GroupInfo;
}

export interface Message {
  id: MessageId;
  chatId: ChatId;
  senderId: UserId;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  createdAt: number;
  status: MessageStatus;
  editedAt?: number;
  reactions?: MessageReaction[];
  integrity?: MessageIntegrityMeta;
}

/* ----------------------------- CONTACTS ----------------------------- */

export interface Contact {
  id: string;
  displayName: string;
  phoneNumber: PhoneNumber;
  userId?: UserId;
  avatarUrl?: string;
}

export type ContactsPermission = "notAsked" | "granted" | "denied";

/* ----------------------------- GROUP ----------------------------- */

export type GroupRole = "owner" | "admin" | "member";

export interface GroupMember {
  userId: UserId;
  name: string;
  avatarUrl?: string;
  role: GroupRole;
}

export interface GroupInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  members: GroupMember[];
}

/* ----------------------------- CALLS ----------------------------- */

export type CallType = "audio" | "video";

export type CallStatus =
  | "ringing"
  | "completed"
  | "missed"
  | "rejected";

export type CallDirection = "incoming" | "outgoing";

export interface Call {
  id: string;
  type: CallType;
  fromUserId: UserId;
  toUserId: UserId;
  startedAt: number;
  endedAt?: number;
  durationSec?: number;
  status: CallStatus;
  direction?: CallDirection;
  chatId?: ChatId;
  participantIds?: UserId[];
}

/* --------------------------- CONFERENCE --------------------------- */

export type ConferenceStatus = "starting" | "active" | "ended";
export type ScreenShareStatus = "off" | "starting" | "on";

export interface ConferenceParticipant {
  userId: UserId;
  joinedAt: number;
  leftAt?: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

export interface Conference {
  id: string;
  title?: string;
  hostUserId: UserId;
  startedAt: number;
  endedAt?: number;
  status: ConferenceStatus;
  participants: ConferenceParticipant[];
  screenShareStatus: ScreenShareStatus;
}

/* --------------------------- BADGES --------------------------- */

export type ChatBadgeSummary = {
  unreadChats: number;
  unreadMessages: number;
  missedCalls: number;
};

/* --------------------------- 🔒 CHAT SETTINGS --------------------------- */
/**
 * ChatSettings
 *
 * - ChatSettingsScreen ile birebir uyumlu
 * - UI-only ama backend-ready
 * - Add-only (ileride daha da genişleyebilir)
 */
export type ChatSettings = {
  /* ---------- Privacy ---------- */
  showReadReceipts: boolean; // okundu bilgisi
  showOnline: boolean; // çevrimiçi durumu
  showLastSeen: boolean; // son görülme

  /* ---------- Notifications ---------- */
  notificationsEnabled: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;

  /* ---------- Chat Behavior ---------- */
  autoPlayVoice: boolean;
  autoDownloadMedia: boolean;

  /* ---------- Appearance ---------- */
  fontSize: "small" | "medium" | "large";
  wallpaper:
    | "none"
    | { type: "color"; value: string }
    | { type: "image"; uri: string };

  /* ---------- Security ---------- */
  blockedUsers: UserId[]; // engellenen kullanıcılar
  mutedUsers: UserId[]; // sessize alınan kullanıcılar (bildirim)
};
