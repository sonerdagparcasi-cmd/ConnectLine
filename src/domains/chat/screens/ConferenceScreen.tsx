import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { useConference } from "../hooks/useConference";

/**
 * ConferenceScreen
 * - Çoklu katılımcı konferans ekranı
 * - UI ONLY
 * - Media / RTC / backend YOK
 * - Tema & i18n UYUMLU
 */

export default function ConferenceScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const T = useAppTheme();
  const C = getColors(T.isDark);

  const { conferenceId } = route.params;
  const conf = useConference(conferenceId);

  useEffect(() => {
    conf.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conferenceId]);

  if (!conf.conference) {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.mutedText }}>{t("conference.loading")}</Text>
      </View>
    );
  }

  const { participants, hostUserId, status } = conf.conference;

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.textColor }]}>
          {t("conference.title")}
        </Text>
        <Text style={{ color: T.mutedText, fontSize: 12 }}>
          {status === "active" ? t("conference.ongoing") : t("conference.starting")}
        </Text>
      </View>

      {/* PARTICIPANTS GRID */}
      <FlatList
        data={participants}
        numColumns={2}
        keyExtractor={(p) => p.userId}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isHost = item.userId === hostUserId;

          return (
            <View
              style={[
                styles.tile,
                {
                  backgroundColor: T.cardBg,
                  borderColor: T.border,
                },
              ]}
            >
              <Ionicons
                name={item.isVideoEnabled ? "person" : "person-outline"}
                size={32}
                color={T.textColor}
              />

              <Text
                style={{
                  color: T.textColor,
                  fontSize: 12,
                  marginTop: 6,
                  fontWeight: "600",
                }}
              >
                {item.userId}
              </Text>

              {isHost && (
                <Text style={{ color: T.accent, fontSize: 11, marginTop: 2 }}>
                  {t("conference.host")}
                </Text>
              )}
            </View>
          );
        }}
      />

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <Ionicons name="mic-off" size={20} color={T.textColor} />
          <Text style={[styles.actionText, { color: T.textColor }]}>
            {t("conference.mute")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <Ionicons name="videocam-off" size={20} color={T.textColor} />
          <Text style={[styles.actionText, { color: T.textColor }]}>
            {t("conference.cameraOff")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.endBtn, { backgroundColor: C.danger }]} onPress={() => navigation.goBack()}>
          <Ionicons name="call" size={20} color={C.buttonText} />
          <Text style={[styles.endText, { color: C.buttonText }]}>{t("conference.leave")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: { alignItems: "center", paddingVertical: 16, gap: 4 },

  title: { fontSize: 17, fontWeight: "600" },

  grid: { paddingHorizontal: 12, gap: 12 },

  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
  },

  actions: { padding: 16, gap: 10 },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
  },

  actionText: { fontSize: 13, fontWeight: "500" },

  endBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 26,
    backgroundColor: "#e53935",
    marginTop: 4,
  },

  endText: { fontWeight: "600", fontSize: 14 },
});