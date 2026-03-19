// src/domains/chat/types/chatCall.types.ts
// Call system types – chat domain only, mock-ready
//
// Call types: audio | video
// Direction: incoming | outgoing (derived: participants[0] === "me" => outgoing)
// State: incoming | ringing | active | ended | missed

export type ChatCallType = "audio" | "video";

export type ChatCallState =
  | "incoming"   // incoming, not yet answered
  | "ringing"   // outgoing, waiting for answer
  | "active"    // connected
  | "ended"     // finished normally
  | "missed";   // incoming, declined or unanswered

export interface ChatCallParticipant {
  userId: string;
  displayName?: string;
  avatarUri?: string;
}

export interface ChatCall {
  id: string;
  type: ChatCallType;
  participants: ChatCallParticipant[];
  state: ChatCallState;
  startedAt: number;
  endedAt?: number;
  /** Call duration in seconds (spec: "duration") */
  durationSec?: number;
  /** For incoming: who is calling (peer) */
  callerId?: string;
}
