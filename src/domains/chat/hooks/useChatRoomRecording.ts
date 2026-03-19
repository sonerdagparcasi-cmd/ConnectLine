// src/domains/chat/hooks/useChatRoomRecording.ts
// (ADIM 5.2 – Audio recording + cancel swipe hook, UI-only, Chat domain)
//
// Sorumluluk:
// - recording state
// - start / stop recording
// - cancel swipe (PanResponder)
// - haptic warning
//
// Kurallar:
// - Navigation YOK
// - UI render YOK
// - Message state DIŞARIDAN verilir
// - chatAudioRecorder TEK KAYNAK

import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { PanResponder } from "react-native";

import { chatAudioRecorder } from "../services/chatAudioRecorder";
import type { UiMessage } from "../services/chatMessageFactory";
import { buildReplyMeta, createAudioMessage } from "../services/chatMessageFactory";

const CANCEL_THRESHOLD = -60;

type Params<T extends UiMessage> = {
  appendMessage: (m: T) => void;
  replyRef: React.MutableRefObject<T | null>;
};

export function useChatRoomRecording<T extends UiMessage>({
  appendMessage,
  replyRef,
}: Params<T>) {
  const [recording, setRecording] = useState(false);
  const cancelRef = useRef(false);

  async function startRecording() {
    setRecording(true);
    cancelRef.current = false;
    await chatAudioRecorder.start();
  }

  async function stopRecording(send = true) {
    const r = await chatAudioRecorder.stop();
    setRecording(false);

    if (!send || !r?.uri) return;

    appendMessage(
      createAudioMessage({
        uri: r.uri,
        replyTo: replyRef.current
          ? buildReplyMeta(replyRef.current)
          : undefined,
      }) as T
    );
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => recording,
      onPanResponderMove: (_, g) => {
        if (g.dx < CANCEL_THRESHOLD && !cancelRef.current) {
          cancelRef.current = true;
          stopRecording(false);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          ).catch(() => {});
        }
      },
    })
  ).current;

  return {
    recording,
    startRecording,
    stopRecording,
    panResponder,
  };
}