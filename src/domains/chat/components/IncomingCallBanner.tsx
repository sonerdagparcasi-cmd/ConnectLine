// src/domains/chat/components/IncomingCallBanner.tsx
// In-app banner when there is an incoming call and user is not on the call screen

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { useIncomingCall } from "../hooks/useIncomingCall";
import type { ChatCall } from "../types/chatCall.types";

export default function IncomingCallBanner() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const incomingCall = useIncomingCall();

  if (!incomingCall || route.name === "ChatIncomingCall") return null;

  const callerName =
    incomingCall.participants.find((p) => p.userId !== "me")?.displayName ??
    incomingCall.callerId ??
    "—";
  const isVideo = incomingCall.type === "video";

  const openIncomingCall = () => {
    navigation.navigate("ChatIncomingCall", { callId: incomingCall.id });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={openIncomingCall}
      style={[styles.banner, { backgroundColor: T.cardBg, borderColor: T.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: T.accent + "22" }]}>
        <Ionicons
          name={isVideo ? "videocam" : "call"}
          size={22}
          color={T.accent}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: T.textColor }]} numberOfLines={1}>
          {callerName}
        </Text>
        <Text style={[styles.subtitle, { color: T.mutedText }]}>
          {t("chat.notification.incomingCall")} · {isVideo ? t("chat.call.video") : t("chat.call.audio")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={T.mutedText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },
});
