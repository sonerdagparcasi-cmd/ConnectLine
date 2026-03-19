import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { chatService } from "../services/chatService";
import type { Call, CallType } from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type Params = {
  type: CallType;
  userId: string;
  source?: "call_detail" | "history" | "direct"; // non-breaking
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function CallScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { type, userId } = route.params as Params;
  const isVideo = type === "video";

  const [call, setCall] = useState<Call | null>(null);

  // lifecycle guards
  const endedRef = useRef(false);
  const mountedRef = useRef(false);

  /* ------------------------------------------------------------------ */
  /* 🔒 C12 — CALL LIFECYCLE OWNER                                      */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    mountedRef.current = true;

    // CallScreen mount → call başlatılır
    const started = chatService.startCall("me", userId, type);
    setCall(started);

    return () => {
      mountedRef.current = false;

      // ekran kapanırken ve kullanıcı açıkça bitirmediyse
      if (!endedRef.current && started?.id) {
        chatService.finishCall(started.id, "missed");
      }
    };
  }, [type, userId]);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  function openCallsHistory() {
    navigation.navigate("CallsHistory");
  }

  function endCall() {
    if (!call) return;
    if (endedRef.current) return;

    endedRef.current = true;
    chatService.finishCall(call.id, "completed");

    navigation.goBack();
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: T.backgroundColor },
      ]}
    >
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: T.textColor }]}>
            {isVideo ? t("call.video") : t("call.audio")}
          </Text>

          {/* 🔒 Tek history entry point */}
          <TouchableOpacity
            onPress={openCallsHistory}
            activeOpacity={0.85}
            style={[
              styles.historyBtn,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Ionicons name="time-outline" size={18} color={T.textColor} />
          </TouchableOpacity>
        </View>

        <Text style={{ color: T.mutedText, fontSize: 13 }}>
          {t("call.connecting")}
        </Text>
      </View>

      {/* ================= AVATAR ================= */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <Ionicons
          name={isVideo ? "videocam" : "call"}
          size={48}
          color={T.textColor}
        />
      </View>

      {/* ================= ACTIONS ================= */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <Ionicons name="mic-off" size={22} color={T.textColor} />
          <Text style={[styles.actionLabel, { color: T.textColor }]}>
            {t("call.mute")}
          </Text>
        </TouchableOpacity>

        {isVideo && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Ionicons
              name="videocam-off"
              size={22}
              color={T.textColor}
            />
            <Text style={[styles.actionLabel, { color: T.textColor }]}>
              {t("call.cameraOff")}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.endBtn,
            { backgroundColor: C.danger },
          ]}
          onPress={endCall}
        >
          <Ionicons name="call" size={22} color={C.buttonText} />
          <Text style={[styles.endLabel, { color: C.buttonText }]}>
            {t("call.end")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },

  header: {
    alignItems: "center",
    gap: 6,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  actions: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 14,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },

  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  endBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 8,
  },

  endLabel: {
    fontWeight: "600",
    fontSize: 15,
  },
});