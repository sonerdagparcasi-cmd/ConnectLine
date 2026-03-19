import { useState } from "react";
import { chatService } from "../services/chatService";
import { Chat } from "../types/chat.types";

/**
 * useChat
 * - UI sadece burayı bilir
 * - Status / unread logic gizlidir
 */
export function useChat(chatId?: string) {
  const [chat, setChat] = useState<Chat | undefined>(
    chatId ? chatService.getChat(chatId) : undefined
  );

  return {
    chat,
    markSeen: () => {
      if (!chatId) return;
      chatService.markAsSeen(chatId);
      setChat(chatService.getChat(chatId));
    },
  };
}