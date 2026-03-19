import type { UserId } from "../types/chat.types";

type ReportReason =
  | "spam"
  | "abuse"
  | "harassment"
  | "scam"
  | "other";

type MessageReport = {
  id: string;
  messageId: string;
  chatId: string;
  reporterId: UserId;
  reason: ReportReason;
  createdAt: number;
};

const blockedUsers = new Set<UserId>();

const reports: MessageReport[] = [];

const messageRateMap = new Map<UserId, number[]>();

const MESSAGE_RATE_LIMIT = 20;
const RATE_WINDOW = 10000;

function now() {
  return Date.now();
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanupOld(userId: UserId) {
  const list = messageRateMap.get(userId) ?? [];
  const filtered = list.filter((t) => now() - t < RATE_WINDOW);
  messageRateMap.set(userId, filtered);
}

export const chatModerationService = {
  blockUser(userId: UserId) {
    blockedUsers.add(userId);
  },

  unblockUser(userId: UserId) {
    blockedUsers.delete(userId);
  },

  isUserBlocked(userId: UserId) {
    return blockedUsers.has(userId);
  },

  reportMessage(params: {
    messageId: string;
    chatId: string;
    reporterId: UserId;
    reason: ReportReason;
  }) {
    const report: MessageReport = {
      id: generateId(),
      messageId: params.messageId,
      chatId: params.chatId,
      reporterId: params.reporterId,
      reason: params.reason,
      createdAt: now(),
    };

    reports.push(report);

    return report;
  },

  getReports() {
    return [...reports];
  },

  canSendMessage(userId: UserId) {
    cleanupOld(userId);

    const list = messageRateMap.get(userId) ?? [];

    if (list.length >= MESSAGE_RATE_LIMIT) {
      return false;
    }

    list.push(now());

    messageRateMap.set(userId, list);

    return true;
  },
};
