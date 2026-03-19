// src/domains/chat/hooks/useIncomingCall.ts
// Reactive incoming call state for notification banner

import { useEffect, useState } from "react";
import { chatCallService } from "../services/chatCallService";
import type { ChatCall } from "../types/chatCall.types";

export function useIncomingCall(): ChatCall | null {
  const [call, setCall] = useState<ChatCall | null>(() =>
    chatCallService.getIncomingCall()
  );

  useEffect(() => {
    setCall(chatCallService.getIncomingCall());
    const unsub = chatCallService.subscribeIncoming(() => {
      setCall(chatCallService.getIncomingCall());
    });
    return unsub;
  }, []);

  return call;
}
