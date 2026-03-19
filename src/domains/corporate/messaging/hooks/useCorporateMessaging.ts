// src/domains/corporate/messaging/hooks/useCorporateMessaging.ts

import { useEffect, useMemo, useState } from "react";

import { corporateMessagingService } from "../services/corporateMessagingService";
import {
  CorporateConversation,
  CorporateMessage,
} from "../types/messaging.types";

/* ------------------------------------------------------------------ */
/* INBOX HOOK                                                          */
/* ------------------------------------------------------------------ */

export function useCorporateInbox() {
  const [conversations, setConversations] = useState<CorporateConversation[]>(
    []
  );

  async function refresh() {
    const list = await corporateMessagingService.listConversations();
    setConversations(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  return { conversations, refresh };
}

/* ------------------------------------------------------------------ */
/* CONVERSATION HOOK                                                   */
/* ------------------------------------------------------------------ */

export function useCorporateConversation(conversationId: string) {
  const [conversation, setConversation] =
    useState<CorporateConversation | null>(null);
  const [messages, setMessages] = useState<CorporateMessage[]>([]);

  async function refresh() {
    if (!conversationId) return;

    const c = await corporateMessagingService.getConversation(conversationId);
    const m = await corporateMessagingService.listMessages(conversationId);

    setConversation(c);
    setMessages(m);

    await corporateMessagingService.markRead(conversationId);
  }

  useEffect(() => {
    refresh();
    // conversationId değişince yenile
  }, [conversationId]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !conversationId) return;

    await corporateMessagingService.sendMessage({
      conversationId,
      sender: "company", // şirket paneli
      type: "text",
      text: trimmed,
    });

    await refresh();
  }

  /**
   * Geriye dönük uyumluluk:
   * Eski ekranlar sendText kullanıyorsa kırılmasın
   */
  const sendText = sendMessage;

  const title = useMemo(() => {
    if (!conversation) return "Mesajlar";
    return conversation.candidateName;
  }, [conversation]);

  return {
    conversation,
    messages,
    title,
    refresh,
    sendMessage,
    sendText,
  };
}