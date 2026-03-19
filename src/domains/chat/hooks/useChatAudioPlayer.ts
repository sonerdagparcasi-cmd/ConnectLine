// src/domains/chat/hooks/useChatAudioPlayer.ts

import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type AudioMessage = {
  id: string;
  audio?: {
    uri: string;
    speed?: 1 | 1.5 | 2;
  };
};

/* ------------------------------------------------------------------ */
/* CONSTANTS (🔒)                                                      */
/* ------------------------------------------------------------------ */

const SPEEDS: Array<1 | 1.5 | 2> = [1, 1.5, 2];

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /* ---------------- HELPERS ---------------- */

  function nextSpeed(cur?: 1 | 1.5 | 2) {
    const idx = SPEEDS.indexOf(cur ?? 1);
    return SPEEDS[(idx + 1) % SPEEDS.length];
  }

  async function stopPlayback() {
    try {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
    } catch {
      /* silent */
    }

    soundRef.current = null;
    setActiveAudioId(null);
    setIsPlaying(false);
  }

  /* ---------------- ACTIONS ---------------- */

  async function togglePlay(msg: AudioMessage) {
    if (!msg.audio) return;

    // same message → pause
    if (activeAudioId === msg.id && isPlaying) {
      await soundRef.current?.pauseAsync();
      setIsPlaying(false);
      return;
    }

    // different message → stop previous
    if (activeAudioId !== msg.id) {
      await stopPlayback();

      const { sound } = await Audio.Sound.createAsync(
        { uri: msg.audio.uri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setActiveAudioId(msg.id);
      setIsPlaying(true);

      await sound.setRateAsync(msg.audio.speed ?? 1, true);
      return;
    }

    // same message → resume
    await soundRef.current?.playAsync();
    setIsPlaying(true);
  }

  async function toggleSpeed(
    msg: AudioMessage,
    onSpeedChange: (speed: 1 | 1.5 | 2) => void
  ) {
    if (!msg.audio) return;

    const speed = nextSpeed(msg.audio.speed);
    onSpeedChange(speed);

    if (activeAudioId === msg.id && soundRef.current) {
      await soundRef.current.setRateAsync(speed, true);
    }
  }

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* API                                                                */
  /* ------------------------------------------------------------------ */

  return {
    activeAudioId,
    isPlaying,
    togglePlay,
    toggleSpeed,
    stopPlayback,
  };
}