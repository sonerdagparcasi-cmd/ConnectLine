import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

import type {
  CallExportFormat,
  CallSearchParams,
} from "../services/chatService";
import { chatService } from "../services/chatService";
import { chatCallService } from "../services/chatCallService";
import type { CallSession } from "../services/chatCallEngine";
import type { Call, CallStatus, CallType } from "../types/chat.types";

/**
 * useCalls (UI-only)
 * - Current call session from chatCallEngine (polled)
 * - Legacy call history/search from chatService (CallsHistoryScreen, CallDetailScreen)
 */
export function useCalls() {
  const [call, setCall] = useState<CallSession | null>(() =>
    chatCallService.getCurrentCall()
  );

  const [searchParams, setSearchParams] = useState<
    CallSearchParams | undefined
  >(undefined);

  const [calls, setCalls] = useState<Call[]>(() =>
    chatService.getCallHistory()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const current = chatCallService.getCurrentCall();
      setCall(current ?? null);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(() => {
    setSearchParams(undefined);
    setCalls([...chatService.getCallHistory()]);
  }, []);

  const searchCalls = useCallback((params?: CallSearchParams) => {
    setSearchParams(params);
    setCalls([...chatService.searchCalls(params)]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (searchParams) {
        setCalls([...chatService.searchCalls(searchParams)]);
      } else {
        refresh();
      }
    }, [refresh, searchParams])
  );

  const startCallLegacy = useCallback(
    (fromUserId: string, toUserId: string, type: CallType) => {
      chatService.startCall(fromUserId, toUserId, type);
      searchParams
        ? setCalls([...chatService.searchCalls(searchParams)])
        : refresh();
    },
    [refresh, searchParams]
  );

  const finishCall = useCallback(
    (callId: string, status: CallStatus) => {
      chatService.finishCall(callId, status);
      searchParams
        ? setCalls([...chatService.searchCalls(searchParams)])
        : refresh();
    },
    [refresh, searchParams]
  );

  const deleteCall = useCallback(
    (callId: string) => {
      chatService.deleteCall(callId);
      searchParams
        ? setCalls([...chatService.searchCalls(searchParams)])
        : refresh();
    },
    [refresh, searchParams]
  );

  const getCallById = useCallback((callId: string) => {
    return chatService.getCall(callId);
  }, []);

  const exportCalls = useCallback(
    (format: CallExportFormat) => {
      return chatService.exportCalls(searchParams, format);
    },
    [searchParams]
  );

  return {
    call,
    startCall: chatCallService.startCall,
    acceptCall: chatCallService.acceptCall,
    rejectCall: chatCallService.rejectCall,
    endCall: chatCallService.endCall,
    getDuration: chatCallService.getDuration,

    calls,
    searchParams,
    refresh,
    searchCalls,
    startCallLegacy,
    finishCall,
    deleteCall,
    getCallById,
    exportCalls,
  };
}
