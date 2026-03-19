// src/domains/chat/hooks/useChatAudioRecord.ts

import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { PanResponder } from "react-native";

import { chatAudioRecorder } from "../services/chatAudioRecorder";

/* ------------------------------------------------------------------ */
/* CONSTANTS (🔒)                                                      */
/* ------------------------------------------------------------------ */

const CANCEL_THRESHOLD = -60;

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type FinishPayload = {
  uri: string;
};

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatAudioRecord(
  onFinish: (payload: FinishPayload) => void
) {
  const [isRecording, setIsRecording] = useState(false);
  const cancelRef = useRef(false);

  /* ---------------- START ---------------- */

  async function start() {
    cancelRef.current = false;
    setIsRecording(true);
    Haptics.selectionAsync().catch(() => {});
    await chatAudioRecorder.start();
  }

  /* ---------------- STOP ---------------- */

  async function stop(send = true) {
    const result = await chatAudioRecorder.stop();
    setIsRecording(false);

    if (!send || cancelRef.current) return;
    if (!result?.uri) return;

    onFinish({ uri: result.uri });
  }

  /* ---------------- PAN ---------------- */

  const panHandlers = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isRecording,
      onPanResponderMove: (_, g) => {
        if (g.dx < CANCEL_THRESHOLD && !cancelRef.current) {
          cancelRef.current = true;
          stop(false);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          ).catch(() => {});
        }
      },
    })
  ).current;

  /* ------------------------------------------------------------------ */

  return {
    isRecording,
    startRecording: start,
    stopRecording: stop,
    panHandlers,
  };
}