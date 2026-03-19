// src/domains/chat/hooks/useChatRoomAudio.ts
/**
 * 🔒 CHAT DOMAIN – AUDIO PLAYBACK HOOK (LOCKED)
 *
 * TRANSFER_EXPORT_V2 / FULL CONTEXT EXPORT
 *
 * KAPSAM:
 * - ADIM 5.1  : Audio playback ayrıştırma
 * - ADIM 5.2  : Playback speed toggle (1x / 1.5x / 2x)
 * - ADIM 6→17 : MessageRow & ChatRoom entegrasyonu
 *
 * SORUMLULUK:
 * - Tek seferde TEK audio çalar
 * - Play / Pause yönetimi
 * - Playback speed state senkronu
 * - Component unmount cleanup
 *
 * KURALLAR:
 * - UI-only
 * - Backend varsayımı YOK
 * - Navigation YOK
 * - Global state YOK
 * - Domain izolasyonu korunur
 *
 * YASAK:
 * ❌ Çoklu audio aynı anda
 * ❌ Global player
 * ❌ ChatRoom içine geri taşıma
 * ❌ Hook içi UI logic
 *
 * Yeni özellik → YENİ ADIM + YENİ HOOK
 */

import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";

import type { UiMessage } from "../services/chatMessageFactory";

/* ------------------------------------------------------------------ */
/* CONSTANTS (🔒)                                                      */
/* ------------------------------------------------------------------ */

const SPEEDS: Array<1 | 1.5 | 2> = [1, 1.5, 2];

const nextSpeed = (cur?: 1 | 1.5 | 2) =>
  SPEEDS[(SPEEDS.indexOf(cur ?? 1) + 1) % SPEEDS.length];

/* ------------------------------------------------------------------ */
/* HOOK (🔒)                                                           */
/* ------------------------------------------------------------------ */

export function useChatRoomAudio(
  messages: UiMessage[],
  setMessages: React.Dispatch<React.SetStateAction<UiMessage[]>>
) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  /* ---------- PLAY / PAUSE ---------- */

  async function togglePlay(m: UiMessage) {
    if (!m.audio) return;

    // pause current
    if (activeAudioId === m.id && playing) {
      await soundRef.current?.pauseAsync();
      setPlaying(false);
      return;
    }

    // switch audio
    if (activeAudioId !== m.id) {
      await soundRef.current?.unloadAsync().catch(() => {});
      const { sound } = await Audio.Sound.createAsync(
        { uri: m.audio.uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setActiveAudioId(m.id);
      setPlaying(true);
      await sound.setRateAsync(m.audio.speed ?? 1, true);
      return;
    }

    // resume
    await soundRef.current?.playAsync();
    setPlaying(true);
  }

  /* ---------- SPEED ---------- */

  async function toggleSpeed(m: UiMessage) {
    if (!m.audio) return;
    const speed = nextSpeed(m.audio.speed);

    setMessages((p) =>
      p.map((x) =>
        x.id === m.id ? { ...x, audio: { ...x.audio!, speed } } : x
      )
    );

    if (activeAudioId === m.id && soundRef.current) {
      await soundRef.current.setRateAsync(speed, true);
    }
  }

  /* ---------- CLEANUP ---------- */

  useEffect(() => {
    return () => {
      soundRef.current?.stopAsync().catch(() => {});
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  /* ---------- API ---------- */

  return {
    activeAudioId,
    playing,
    togglePlay,
    toggleSpeed,
  };
}