// src/domains/chat/hooks/useChatAudioRecorder.ts

import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { PanResponder } from "react-native";

import { chatAudioRecorder } from "../services/chatAudioRecorder";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type ReplyMetaBuilder<T> = () => T | undefined;

type RecorderOptions<T> = {
  cancelThreshold?: number;
  buildReplyMeta?: ReplyMetaBuilder<T>;
  onSend: (payload: {
    uri: string;
    replyMeta?: T;
  }) => void;
};

/* ------------------------------------------------------------------ */
/* DEFAULTS                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_CANCEL_THRESHOLD = -60;

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatAudioRecorder<T = any>({
  cancelThreshold = DEFAULT_CANCEL_THRESHOLD,
  buildReplyMeta,
  onSend,
}: RecorderOptions<T>) {
  const [isRecording, setIsRecording] = useState(false);
  const cancelRef = useRef(false);

  /* ---------------- START ---------------- */

  async function startRecording() {
    if (isRecording) return;

    cancelRef.current = false;
    setIsRecording(true);

    Haptics.selectionAsync().catch(() => {});
    await chatAudioRecorder.start();
  }

  /* ---------------- STOP ---------------- */

  async function stopRecording(send = true) {
    const result = await chatAudioRecorder.stop();
    setIsRecording(false);

    if (!send || cancelRef.current || !result?.uri) return;

    const replyMeta = buildReplyMeta?.();

    onSend({
      uri: result.uri,
      replyMeta,
    });
  }

  /* ---------------- PAN / CANCEL ---------------- */

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isRecording,
      onPanResponderMove: (_, g) => {
        if (g.dx < cancelThreshold && !cancelRef.current) {
          cancelRef.current = true;

          stopRecording(false);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          ).catch(() => {});
        }
      },
    })
  ).current;

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (isRecording) {
        chatAudioRecorder.stop().catch(() => {});
      }
    };
  }, [isRecording]);

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