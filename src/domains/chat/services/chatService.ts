import type {
  Call,
  CallStatus,
  ChatId,
  CallType,
  Chat,
  Conference,
  Message,
  MessageId,
  UserId,
} from "../types/chat.types";

import { chatModerationService } from "./chatModerationService";
import { chatRealtimeAdapter } from "../realtime/chatRealtimeAdapter";

/* ------------------------------------------------------------------ */
/* MESSAGE DELETE (UI-ONLY)                                            */
/* ------------------------------------------------------------------ */

const hiddenForMe = new Map<ChatId, Set<MessageId>>();
const deletedForEveryone = new Set<MessageId>();

function getHiddenSet(chatId: ChatId): Set<MessageId> {
  if (!hiddenForMe.has(chatId)) hiddenForMe.set(chatId, new Set());
  return hiddenForMe.get(chatId)!;
}

/**
 * chatService (UI-only, backend-ready)
 * - Sadece Chat domain
 * - State tek kaynaktan okunur
 * - C10: CallStatus normalize edilir
 * - C5.1: Group calls (ADD-ONLY)
 */

/** 15 minutes – message can be edited only if Date.now() - message.createdAt < EDIT_WINDOW_MS */
const EDIT_WINDOW_MS = 15 * 60 * 1000;
const DELETE_FOR_ALL_WINDOW_MS = 5 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* C7 / C8 TYPES (SERVICE-ONLY)                                        */
/* ------------------------------------------------------------------ */

export type CallFilterKey =
  | "all"
  | "incoming"
  | "outgoing"
  | "missed"
  | "audio"
  | "video";

export type CallSearchParams = {
  query?: string;
  filter?: CallFilterKey;
};

export type CallExportFormat = "txt" | "json";

/* ------------------------------------------------------------------ */
/* C9 — BACKEND-READY EXPORT CONTRACT                                  */
/* ------------------------------------------------------------------ */

export type CallsExportPayload = {
  domain: "chat";
  feature: "calls";
  generatedAt: number;
  format: CallExportFormat;
  filters?: CallSearchParams;
  total: number;
  items: Array<{
    id: string;
    fromUserId: string;
    toUserId: string;
    type: CallType;
    status: CallStatus;
    direction?: string;
    startedAt: number;
    durationSec?: number;
  }>;
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

function normalize(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

function matchesFilter(call: Call, filter?: CallFilterKey) {
  if (!filter || filter === "all") return true;

  switch (filter) {
    case "incoming":
      return call.direction === "incoming";
    case "outgoing":
      return call.direction === "outgoing";
    case "missed":
      return call.status === "missed";
    case "audio":
      return call.type === "audio";
    case "video":
      return call.type === "video";
    default:
      return true;
  }
}

function formatDuration(sec?: number) {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString().slice(0, 5)}`;
}

function renderCallsTxt(payload: CallsExportPayload): string {
  if (!payload.total) return "Kayıt yok.";

  return payload.items
    .map((c) =>
      [
        `Kişi: ${c.toUserId}`,
        `Tür: ${c.type === "video" ? "Görüntülü" : "Sesli"}`,
        `Durum: ${c.status}`,
        `Yön: ${c.direction ?? "—"}`,
        `Süre: ${formatDuration(c.durationSec)}`,
        `Tarih: ${formatDate(c.startedAt)}`,
        `---`,
      ].join("\n")
    )
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* SERVICE                                                             */
/* ------------------------------------------------------------------ */

class ChatService {
  private chats: Chat[] = [
    {
      id: "1",
      type: "direct",
      participantIds: ["u1"],
      unreadCount: 2,
      title: "Demo Sohbet",
    },
  ];

  private calls: Call[] = [];
  private conferences: Conference[] = [];
  private pendingMessages = new Map<ChatId, any[]>();

  /* ---------------- REALTIME ---------------- */

  private unsubscribeRealtime?: () => void;
  private badgeListeners = new Set<() => void>();

  private notifyBadgeChange(): void {
    this.badgeListeners.forEach((l) => l());
  }

  /** Subscribe to badge summary changes (e.g. after markAsSeen) */
  subscribeBadgeChange(listener: () => void): () => void {
    this.badgeListeners.add(listener);
    return () => this.badgeListeners.delete(listener);
  }

  connectRealtime() {
    chatRealtimeAdapter.connect().then(() => {
      this.unsubscribeRealtime = chatRealtimeAdapter.subscribe(() => {});
    });
  }

  disconnectRealtime() {
    this.unsubscribeRealtime?.();
    chatRealtimeAdapter.disconnect();
  }

  /* ---------------- CHAT ---------------- */

  getChats() {
    return this.chats;
  }

  /**
   * getChat (UI-only)
   * - ChatRoomScreen / ChatHeader gibi yerler tek kaynaktan okur
   * - Mock modda chat yoksa güvenli şekilde "on-demand" oluşturulur
   */
  getChat(chatId: string): Chat {
    const existing = this.chats.find((c) => c.id === chatId);
    if (existing) return existing;

    // On-demand mock chat
    const isGroup = chatId.startsWith("group_");
    const isDirect = chatId.startsWith("direct_");

    const participantIds: UserId[] = isDirect
      ? [chatId.replace("direct_", "")]
      : isGroup
        ? ["u1", "u2", "u3"]
        : ["u1"];

    const chat: Chat = {
      id: chatId,
      type: isGroup ? "group" : "direct",
      participantIds,
      unreadCount: 0,
      title: isGroup ? "Grup Sohbet" : "Sohbet",
    };

    // Listeye ekle (en üste)
    this.chats.unshift(chat);
    return chat;
  }

  /* ---------------- PENDING MESSAGES (UI-ONLY) ---------------- */

  enqueuePendingMessage(chatId: ChatId, message: any) {
    const list = this.pendingMessages.get(chatId) ?? [];
    list.push(message);
    this.pendingMessages.set(chatId, list);
  }

  consumePendingMessages(chatId: ChatId): any[] {
    const list = this.pendingMessages.get(chatId) ?? [];
    this.pendingMessages.delete(chatId);
    return list;
  }

  markAsSeen(chatId: string) {
    const chat = this.chats.find((c) => c.id === chatId);
    if (chat) chat.unreadCount = 0;
    this.notifyBadgeChange();
  }

  /**
   * Badge summary
   * - UI rozetleri için tek kaynak
   */
  getBadgeSummary() {
    const unreadChats = this.chats.filter((c) => (c.unreadCount ?? 0) > 0).length;
    const unreadMessages = this.chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
    const missedCalls = this.calls.filter((c) => c.status === "missed").length;

    return {
      unreadChats,
      unreadMessages,
      missedCalls,
    };
  }

  /* ---------------- MESSAGE DELETE (UI-ONLY) ---------------- */

  deleteForMe(chatId: ChatId, messageId: MessageId) {
    getHiddenSet(chatId).add(messageId);
  }

  deleteForEveryone(chatId: ChatId, messageId: MessageId) {
    deletedForEveryone.add(messageId);
  }

  isHiddenForMe(chatId: ChatId, messageId: MessageId): boolean {
    return getHiddenSet(chatId).has(messageId);
  }

  isDeletedForEveryone(messageId: MessageId): boolean {
    return deletedForEveryone.has(messageId);
  }

  /**
   * Edit a message (UI-only): updates content, sets edited flag and editedAt.
   * Caller is responsible for updating message list state (e.g. setMessages).
   */
  editMessage(messageId: MessageId, newText: string): { text: string; editedAt: number } | null {
    const trimmed = newText.trim();
    if (!trimmed) return null;
    const editedAt = Date.now();
    return { text: trimmed, editedAt };
  }

  /* ---------------- MESSAGE RULES ---------------- */

  canEditMessage(message: Message, userId: UserId) {
    return (
      message.senderId === userId &&
      Date.now() - message.createdAt <= EDIT_WINDOW_MS
    );
  }

  /** UI-friendly: own message, has text, within edit window. */
  canEditMessageForUI(
    message: { mine: boolean; createdAt: number; text?: string },
    userId: UserId
  ): boolean {
    return (
      message.mine &&
      !!message.text &&
      Date.now() - message.createdAt <= EDIT_WINDOW_MS
    );
  }

  canDeleteForAll(message: Message, userId: UserId) {
    return (
      message.senderId === userId &&
      Date.now() - message.createdAt <= DELETE_FOR_ALL_WINDOW_MS
    );
  }

  /* ------------------------------------------------------------------ */
  /* CALLS — DIRECT (MEVCUT DAVRANIŞ)                                   */
  /* ------------------------------------------------------------------ */

  startCall(fromUserId: string, toUserId: string, type: CallType): Call {
    const call: Call = {
      id: Date.now().toString(),
      fromUserId,
      toUserId,
      type,
      startedAt: Date.now(),
      status: "ringing",
      direction: "outgoing",
    };

    this.calls.unshift(call);
    return call;
  }

  /* ------------------------------------------------------------------ */
  /* 🔒 C5.1 — GROUP CALLS (ADD-ONLY)                                   */
  /* ------------------------------------------------------------------ */

  startGroupCall(
    hostUserId: UserId,
    chatId: string,
    participantIds: UserId[],
    type: CallType
  ): Call {
    const call: Call = {
      id: Date.now().toString(),
      fromUserId: hostUserId,
      toUserId: chatId, // geri uyumluluk
      chatId,
      participantIds,
      type,
      startedAt: Date.now(),
      status: "ringing",
      direction: "outgoing",
    };

    this.calls.unshift(call);
    return call;
  }

  isGroupCall(call: Call): boolean {
    return !!call.chatId && !!call.participantIds?.length;
  }

  /* ------------------------------------------------------------------ */
  /* 🔒 C10 — TEK BİTİŞ NOKTASI                                          */
  /* ------------------------------------------------------------------ */

  finishCall(callId: string, status: CallStatus) {
    const call = this.calls.find((c) => c.id === callId);
    if (!call) return;
    if (status === "ringing") return;

    call.status = status;
    call.endedAt = Date.now();
    call.durationSec = Math.max(
      0,
      Math.floor((call.endedAt - call.startedAt) / 1000)
    );
  }

  deleteCall(callId: string) {
    this.calls = this.calls.filter((c) => c.id !== callId);
  }

  getCall(callId: string) {
    return this.calls.find((c) => c.id === callId);
  }

  getCallHistory() {
    return this.calls;
  }

  /* ---------------- C7 SEARCH ---------------- */

  searchCalls(params?: CallSearchParams): Call[] {
    const q = normalize(params?.query);

    return this.calls
      .filter((c) => matchesFilter(c, params?.filter))
      .filter(
        (c) =>
          !q ||
          normalize(c.toUserId).includes(q) ||
          normalize(c.fromUserId).includes(q)
      )
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  /* ---------------- C8 / C9 EXPORT ---------------- */

  buildCallsExportPayload(
    params: CallSearchParams | undefined,
    format: CallExportFormat
  ): CallsExportPayload {
    const list = this.searchCalls(params);

    return {
      domain: "chat",
      feature: "calls",
      generatedAt: Date.now(),
      format,
      filters: params,
      total: list.length,
      items: list.map((c) => ({
        id: c.id,
        fromUserId: c.fromUserId,
        toUserId: c.toUserId,
        type: c.type,
        status: c.status,
        direction: c.direction,
        startedAt: c.startedAt,
        durationSec: c.durationSec,
      })),
    };
  }

  exportCalls(params: CallSearchParams | undefined, format: CallExportFormat) {
    const payload = this.buildCallsExportPayload(params, format);
    return format === "json"
      ? JSON.stringify(payload.items, null, 2)
      : renderCallsTxt(payload);
  }

  /* ---------------- CONFERENCE ---------------- */

  createConference(hostUserId: string, title?: string): Conference {
    const conf: Conference = {
      id: Date.now().toString(),
      title,
      hostUserId,
      startedAt: Date.now(),
      status: "starting",
      participants: [
        {
          userId: hostUserId,
          joinedAt: Date.now(),
          isMuted: false,
          isVideoEnabled: true,
          isScreenSharing: false,
        },
      ],
      screenShareStatus: "off",
    };

    this.conferences.unshift(conf);
    return conf;
  }

  getConference(conferenceId: string): Conference | undefined {
    return this.conferences.find((c) => c.id === conferenceId);
  }

  startConference(conferenceId: string) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    if (conf.status === "ended") return;
    conf.status = "active";
  }

  endConference(conferenceId: string) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    if (conf.status === "ended") return;

    conf.status = "ended";
    conf.endedAt = Date.now();
    conf.screenShareStatus = "off";
    conf.participants = conf.participants.map((p) =>
      p.leftAt ? p : { ...p, leftAt: Date.now(), isScreenSharing: false }
    );
  }

  joinConference(conferenceId: string, userId: string) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    if (conf.status === "ended") return;

    const exists = conf.participants.some((p) => p.userId === userId && !p.leftAt);
    if (exists) return;

    conf.participants.push({
      userId,
      joinedAt: Date.now(),
      isMuted: false,
      isVideoEnabled: true,
      isScreenSharing: false,
    });
  }

  leaveConference(conferenceId: string, userId: string) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    const p = conf.participants.find((x) => x.userId === userId && !x.leftAt);
    if (!p) return;

    p.leftAt = Date.now();
    p.isScreenSharing = false;

    // Eğer screen share kapanacaksa
    const anySharing = conf.participants.some((x) => !x.leftAt && x.isScreenSharing);
    if (!anySharing) conf.screenShareStatus = "off";

    // Host ayrıldıysa konferansı bitir (UI-only güvenli davranış)
    if (userId === conf.hostUserId) {
      this.endConference(conferenceId);
    }
  }

  setParticipantMuted(conferenceId: string, userId: string, muted: boolean) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    const p = conf.participants.find((x) => x.userId === userId && !x.leftAt);
    if (!p) return;
    p.isMuted = muted;
  }

  setParticipantVideo(conferenceId: string, userId: string, enabled: boolean) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    const p = conf.participants.find((x) => x.userId === userId && !x.leftAt);
    if (!p) return;
    p.isVideoEnabled = enabled;
  }

  startScreenShare(conferenceId: string, ownerUserId: string) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    if (conf.status === "ended") return;

    // Tek paylaşan olsun
    conf.participants.forEach((p) => {
      if (p.userId !== ownerUserId) p.isScreenSharing = false;
    });

    const owner = conf.participants.find((p) => p.userId === ownerUserId && !p.leftAt);
    if (!owner) return;

    owner.isScreenSharing = true;
    conf.screenShareStatus = "on";
  }

  stopScreenShare(conferenceId: string) {
    const conf = this.getConference(conferenceId);
    if (!conf) return;
    conf.participants.forEach((p) => {
      p.isScreenSharing = false;
    });
    conf.screenShareStatus = "off";
  }
}

export function canSendChatMessage(userId: string) {
  if (chatModerationService.isUserBlocked(userId)) {
    return false;
  }
  if (!chatModerationService.canSendMessage(userId)) {
    return false;
  }
  return true;
}

export const chatService = new ChatService();