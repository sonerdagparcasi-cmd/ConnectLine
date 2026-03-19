// src/domains/store/services/storeMusicService.ts
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type Track = {
  id: "trackA" | "trackB";
  title: string;
  source: any;
};

/* ------------------------------------------------------------------ */
/* TRACKS (KİLİTLİ – store only)                                      */
/* ------------------------------------------------------------------ */

const TRACKS: Track[] = [
  {
    id: "trackA",
    title: "Ambient Flow",
    source: require("../../../assets/videos/menu.mp4"),
  },
  {
    id: "trackB",
    title: "Soft Pulse",
    source: require("../../../assets/videos/world.mp4"),
  },
];

/* ------------------------------------------------------------------ */
/* STATE (module scoped – KİLİTLİ)                                    */
/* ------------------------------------------------------------------ */

let sound: Audio.Sound | null = null;
let currentTrack: Track | null = null;
let isMuted = false;
let volume = 0.6;

/* ------------------------------------------------------------------ */
/* AUDIO MODE (expo-av uyumlu, STABİL)                                */
/* ------------------------------------------------------------------ */

async function ensureAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,

    // ✅ GÜNCEL API
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,

    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

/* ------------------------------------------------------------------ */
/* SERVICE (KİLİTLİ CONTRACT)                                         */
/* ------------------------------------------------------------------ */

export const storeMusicService = {
  /* ----------------------- */
  /* read                    */
  /* ----------------------- */

  getTracks() {
    return TRACKS;
  },

  getState() {
    return {
      currentTrack,
      isMuted,
      volume,
    };
  },

  /* ----------------------- */
  /* playback                */
  /* ----------------------- */

  async play(trackId: Track["id"]) {
    const track = TRACKS.find((t) => t.id === trackId);
    if (!track) return;

    await ensureAudioMode();

    // aynı track → devam et
    if (sound && currentTrack?.id === trackId) {
      await sound.playAsync();
      return;
    }

    // başka track varsa temizle
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }

    sound = new Audio.Sound();
    await sound.loadAsync(
      track.source,
      {
        shouldPlay: true,
        volume,
        isMuted,
      }
    );

    currentTrack = track;
  },

  async pause() {
    if (!sound) return;
    await sound.pauseAsync();
  },

  /* ----------------------- */
  /* controls                */
  /* ----------------------- */

  async toggleMute() {
    isMuted = !isMuted;
    if (sound) {
      await sound.setIsMutedAsync(isMuted);
    }
    return isMuted;
  },

  async setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v));
    if (sound) {
      await sound.setVolumeAsync(volume);
    }
    return volume;
  },

  /* ----------------------- */
  /* lifecycle               */
  /* ----------------------- */

  async stopAndUnload() {
    if (!sound) return;

    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } finally {
      sound = null;
      currentTrack = null;
    }
  },
};