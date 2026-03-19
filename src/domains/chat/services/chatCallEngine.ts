export type CallState =
  | "idle"
  | "ringing"
  | "connecting"
  | "active"
  | "ended";

export type CallParticipant = {
  userId: string;
  joinedAt?: number;
  leftAt?: number;
};

export type CallSession = {
  id: string;
  chatId: string;
  type: "audio" | "video";
  initiatorId: string;
  participants: CallParticipant[];
  state: CallState;
  startedAt?: number;
  endedAt?: number;
};

let currentCall: CallSession | null = null;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const chatCallEngine = {
  getCurrentCall() {
    return currentCall;
  },

  startOutgoingCall(params: {
    chatId: string;
    initiatorId: string;
    participants: string[];
    type: "audio" | "video";
  }): CallSession {
    const session: CallSession = {
      id: makeId(),
      chatId: params.chatId,
      type: params.type,
      initiatorId: params.initiatorId,
      participants: params.participants.map((p) => ({
        userId: p,
      })),
      state: "ringing",
      startedAt: undefined,
      endedAt: undefined,
    };

    currentCall = session;

    return session;
  },

  receiveIncomingCall(params: {
    chatId: string;
    initiatorId: string;
    participants: string[];
    type: "audio" | "video";
  }): CallSession {
    const session: CallSession = {
      id: makeId(),
      chatId: params.chatId,
      type: params.type,
      initiatorId: params.initiatorId,
      participants: params.participants.map((p) => ({
        userId: p,
      })),
      state: "ringing",
      startedAt: undefined,
      endedAt: undefined,
    };

    currentCall = session;

    return session;
  },

  acceptCall() {
    if (!currentCall) return null;

    currentCall.state = "active";
    currentCall.startedAt = Date.now();

    return currentCall;
  },

  rejectCall() {
    if (!currentCall) return null;

    currentCall.state = "ended";
    currentCall.endedAt = Date.now();

    const ended = currentCall;
    currentCall = null;

    return ended;
  },

  endCall() {
    if (!currentCall) return null;

    currentCall.state = "ended";
    currentCall.endedAt = Date.now();

    const ended = currentCall;
    currentCall = null;

    return ended;
  },

  getCallDuration() {
    if (!currentCall) return 0;

    if (!currentCall.startedAt) return 0;

    const end = currentCall.endedAt ?? Date.now();

    return Math.floor((end - currentCall.startedAt) / 1000);
  },
};
