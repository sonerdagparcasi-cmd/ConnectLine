// src/domains/social/services/socialMusicService.ts

import type { SocialMusicTrack } from "../types/social.types";
import { MOCK_TRACKS } from "./socialMockData";

const MIN_SEC = 20;

export const socialMusicService = {
  async listTracks(): Promise<SocialMusicTrack[]> {
    // UI-only mock
    return MOCK_TRACKS;
  },

  /**
   * 🔒 KURAL: min 20 sn
   */
  ensureMinDuration(track: SocialMusicTrack) {
    if (track.durationSec < MIN_SEC) {
      throw new Error(`Müzik en az ${MIN_SEC} sn olmalı.`);
    }
    return true;
  },
};