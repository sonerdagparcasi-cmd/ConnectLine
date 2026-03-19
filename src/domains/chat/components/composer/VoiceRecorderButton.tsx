// src/domains/chat/components/composer/VoiceRecorderButton.tsx
// Tap to record, swipe right to cancel, recording timer, send button

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";

const WAVEFORM_BAR_COUNT = 12;
const WAVEFORM_MIN = 6;
const WAVEFORM_MAX = 14;
const WAVEFORM_UPDATE_MS = 160;

type Props = {
  onStartRecording: () => void;
  onStopRecording: (cancel: boolean, durationSec?: number) => void;
  onRecordingChange?: (recording: boolean) => void;
  disabled?: boolean;
  /** When true, render full-width recording UI only (used by parent when isRecording) */
  isRecording?: boolean;
};

const SWIPE_UP_CANCEL_THRESHOLD = 60;
const SWIPE_RIGHT_CANCEL_THRESHOLD = 80;

function VoiceRecorderButtonInner({
  onStartRecording,
  onStopRecording,
  onRecordingChange,
  disabled,
  isRecording: controlledRecording,
}: Props) {
  const T = useAppTheme();
  const [internalRecording, setInternalRecording] = useState(false);
  const recording = controlledRecording ?? internalRecording;

  const [durationSec, setDurationSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideX = useRef(new Animated.Value(0)).current;
  const stoppedRef = useRef(false);

  const barHeights = useRef(
    Array.from({ length: WAVEFORM_BAR_COUNT }, () => new Animated.Value(0.4))
  ).current;

  // Timer: when recording (including when mounted with isRecording from parent), tick every second
  useEffect(() => {
    if (!recording) return;
    timerRef.current = setInterval(() => {
      setDurationSec((s) => s + 1);
    }, 1000);
    return () => clearTimer();
  }, [recording]);

  // Waveform: subtle animation while recording
  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => {
      barHeights.forEach((anim) => {
        const target = 0.4 + Math.random() * 0.5;
        Animated.timing(anim, {
          toValue: target,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }).start();
      });
    }, WAVEFORM_UPDATE_MS);
    return () => clearInterval(interval);
  }, [recording, barHeights]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endRecording = useCallback(
    (cancel: boolean, finalDuration?: number) => {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      clearTimer();
      setInternalRecording(false);
      setDurationSec(0);
      onRecordingChange?.(false);
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
      onStopRecording(cancel, cancel ? undefined : (finalDuration ?? durationSec));
    },
    [clearTimer, onStopRecording, onRecordingChange, slideX, durationSec]
  );

  const endRecordingRef = useRef(endRecording);
  endRecordingRef.current = endRecording;

  const startRecording = useCallback(() => {
    if (disabled) return;
    stoppedRef.current = false;
    setInternalRecording(true);
    setDurationSec(0);
    onRecordingChange?.(true);
    onStartRecording();
    // Timer is started by useEffect when recording is true (recording section instance)
  }, [disabled, onStartRecording, onRecordingChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 15 || Math.abs(g.dy) > 15,
      onPanResponderMove: (_, g) => {
        if (g.dx > 0) {
          slideX.setValue(Math.min(g.dx, 120));
        }
      },
      onPanResponderRelease: (_, g) => {
        const swipeUpCancel = g.dy < -SWIPE_UP_CANCEL_THRESHOLD;
        const swipeRightCancel = g.dx > SWIPE_RIGHT_CANCEL_THRESHOLD;
        if (!stoppedRef.current && (swipeUpCancel || swipeRightCancel)) {
          endRecordingRef.current(true);
        } else {
          slideX.setValue(0);
          Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSendRecording = useCallback(() => {
    const d = durationSec;
    endRecordingRef.current(false, d);
  }, [durationSec]);

  if (recording) {
    return (
      <View style={styles.recordingBarContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.recordingBar,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <Text style={[styles.cancelHint, { color: T.mutedText }]} numberOfLines={1}>
            {t("chat.composer.swipeRightToCancel")}
          </Text>
          <View style={styles.waveformWrap}>
            {barHeights.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    backgroundColor: T.accent,
                    height: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [WAVEFORM_MIN, WAVEFORM_MAX],
                    }),
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.duration, { color: T.textColor }]}>
            {formatTime(durationSec)}
          </Text>
          <TouchableOpacity
            onPress={handleSendRecording}
            style={styles.sendBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={22} color={T.accent} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={startRecording}
      disabled={disabled}
      style={styles.btnWrap}
      activeOpacity={0.7}
    >
      <View style={[styles.btn, { opacity: disabled ? 0.5 : 1 }]}>
        <Ionicons
          name="mic-outline"
          size={20}
          color={disabled ? T.mutedText : T.textColor}
        />
      </View>
      <Text style={[styles.hint, { color: T.mutedText }]} numberOfLines={1}>
        {t("chat.composer.tapToRecord")}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnWrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  btn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: -2,
  },
  recordingBarContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },
  recordingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    minHeight: 44,
  },
  waveformWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: WAVEFORM_MAX,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
    minHeight: WAVEFORM_MIN,
  },
  cancelHint: {
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 90,
  },
  duration: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
  },
  sendBtn: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(VoiceRecorderButtonInner);
