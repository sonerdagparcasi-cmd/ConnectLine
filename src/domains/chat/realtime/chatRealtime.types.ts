export type RealtimeConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export type ChatRealtimeScope = {
  chatId?: string;
  userId?: string;
};

export type RealtimeMessageEvent = {
  type: "message:new";
  chatId: string;
  message: unknown;
  occurredAt: number;
};

export type RealtimeTypingEvent = {
  type: "typing:update";
  chatId: string;
  userId: string;
  isTyping: boolean;
  occurredAt: number;
};

export type RealtimePresenceEvent = {
  type: "presence:update";
  userId: string;
  isOnline: boolean;
  lastSeenAt: number;
  occurredAt: number;
};

export type RealtimeDeliveryEvent = {
  type: "delivery:update";
  chatId: string;
  messageId: string;
  status: "sent" | "delivered" | "seen" | "failed";
  occurredAt: number;
};

export type ChatRealtimeEvent =
  | RealtimeMessageEvent
  | RealtimeTypingEvent
  | RealtimePresenceEvent
  | RealtimeDeliveryEvent;

export type ChatRealtimeUnsubscribe = () => void;

export type ChatRealtimeListener<TEvent extends ChatRealtimeEvent = ChatRealtimeEvent> =
  (event: TEvent) => void;

export interface ChatRealtimeAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConnectionState(): RealtimeConnectionState;

  subscribe(
    listener: ChatRealtimeListener,
    scope?: ChatRealtimeScope
  ): ChatRealtimeUnsubscribe;

  publish(event: ChatRealtimeEvent): void;
}
