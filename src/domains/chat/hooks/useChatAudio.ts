// src/domains/chat/hooks/useChatAudio.ts

import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* TYPES (🔒 UI-ONLY)                                                   */
/* ------------------------------------------------------------------ */

type AudioMessage = {
  id: string;
  uri: string;
  speed?: 1 | 1.5 | 2;
};

/* ------------------------------------------------------------------ */
/* HOOK                                                               */
/* ------------------------------------------------------------------ */

export function useChatAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /* ---------------- STOP / CLEANUP ---------------- */

  const stopPlayback = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
    } catch {
      // UI-only → sessiz geç
    }

    soundRef.current = null;
    setActiveAudioId(null);
    setIsPlaying(false);
  }, []);

  /* ---------------- TOGGLE PLAY ---------------- */

  const togglePlay = useCallback(
    async (msg: AudioMessage) => {
      // Aynı mesaj oynuyorsa → pause
      if (activeAudioId === msg.id && isPlaying) {
        await soundRef.current?.pauseAsync();
        setIsPlaying(false);
        return;
      }

      // Farklı mesaj → önce eskisini kapat
      if (activeAudioId !== msg.id) {
        await stopPlayback();

        const { sound } = await Audio.Sound.createAsync(
          { uri: msg.uri },
          { shouldPlay: true }
        );

        soundRef.current = sound;
        setActiveAudioId(msg.id);
        setIsPlaying(true);

        await sound.setRateAsync(msg.speed ?? 1, true);
        return;
      }

      // Aynı mesaj ama paused → play
      await soundRef.current?.playAsync();
      setIsPlaying(true);
    },
    [activeAudioId, isPlaying, stopPlayback]
  );

  /* ---------------- SPEED ---------------- */

  const applySpeed = useCallback(
    async (msgId: string, speed: 1 | 1.5 | 2) => {
      if (activeAudioId === msgId && soundRef.current) {
        await soundRef.current.setRateAsync(speed, true);
      }
    },
    [activeAudioId]
  );

  /* ---------------- UNMOUNT CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  /* ------------------------------------------------------------------ */
  /* API                                                                */
  /* ------------------------------------------------------------------ */

  return {
    activeAudioId,
    isPlaying,
    togglePlay,
    applySpeed,
    stopPlayback,
  };
}