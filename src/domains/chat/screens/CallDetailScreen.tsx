// src/domains/chat/screens/CallDetailScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { useCalls } from "../hooks/useCalls";
import type { ChatStackParamList } from "../navigation/ChatNavigator";
import type { Call, CallStatus } from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* ROUTE                                                              */
/* ------------------------------------------------------------------ */

type Route = RouteProp<ChatStackParamList, "CallDetail">;

/* ------------------------------------------------------------------ */
/* UI HELPERS                                                          */
/* ------------------------------------------------------------------ */

function isGroupCall(call: Call) {
  return !!(call as any).chatId && Array.isArray((call as any).participantIds);
}

function groupCount(call: Call) {
  return (call as any).participantIds?.length ?? 0;
}

function statusText(status: CallStatus) {
  switch (status) {
    case "ringing":
      return "Çalıyor";
    case "completed":
      return "Tamamlandı";
    case "missed":
      return "Cevapsız";
    case "rejected":
      return "Reddedildi";
    default:
      return status;
  }
}

function statusColor(status: CallStatus, muted: string, danger: string, accent: string) {
  if (status === "missed") return danger;
  if (status === "rejected") return muted;
  if (status === "ringing") return accent;
  return muted;
}

function formatDuration(sec?: number) {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString().slice(0, 5)}`;
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function CallDetailScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();

  const { getCallById, deleteCall } = useCalls();

  const callId = route.params?.callId;

  const call = useMemo<Call | undefined>(() => {
    if (!callId) return undefined;
    return getCallById(callId);
  }, [callId, getCallById]);

  /* ---------------- GUARD ---------------- */

  if (!call) {
    return (
      <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.mutedText, fontWeight: "700" }}>
          Çağrı bulunamadı.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { borderColor: T.border }]}
        >
          <Text style={{ color: T.textColor, fontWeight: "800" }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * TS guard sonrası bazı ortamlarda closure içinde `call` için
   * "possibly undefined" uyarısı verebiliyor.
   * Bu yüzden guard sonrası tek bir "safe" referans kullanıyoruz.
   */
  const c: Call = call;

  const isVideo = c.type === "video";
  const group = isGroupCall(c);

  /* ------------------------------------------------------------------ */
  /* 🔒 C11 — CALL AGAIN (NAV ONLY)                                     */
  /* ------------------------------------------------------------------ */

  function handleCallAgain() {
    if (group) {
      // 🔒 C5.1 — Placeholder (Group CallScreen ileride)
      Alert.alert(
        "Grup çağrısı",
        "Grup çağrıları bir sonraki adımda aktif edilecek."
      );
      return;
    }

    navigation.navigate("Call", {
      type: c.type,
      userId: c.toUserId,
      source: "call_detail", // future-proof (opsiyonel)
    });
  }

  function handleDelete() {
    Alert.alert(
      "Sil",
      "Bu çağrı kaydı silinsin mi?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteCall(c.id);
            navigation.goBack();
          },
        },
      ],
      { cancelable: true }
    );
  }

  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader title="Çağrı Detayı" onBack={() => navigation.goBack()} />
      <View
        style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}
      >
        {/* HEADER */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconWrap,
              { borderColor: T.border, backgroundColor: T.cardBg },
            ]}
          >
            <Ionicons
              name={
                group
                  ? "people-outline"
                  : isVideo
                  ? "videocam-outline"
                  : "call-outline"
              }
              size={22}
              color={T.textColor}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: T.textColor }]}>
              {group ? "Grup çağrısı" : c.toUserId}
            </Text>
            <Text
              style={[
                styles.sub,
                { color: statusColor(c.status, T.mutedText, C.danger, T.accent) },
              ]}
            >
              {group
                ? `👥 ${groupCount(c)} kişi`
                : isVideo
                ? "Görüntülü"
                : "Sesli"}{" "}
              • {statusText(c.status)}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: T.border }]} />

        {/* META */}
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: T.mutedText }]}>Yön</Text>
          <Text style={[styles.metaValue, { color: T.textColor }]}>
            {c.direction === "incoming" ? "Gelen" : "Giden"}
          </Text>
        </View>

        {group && (
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: T.mutedText }]}>Katılımcı</Text>
            <Text style={[styles.metaValue, { color: T.textColor }]}>
              {groupCount(c)} kişi
            </Text>
          </View>
        )}

        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: T.mutedText }]}>Süre</Text>
          <Text style={[styles.metaValue, { color: T.textColor }]}>
            {formatDuration(c.durationSec)}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: T.mutedText }]}>Tarih</Text>
          <Text style={[styles.metaValue, { color: T.textColor }]}>
            {formatDate(c.startedAt)}
          </Text>
        </View>

        {/* ACTIONS */}
        <TouchableOpacity
          onPress={handleCallAgain}
          style={[
            styles.primaryBtn,
            { borderColor: T.border, backgroundColor: T.backgroundColor },
          ]}
        >
          <Ionicons
            name={group ? "people" : isVideo ? "videocam" : "call"}
            size={18}
            color={T.textColor}
          />
          <Text style={[styles.btnText, { color: T.textColor }]}>Tekrar Ara</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.dangerBtn, { borderColor: C.danger }]}
        >
          <Ionicons name="trash-outline" size={18} color={C.danger} />
          <Text style={[styles.btnText, { color: C.danger }]}>Kaydı Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  sub: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "800",
  },
  primaryBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dangerBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  backBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignSelf: "flex-start",
  },
});