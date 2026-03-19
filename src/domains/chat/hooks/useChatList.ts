import { chatService } from "../services/chatService";
import { Chat } from "../types/chat.types";

/**
 * useChatList
 * - Saf kişisel sohbet listesi
 * - Filtre / kategori YOK
 */
export function useChatList() {
  const chats: Chat[] = chatService.getChats();

  return {
    chats,
  };
}
