// src/domains/chat/screens/ChatCallsScreen.tsx
// Call history list – chat domain only

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import IncomingCallBanner from "../components/IncomingCallBanner";
import { chatCallService } from "../services/chatCallService";
import type { ChatCall } from "../types/chatCall.types";

function formatDuration(sec?: number): string {
  if (sec == null || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getPeerDisplayName(call: ChatCall): string {
  const peer = call.participants.find((p) => p.userId !== "me");
  return peer?.displayName ?? peer?.userId ?? "—";
}

function getPeerAvatar(call: ChatCall): string | undefined {
  const peer = call.participants.find((p) => p.userId !== "me");
  return peer?.avatarUri;
}

export default function ChatCallsScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const [calls, setCalls] = useState<ChatCall[]>(() => chatCallService.getCallHistory());

  useFocusEffect(
    useCallback(() => {
      setCalls(chatCallService.getCallHistory());
    }, [])
  );

  const keyExtractor = useCallback((item: ChatCall) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: ChatCall }) => {
      const name = getPeerDisplayName(item);
      const avatarUri = getPeerAvatar(item);
      const isMissed = item.state === "missed";
      const isOutgoing = item.participants[0]?.userId === "me";

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {}}
          style={[styles.row, { backgroundColor: T.cardBg, borderColor: T.border }]}
        >
          <View style={[styles.avatarWrap, { borderColor: T.border }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <Ionicons
                name={item.type === "video" ? "videocam" : "call"}
                size={20}
                color={T.textColor}
              />
            )}
          </View>
          <View style={styles.info}>
            <Text
              style={[styles.name, { color: isMissed ? C.danger : T.textColor }]}
              numberOfLines={1}
            >
              {name}
            </Text>
            <View style={styles.meta}>
              <Ionicons
                name={item.type === "video" ? "videocam" : "call"}
                size={14}
                color={T.mutedText}
              />
              <Text style={[styles.metaText, { color: T.mutedText }]}>
                {isOutgoing ? t("chat.call.outgoing") : t("chat.call.incoming")}
                {item.durationSec != null && item.durationSec > 0
                  ? ` · ${formatDuration(item.durationSec)}`
                  : isMissed
                    ? ` · ${t("chat.call.missed")}`
                    : ""}
              </Text>
            </View>
          </View>
          {isMissed && (
            <View style={styles.missedBadge}>
              <Ionicons name="close-circle" size={18} color={C.danger} />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [T, C]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.empty}>
        <Ionicons name="call-outline" size={48} color={T.mutedText} />
        <Text style={[styles.emptyText, { color: T.mutedText }]}>
          {t("chat.call.noCalls")}
        </Text>
      </View>
    ),
    [T]
  );

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <IncomingCallBanner />
      <AppGradientHeader
        title={t("chat.call.title")}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => {
              const call = chatCallService.simulateIncomingCall("u1", "audio", "Alice");
              navigation.navigate("ChatIncomingCall", { callId: call.id });
            }}
          >
            <Ionicons name="call" size={22} color={T.accent} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={calls}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 12 },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
  missedBadge: { marginLeft: 8 },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 15 },
});
