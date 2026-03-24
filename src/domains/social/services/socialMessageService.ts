type SocialMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: "text" | "story_reply" | "message" | "story_emoji";
  storyId?: string;
  createdAt: string;
};

type PushMessageInput = {
  id?: string;
  type: "text" | "story_reply" | "message" | "story_emoji";
  userId: string;
  text: string;
  storyId?: string;
  targetUserId?: string;
};

type ConversationLastMessage = {
  id: string;
  type: "text" | "story_reply" | "message" | "story_emoji";
  text: string;
  storyId?: string;
};

type SocialConversation = {
  id: string;
  userId?: string;
  lastMessage?: ConversationLastMessage;
  unreadCount: number;
  [key: string]: unknown;
};

let MESSAGES: SocialMessage[] = [];
let conversations: SocialConversation[] = [];

export function sendSocialMessage(message: SocialMessage) {
  MESSAGES.unshift(message);
}

export function getSocialMessages(userId: string) {
  return MESSAGES.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );
}

export const socialMessageService = {
  getConversations() {
    return conversations;
  },

  markAsRead(conversationId: string) {
    conversations = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, unreadCount: 0 }
        : c
    );
  },

  markAllAsRead() {
    conversations = conversations.map((c) => ({
      ...c,
      unreadCount: 0,
    }));
  },

  pushMessage(input: PushMessageInput) {
    const message: SocialMessage = {
      id: input.id ?? `msg_${Date.now()}`,
      senderId: input.userId,
      receiverId: input.targetUserId ?? "u1",
      text: input.text,
      type: input.type,
      storyId: input.storyId,
      createdAt: new Date().toISOString(),
    };
    const lastMessage: ConversationLastMessage = {
      id: message.id,
      type: message.type,
      text: message.text,
      storyId: message.storyId,
    };
    MESSAGES.unshift(message);

    const existing = conversations.find((c) => c.userId === input.userId);
    if (existing) {
      // duplicate kontrol
      if (existing.lastMessage?.id === lastMessage.id) return;

      existing.lastMessage = lastMessage;
      existing.unreadCount += 1;
    } else {
      conversations.unshift({
        id: Date.now().toString(),
        userId: input.userId,
        lastMessage,
        unreadCount: 1,
      });
    }
  },
};
