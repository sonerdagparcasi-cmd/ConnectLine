import type {
  ChatRealtimeAdapter,
  ChatRealtimeEvent,
  ChatRealtimeListener,
  ChatRealtimeScope,
  ChatRealtimeUnsubscribe,
  RealtimeConnectionState,
} from "./chatRealtime.types";

type Subscription = {
  id: string;
  listener: ChatRealtimeListener;
  scope?: ChatRealtimeScope;
};

function matchesScope(event: ChatRealtimeEvent, scope?: ChatRealtimeScope) {
  if (!scope) return true;

  if ("chatId" in event && scope.chatId && event.chatId !== scope.chatId) {
    return false;
  }

  if ("userId" in event && scope.userId && event.userId !== scope.userId) {
    return false;
  }

  return true;
}

class InMemoryChatRealtimeAdapter implements ChatRealtimeAdapter {
  private state: RealtimeConnectionState = "idle";
  private subscriptions = new Map<string, Subscription>();

  async connect(): Promise<void> {
    if (this.state === "connected") return;
    this.state = "connecting";
    await Promise.resolve();
    this.state = "connected";
  }

  async disconnect(): Promise<void> {
    this.state = "disconnected";
  }

  getConnectionState(): RealtimeConnectionState {
    return this.state;
  }

  subscribe(
    listener: ChatRealtimeListener,
    scope?: ChatRealtimeScope
  ): ChatRealtimeUnsubscribe {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    this.subscriptions.set(id, {
      id,
      listener,
      scope,
    });

    return () => {
      this.subscriptions.delete(id);
    };
  }

  publish(event: ChatRealtimeEvent): void {
    if (this.state !== "connected") return;

    this.subscriptions.forEach((sub) => {
      if (!matchesScope(event, sub.scope)) return;
      sub.listener(event);
    });
  }
}

export const chatRealtimeAdapter = new InMemoryChatRealtimeAdapter();

export type {
  ChatRealtimeAdapter,
  ChatRealtimeEvent,
  ChatRealtimeListener,
  ChatRealtimeScope,
  ChatRealtimeUnsubscribe,
  RealtimeConnectionState,
} from "./chatRealtime.types";
