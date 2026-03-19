import { useCallback, useEffect, useMemo, useState } from "react";
import { chatRealtimeAdapter } from "../realtime/chatRealtimeAdapter";
import type {
  ChatRealtimeEvent,
  RealtimeConnectionState,
} from "../realtime/chatRealtimeAdapter";

type UseChatConnectionOptions = {
  chatId?: string;
  userId?: string;
  enabled?: boolean;
};

export function useChatConnection(options?: UseChatConnectionOptions) {
  const enabled = options?.enabled ?? true;

  const [connectionState, setConnectionState] =
    useState<RealtimeConnectionState>(
      chatRealtimeAdapter.getConnectionState()
    );

  const [lastEvent, setLastEvent] = useState<ChatRealtimeEvent | null>(null);

  const connect = useCallback(async () => {
    if (!enabled) return;
    await chatRealtimeAdapter.connect();
    setConnectionState(chatRealtimeAdapter.getConnectionState());
  }, [enabled]);

  const disconnect = useCallback(async () => {
    await chatRealtimeAdapter.disconnect();
    setConnectionState(chatRealtimeAdapter.getConnectionState());
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let unsub = () => {};

    connect().then(() => {
      unsub = chatRealtimeAdapter.subscribe(
        (event) => {
          setLastEvent(event);
        },
        {
          chatId: options?.chatId,
          userId: options?.userId,
        }
      );
    });

    return () => {
      unsub();
    };
  }, [connect, enabled, options?.chatId, options?.userId]);

  const publish = useCallback((event: ChatRealtimeEvent) => {
    chatRealtimeAdapter.publish(event);
  }, []);

  const api = useMemo(
    () => ({
      connectionState,
      isConnected: connectionState === "connected",
      lastEvent,
      connect,
      disconnect,
      publish,
    }),
    [connectionState, lastEvent, connect, disconnect, publish]
  );

  return api;
}
