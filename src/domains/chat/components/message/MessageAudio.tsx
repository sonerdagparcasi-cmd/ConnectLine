// src/domains/chat/components/message/MessageAudio.tsx

import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { memo, useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { generateMockWaveform } from "../../utils/mockWaveform";
import ChatAudioWaveform from "../ChatAudioWaveform";

type Props = {
  uri: string;
  isMine: boolean;
  isPlaying?: boolean;
  speed?: 1 | 1.5 | 2;
  durationSec?: number;
  progress?: number;
  onTogglePlay?: () => void;
  onToggleSpeed?: () => void;
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MessageAudioInner({
  uri,
  isMine,
  isPlaying = false,
  speed = 1,
  durationSec = 0,
  progress = 0,
  onTogglePlay,
  onToggleSpeed,
}: Props) {
  const T = useAppTheme();
  const soundRef = useRef<Audio.Sound | null>(null);
  const uriRef = useRef(uri);

  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? T.textColor : C.buttonText;
  const onAccentMuted = T.isDark ? T.mutedText : "rgba(255,255,255,0.85)";
  const color = isMine ? onAccentText : T.textColor;
  const subColor = isMine ? onAccentMuted : T.mutedText;
  const peaks = React.useMemo(() => generateMockWaveform(20), []);

  const loadAndPlay = useCallback(async () => {
    if (!uri?.trim()) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.playAsync();
          return;
        }
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (e) {
      console.warn("MessageAudio load/play error:", e);
    }
  }, [uri]);

  const pause = useCallback(async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) await soundRef.current.pauseAsync();
      }
    } catch (e) {
      console.warn("MessageAudio pause error:", e);
    }
  }, []);

  const unload = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {
      console.warn("MessageAudio unload error:", e);
    }
  }, []);

  useEffect(() => {
    if (uri !== uriRef.current) {
      uriRef.current = uri;
      unload();
    }
  }, [uri, unload]);

  useEffect(() => {
    if (isPlaying) {
      loadAndPlay();
    } else {
      pause();
    }
  }, [isPlaying, loadAndPlay, pause]);

  useEffect(() => {
    return () => {
      unload();
    };
  }, [unload]);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={onTogglePlay} style={styles.playBtn}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={22}
          color={color}
        />
      </TouchableOpacity>
      <View style={styles.waveformWrap}>
        <ChatAudioWaveform
          peaks={peaks}
          progress={Math.min(1, Math.max(0, progress ?? 0))}
          activeColor={color}
          inactiveColor={subColor}
        />
        <Text style={[styles.duration, { color: subColor }]}>
          {durationSec != null && durationSec > 0
            ? formatDuration(durationSec)
            : "0:00"}
        </Text>
      </View>
      <TouchableOpacity onPress={onToggleSpeed} style={styles.speedBtn}>
        <Text style={[styles.speedText, { color }]}>{speed}x</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: subColor }]}>
        {t("chat.message.voiceMessage")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  playBtn: { padding: 4 },
  waveformWrap: { flex: 1, minWidth: 60 },
  duration: { fontSize: 10, fontWeight: "600", marginTop: 4 },
  speedBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  speedText: { fontSize: 12, fontWeight: "800" },
  label: { fontSize: 12, fontWeight: "600" },
});

export default memo(MessageAudioInner);
