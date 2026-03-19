// src/domains/chat/screens/ChatCallScreen.tsx
// Active call UI – participant, duration timer, controls

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { CallControls } from "../components/call";
import { chatCallService } from "../services/chatCallService";
import type { ChatCall } from "../types/chatCall.types";

type Params = { callId?: string; chatId?: string; peerName?: string; video?: boolean };

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getPeerDisplayName(call: ChatCall): string {
  const peer = call.participants.find((p) => p.userId !== "me");
  return peer?.displayName ?? peer?.userId ?? "—";
}

export default function ChatCallScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params ?? {}) as Params;
  const { callId, peerName } = params;

  const resolveCall = (): ChatCall | null => {
    const active = chatCallService.getActiveCall();
    if (callId && active?.id === callId) return active;
    if (!callId && active) return active;
    return null;
  };

  const [call, setCall] = useState<ChatCall | null>(resolveCall);
  const [durationSec, setDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const c = resolveCall();
    if (c) setCall(c);
  }, [callId]);

  useEffect(() => {
    if (!call || call.state !== "active") return;
    timerRef.current = setInterval(() => {
      setDurationSec((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [call?.id, call?.state]);

  const handleEndCall = () => {
    if (call) chatCallService.endCall(call.id);
    navigation.goBack();
  };

  const displayName = call ? getPeerDisplayName(call) : peerName ?? "—";
  const isVideo = call?.type === "video";

  if (!call) {
    return (
      <View style={[styles.container, styles.connectingWrap, { backgroundColor: T.backgroundColor }]}>
        <Text style={[styles.connectingText, { color: T.mutedText }]}>{t("chat.call.connecting")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <View style={styles.top}>
        <View style={[styles.avatarWrap, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <Ionicons
            name={isVideo ? "videocam" : "call"}
            size={56}
            color={T.textColor}
          />
        </View>
        <Text style={[styles.name, { color: T.textColor }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.timer, { color: T.mutedText }]}>
          {call.state === "active" ? formatTimer(durationSec) : t("chat.call.connecting")}
        </Text>
      </View>

      <CallControls
        isMuted={isMuted}
        isCameraOn={isCameraOn}
        isSpeakerOn={isSpeakerOn}
        isVideoCall={isVideo}
        onToggleMute={() => setIsMuted((v) => !v)}
        onToggleCamera={() => setIsCameraOn((v) => !v)}
        onToggleSpeaker={() => setIsSpeakerOn((v) => !v)}
        onEndCall={handleEndCall}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  connectingWrap: { justifyContent: "center", alignItems: "center" },
  connectingText: { fontSize: 16 },
  top: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 20,
  },
  timer: {
    fontSize: 16,
    marginTop: 8,
  },
});
