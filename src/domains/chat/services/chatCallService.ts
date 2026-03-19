import type { ChatCall, ChatCallParticipant, ChatCallState, ChatCallType } from "../types/chatCall.types";
import { chatCallEngine } from "./chatCallEngine";
import type { CallSession } from "./chatCallEngine";

const ME = "me";

const incomingListeners = new Set<() => void>();
const history: ChatCall[] = [];
const displayNamesBySessionId = new Map<string, { peerName?: string; callerName?: string }>();

function notifyIncoming() {
  incomingListeners.forEach((l) => l());
}

function sessionToChatCall(session: CallSession): ChatCall {
  const meta = displayNamesBySessionId.get(session.id);
  const participants: ChatCallParticipant[] = session.participants.map((p) => ({
    userId: p.userId,
    displayName: p.userId === ME ? "Me" : meta?.peerName ?? meta?.callerName ?? p.userId,
  }));

  const state: ChatCallState =
    session.state === "ringing"
      ? session.initiatorId === ME
        ? "ringing"
        : "incoming"
      : session.state === "active"
        ? "active"
        : session.state === "ended"
          ? "ended"
          : "ringing";

  return {
    id: session.id,
    type: session.type,
    participants,
    state,
    startedAt: session.startedAt ?? Date.now(),
    endedAt: session.endedAt,
    durationSec: session.startedAt && session.endedAt
      ? Math.floor((session.endedAt - session.startedAt) / 1000)
      : undefined,
    callerId: session.initiatorId !== ME ? session.initiatorId : undefined,
  };
}

export const chatCallService = {
  startCall(params: {
    chatId: string;
    initiatorId: string;
    participants: string[];
    type: "audio" | "video";
  }) {
    return chatCallEngine.startOutgoingCall(params);
  },

  incomingCall(params: {
    chatId: string;
    initiatorId: string;
    participants: string[];
    type: "audio" | "video";
  }) {
    const session = chatCallEngine.receiveIncomingCall(params);
    notifyIncoming();
    return session;
  },

  acceptCall(callId?: string): ReturnType<typeof chatCallEngine.acceptCall> | ChatCall | null {
    const session = chatCallEngine.getCurrentCall();
    if (callId != null && session?.id !== callId) return null;
    const accepted = chatCallEngine.acceptCall();
    if (!accepted) return null;
    return sessionToChatCall(accepted);
  },

  rejectCall(callId?: string, asMissed = true): void {
    const session = chatCallEngine.getCurrentCall();
    if (callId != null && session?.id !== callId) return;
    const ended = chatCallEngine.rejectCall();
    if (ended) {
      history.unshift({ ...sessionToChatCall(ended), state: asMissed ? "missed" : "ended" });
      displayNamesBySessionId.delete(ended.id);
    }
    notifyIncoming();
  },

  endCall(callId?: string): ReturnType<typeof chatCallEngine.endCall> | void {
    const session = chatCallEngine.getCurrentCall();
    if (callId != null && session?.id !== callId) return;
    const ended = chatCallEngine.endCall();
    if (ended) {
      history.unshift(sessionToChatCall(ended));
      displayNamesBySessionId.delete(ended.id);
    }
    notifyIncoming();
  },

  getCurrentCall() {
    return chatCallEngine.getCurrentCall();
  },

  getDuration() {
    return chatCallEngine.getCallDuration();
  },

  getActiveCall(): ChatCall | null {
    const session = chatCallEngine.getCurrentCall();
    if (!session || session.state !== "active") return null;
    return sessionToChatCall(session);
  },

  getIncomingCall(): ChatCall | null {
    const session = chatCallEngine.getCurrentCall();
    if (!session || session.state !== "ringing" || session.initiatorId === ME) return null;
    return sessionToChatCall(session);
  },

  startCallWithPeer(peerUserId: string, type: ChatCallType, peerName?: string): ChatCall {
    const session = chatCallEngine.startOutgoingCall({
      chatId: `direct_${peerUserId}`,
      initiatorId: ME,
      participants: [ME, peerUserId],
      type,
    });
    displayNamesBySessionId.set(session.id, { peerName });
    return sessionToChatCall(session);
  },

  getCallHistory(): ChatCall[] {
    return [...history];
  },

  subscribeIncoming(listener: () => void): () => void {
    incomingListeners.add(listener);
    return () => incomingListeners.delete(listener);
  },

  simulateIncomingCall(callerId: string, type: ChatCallType, callerName?: string): ChatCall {
    const session = chatCallEngine.receiveIncomingCall({
      chatId: `direct_${callerId}`,
      initiatorId: callerId,
      participants: [callerId, ME],
      type,
    });
    displayNamesBySessionId.set(session.id, { callerName });
    notifyIncoming();
    return sessionToChatCall(session);
  },
};
