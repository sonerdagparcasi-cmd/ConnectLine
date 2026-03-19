# Chat domain – CALL SYSTEM

Overview of the call-related types, services, screens, and flows in the chat domain.

---

## Quick map: five areas

| Area | Where | Notes |
|------|--------|------|
| **Audio call** | `ChatCallScreen` (call.type === "audio"), `chatCallService.startCall(peer, "audio")`, `simulateIncomingCall(..., "audio")` | Icon `call`; no camera control. |
| **Video call** | Same screen with `call.type === "video"`; camera toggle in **CallControls** | Icon `videocam`; camera on/off. |
| **Incoming call screen** | `ChatIncomingCallScreen` | Caller name, "Incoming · Audio/Video", Accept (call icon) / Decline (close icon). |
| **Call history** | `ChatCallsScreen` | `chatCallService.getCallHistory()`; list with peer, type (audio/video), incoming/outgoing, duration/missed; header button simulates incoming. |
| **Call controls** | `CallControls` in `components/call/` | Mute, Camera (video only), Speaker, End call; used by `ChatCallScreen`. |

---

## 1. Two layers (current state)

| Layer | Types | Service | Screens / hooks |
|--------|--------|---------|------------------|
| **Chat calls** (main) | `chatCall.types`: `ChatCall`, `ChatCallState`, `ChatCallType`, `ChatCallParticipant` | `chatCallService` | `ChatCallsScreen`, `ChatCallScreen`, `ChatIncomingCallScreen`, `IncomingCallBanner`, `useIncomingCall` |
| **Legacy calls** | `chat.types`: `Call`, `CallStatus`, `CallType` | `chatService` (getCallHistory, startCall, finishCall, searchCalls, …) | `CallsHistoryScreen`, `CallDetailScreen`, `CallScreen`, `useCalls` |

- **Chat calls**: 1:1 audio/video, incoming/outgoing UI, in-call screen, history list, incoming banner.
- **Legacy**: Older call history/detail/start flow; used by `CallsHistory`, `CallDetail`, `Call` screens and `useCalls`.

---

## 2. Chat call system (chatCallService + chatCall.types)

### Types (`types/chatCall.types.ts`)

- **ChatCallType**: `"audio" | "video"`
- **ChatCallState**: `"incoming" | "ringing" | "active" | "ended" | "missed"`
- **ChatCallParticipant**: `userId`, `displayName?`, `avatarUri?`
- **ChatCall**: `id`, `type`, `participants`, `state`, `startedAt`, `endedAt?`, `durationSec?`, `callerId?`

### Service (`services/chatCallService.ts`)

- **startCall(peerUserId, type, peerName?)** → outgoing call, state `"ringing"`
- **acceptCall(callId)** → move incoming to active, clear incoming
- **endCall(callId?)** → set state `"ended"`, compute duration, add to history
- **rejectCall(callId, asMissed)** → `"missed"` or `"ended"`, add to history
- **simulateIncomingCall(callerId, type, callerName?)** → mock incoming (state `"incoming"`)
- **getActiveCall()**, **getIncomingCall()**, **getCallHistory()**
- **subscribeIncoming(listener)** → notify when incoming call appears/disappears (for banner)
- **updateCallDuration(callId, durationSec)** → for in-call timer

### Screens

- **ChatCallsScreen**: List of call history from `chatCallService.getCallHistory()`; header button simulates incoming and navigates to `ChatIncomingCall`.
- **ChatIncomingCallScreen**: Full-screen incoming UI (caller name, audio/video, accept/decline); `acceptCall` → navigate to `ChatCall`; `rejectCall` → goBack.
- **ChatCallScreen**: Active call UI (timer, mute, end); uses `getActiveCall()`, `endCall()`.

### In-app notification

- **IncomingCallBanner**: Renders when `useIncomingCall()` is non-null and current route ≠ `ChatIncomingCall`; tap → navigate to `ChatIncomingCall` with `callId`. Used on ChatInboxScreen, ChatConversationScreen, ChatCallsScreen.

### Hooks

- **useIncomingCall()**: Returns current `ChatCall | null` from `chatCallService.getIncomingCall()` and subscribes to `subscribeIncoming` for updates.

---

## 3. Legacy call system (chatService + chat.types)

- **chatService**: `getCallHistory()`, `startCall(from, to, type)`, `finishCall(callId, status)`, `deleteCall(callId)`, `getCall(callId)`, `searchCalls(params)`, `exportCalls(params, format)`, plus group call helpers.
- **useCalls()**: Exposes `calls`, `searchParams`, `refresh`, `searchCalls`, `startCall`, `finishCall`, `deleteCall`, `getCallById`, `exportCalls`.
- **CallsHistoryScreen**: Uses `useCalls()` for list, search, export.
- **CallDetailScreen**: Uses `useCalls()` for `getCallById`, `deleteCall`.
- **CallScreen**: Starts call via `chatService.startCall("me", userId, type)`.

---

## 4. Navigation (ChatNavigator)

- **Call** – `CallScreen` (legacy start)
- **CallsHistory** – `CallsHistoryScreen`
- **CallDetail** – `CallDetailScreen` (params: `callId`)
- **ChatCalls** – `ChatCallsScreen` (chat call history + simulate)
- **ChatCall** – `ChatCallScreen` (params: `callId?`, `peerName?`)
- **ChatIncomingCall** – `ChatIncomingCallScreen` (params: `callId`)

---

## 5. Badges

- **chatService.getBadgeSummary()** includes `missedCalls` from `chatService.calls` (legacy). Chat call “missed” state is stored in `chatCallService` history; if badge should count those, it needs to be wired (e.g. from `chatCallService.getCallHistory()` filtered by `state === "missed"`).

---

## 6. Summary

- **Chat call system**: Types in `chatCall.types`, logic in `chatCallService`, UI in `ChatCallsScreen` / `ChatCallScreen` / `ChatIncomingCallScreen` + `IncomingCallBanner` and `useIncomingCall`. Handles 1:1 audio/video, incoming/outgoing, and in-call.
- **Legacy call system**: Types in `chat.types`, logic in `chatService`, UI in `CallsHistoryScreen` / `CallDetailScreen` / `CallScreen`, data in `useCalls`. Handles history, detail, and starting a call from legacy flow.
