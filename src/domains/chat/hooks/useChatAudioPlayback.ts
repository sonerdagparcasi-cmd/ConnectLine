// src/domains/chat/hooks/useChatAudioPlayback.ts

import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";

type PlaybackStatusValue = "listening" | "listened";

type Options = {
  onStatusChange?: (messageId: string, status: PlaybackStatusValue) => void;
};

const SPEEDS: Array<1 | 1.5 | 2> = [1, 1.5, 2];

function nextSpeed(cur?: 1 | 1.5 | 2) {
  const idx = SPEEDS.indexOf(cur ?? 1);
  return SPEEDS[(idx + 1) % SPEEDS.length];
}

export function useChatAudioPlayback(options?: Options) {
  const onStatusChange = options?.onStatusChange;

  const soundRef = useRef<Audio.Sound | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  async function stop() {
    try {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
    } catch {}

    soundRef.current = null;
    activeIdRef.current = null;

    setActiveId(null);
    setIsPlaying(false);
    setProgress(0);
  }

  async function togglePlay(
    id: string,
    uri: string,
    speed: 1 | 1.5 | 2 = 1
  ) {
    if (activeIdRef.current === id && soundRef.current) {
      const status = await soundRef.current.getStatusAsync();

      if (status.isLoaded && status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);

        if (status.positionMillis > 0) {
          onStatusChange?.(id, "listened");
        }
        return;
      }

      await soundRef.current.playAsync();
      setIsPlaying(true);
      onStatusChange?.(id, "listening");
      return;
    }

    await stop();

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    soundRef.current = sound;
    activeIdRef.current = id;

    setActiveId(id);
    setIsPlaying(true);
    setProgress(0);

    try {
      await sound.setRateAsync(speed, true);
    } catch {}

    onStatusChange?.(id, "listening");

    sound.setOnPlaybackStatusUpdate((s) => {
      if (!s.isLoaded) return;

      if (s.durationMillis && s.positionMillis != null) {
        setProgress(
          Math.min(1, s.positionMillis / s.durationMillis)
        );
      }

      if (s.isPlaying) {
        setIsPlaying(true);
        return;
      }

      if (s.didJustFinish) {
        setIsPlaying(false);
        setProgress(1);
        onStatusChange?.(id, "listened");
        return;
      }

      if (!s.isPlaying && s.positionMillis > 0) {
        setIsPlaying(false);
        onStatusChange?.(id, "listened");
      }
    });
  }

  async function toggleSpeed(
    id: string,
    current: 1 | 1.5 | 2,
    onChange: (s: 1 | 1.5 | 2) => void
  ) {
    const speed = nextSpeed(current);
    onChange(speed);

    if (activeIdRef.current === id && soundRef.current) {
      try {
        await soundRef.current.setRateAsync(speed, true);
      } catch {}
    }
  }

  // 🔒 ADIM 5.3 — SEEK
  async function seek(targetProgress: number) {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded || !status.durationMillis) return;

      const pos = Math.max(
        0,
        Math.min(
          status.durationMillis,
          status.durationMillis * targetProgress
        )
      );

      await soundRef.current.setPositionAsync(pos);
      setProgress(pos / status.durationMillis);
      setIsPlaying(true);
    } catch {}
  }

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    activeId,
    isPlaying,
    progress,
    togglePlay,
    toggleSpeed,
    seek, // 🔒 yeni
    stop,
  };
}