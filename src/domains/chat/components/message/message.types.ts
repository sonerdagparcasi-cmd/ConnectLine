// src/domains/chat/components/message/message.types.ts
// Shared types for message components – chat domain only

import type { MessageStatus } from "../../types/chat.types";

export type MessageReplyMeta = {
  messageId: string;
  preview: string;
  mine: boolean;
  senderName?: string;
};

export type MessageForwardMeta = {
  fromLabel: string;
};

export type MessageReaction = {
  emoji: string;
  byMe: boolean;
  count?: number;
};

export interface MessageBaseProps {
  isMine: boolean;
  status: MessageStatus;
  createdAt: number;
  editedAt?: number;
  forwarded?: MessageForwardMeta;
  replyTo?: MessageReplyMeta;
  reactions?: MessageReaction[];
  senderName?: string;
  senderAvatarUri?: string;
}

export function formatMessageTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
