// src/domains/chat/hooks/useChatRecorder.ts

import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import { PanResponder } from "react-native";

import { chatAudioRecorder } from "../services/chatAudioRecorder";

/* ------------------------------------------------------------------ */
/* TYPES (🔒 UI-ONLY)                                                   */
/* ------------------------------------------------------------------ */

type RecorderResult = {
  uri: string;
};

type UseChatRecorderParams = {
  cancelThreshold: number;
};

/* ------------------------------------------------------------------ */
/* HOOK                                                               */
/* ------------------------------------------------------------------ */

export function useChatRecorder({ cancelThreshold }: UseChatRecorderParams) {
  const [isRecording, setIsRecording] = useState(false);

  const cancelRef = useRef(false);

  /* ---------------- START ---------------- */

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    cancelRef.current = false;

    Haptics.selectionAsync().catch(() => {});
    await chatAudioRecorder.start();
  }, []);

  /* ---------------- STOP ---------------- */

  const stopRecording = useCallback(
    async (send: boolean): Promise<RecorderResult | null> => {
      const result = await chatAudioRecorder.stop();
      setIsRecording(false);

      if (!send || !result?.uri) return null;

      return { uri: result.uri };
    },
    []
  );

  /* ---------------- PAN RESPONDER ---------------- */

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isRecording,

      onPanResponderMove: async (_, gesture) => {
        if (gesture.dx < cancelThreshold && !cancelRef.current) {
          cancelRef.current = true;

          await stopRecording(false);

          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          ).catch(() => {});
        }
      },
    })
  ).current;

  /* ------------------------------------------------------------------ */
  /* API                                                                */
  /* ------------------------------------------------------------------ */

  return {
    isRecording,
    startRecording,
    stopRecording,
    panHandlers: panResponder.panHandlers,
  };
}