// src/domains/chat/services/chatAudioRecorder.ts
// UI-only, expo-av tabanlı ses kaydı helper

import { Audio } from "expo-av";

export type RecordedAudio = {
  uri: string;
  durationMillis: number;
};

class ChatAudioRecorder {
  private recording: Audio.Recording | null = null;

  async start(): Promise<boolean> {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") return false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await this.recording.startAsync();
      return true;
    } catch {
      this.recording = null;
      return false;
    }
  }

  async stop(): Promise<RecordedAudio | null> {
    if (!this.recording) return null;
    try {
      const status = await this.recording.getStatusAsync();
      const durationMillis =
        status.isRecording && "durationMillis" in status
          ? (status.durationMillis ?? 0)
          : 0;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      if (!uri) return null;
      return { uri, durationMillis };
    } catch {
      this.recording = null;
      return null;
    }
  }

  async cancel(): Promise<void> {
    if (!this.recording) return;
    try {
      await this.recording.stopAndUnloadAsync();
    } catch {
      // ignore
    }
    this.recording = null;
  }

  getDurationSec(): number {
    if (!this.recording) return 0;
    return 0; // sync API yok; duration stop() ile alınır
  }
}

export const chatAudioRecorder = new ChatAudioRecorder();
