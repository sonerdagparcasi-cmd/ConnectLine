// src/domains/corporate/messaging/services/corporateMessagingService.ts

import {
  CorporateConversation,
  CorporateMessage,
  CorporateMessageType,
  CorporateSender,
} from "../types/messaging.types";

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* MOCK DATA (backend gelene kadar)                                    */
/* ------------------------------------------------------------------ */

const CONVERSATIONS: CorporateConversation[] = [
  {
    id: "c1",
    candidateName: "Ahmet Yılmaz",
    companyName: "ConnectLine Tech",
    lastMessageText: "Merhaba, uygun olduğun bir zaman var mı?",
    lastMessageAt: Date.now() - 2 * 60 * 60 * 1000,
    unreadCount: 2,
    jobId: "j1",
    applicationId: "a1",
  },
  {
    id: "c2",
    candidateName: "Zeynep Kaya",
    companyName: "ConnectLine Tech",
    lastMessageText: "CV’nizi aldık, teşekkürler.",
    lastMessageAt: Date.now() - 10 * 60 * 60 * 1000,
    unreadCount: 0,
    jobId: "j1",
    applicationId: "a2",
  },
];

const MESSAGES: CorporateMessage[] = [
  {
    id: "m1",
    conversationId: "c1",
    sender: "company",
    type: "text",
    text: "Merhaba Ahmet, başvurunu inceledik. Kısa bir görüşme planlayabilir miyiz?",
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
  },
  {
    id: "m2",
    conversationId: "c1",
    sender: "candidate",
    type: "text",
    text: "Merhaba, evet uygun. Yarın 15:00 olabilir.",
    createdAt: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    id: "m3",
    conversationId: "c1",
    sender: "company",
    type: "system",
    text: "Sistem: Görüşme talebi oluşturuldu.",
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
  },
];

/* ------------------------------------------------------------------ */
/* SERVICE                                                             */
/* ------------------------------------------------------------------ */

class CorporateMessagingService {
  /* ----------------------------- */
  /* CONVERSATIONS                 */
  /* ----------------------------- */

  async listConversations(): Promise<CorporateConversation[]> {
    // backend gelince companyId / userId scoped olacak
    return [...CONVERSATIONS].sort(
      (a, b) => b.lastMessageAt - a.lastMessageAt
    );
  }

  async getConversation(
    conversationId: string
  ): Promise<CorporateConversation | null> {
    return CONVERSATIONS.find((c) => c.id === conversationId) ?? null;
  }

  async markRead(conversationId: string): Promise<void> {
    const c = CONVERSATIONS.find((x) => x.id === conversationId);
    if (c) {
      c.unreadCount = 0;
    }
  }

  /* ----------------------------- */
  /* MESSAGES                      */
  /* ----------------------------- */

  async listMessages(
    conversationId: string
  ): Promise<CorporateMessage[]> {
    return MESSAGES
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async sendMessage(params: {
    conversationId: string;
    sender: CorporateSender;
    type: CorporateMessageType;
    text?: string;
    fileName?: string;
    fileUri?: string;
  }): Promise<CorporateMessage> {
    const now = Date.now();

    const msg: CorporateMessage = {
      id: makeId(),
      conversationId: params.conversationId,
      sender: params.sender,
      type: params.type,
      text: params.text,
      fileName: params.fileName,
      fileUri: params.fileUri,
      createdAt: now,
    };

    MESSAGES.push(msg);

    const c = CONVERSATIONS.find(
      (x) => x.id === params.conversationId
    );

    if (c) {
      // last message summary
      if (msg.type === "file") {
        c.lastMessageText = `Dosya: ${msg.fileName ?? "dosya"}`;
      } else if (msg.type === "system") {
        c.lastMessageText = msg.text ?? "Sistem mesajı";
      } else {
        c.lastMessageText = msg.text ?? "";
      }

      c.lastMessageAt = now;

      // unread logic (mock)
      if (params.sender === "candidate") {
        c.unreadCount = (c.unreadCount ?? 0) + 1;
      }
    }

    return msg;
  }
}

/* ------------------------------------------------------------------ */
/* EXPORT                                                              */
/* ------------------------------------------------------------------ */

export const corporateMessagingService =
  new CorporateMessagingService();