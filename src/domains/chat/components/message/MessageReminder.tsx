// src/domains/chat/components/message/MessageReminder.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { t } from "../../../../shared/i18n/t";

type Props = {
  note: string;
  date: string;
  time: string;
  isMine: boolean;
};

function MessageReminderInner({ note, date, time, isMine }: Props) {
  const T = useAppTheme();
  const color = isMine ? "#fff" : T.textColor;
  const subColor = isMine ? "rgba(255,255,255,0.7)" : T.mutedText;

  return (
    <View
      style={[styles.wrap, { borderColor: isMine ? (T.isDark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.4)") : T.border }]}
    >
      <View style={styles.header}>
        <Ionicons name="alarm" size={20} color={color} />
        <Text style={[styles.title, { color: subColor }]}>{t("chat.attach.reminder")}</Text>
      </View>
      <Text style={[styles.note, { color }]} numberOfLines={4}>
        {note}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.dateTime, { color: subColor }]}>
          {date} · {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    minWidth: 200,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  title: { fontSize: 11, fontWeight: "600" },
  note: { fontSize: 14, fontWeight: "500" },
  footer: { marginTop: 6 },
  dateTime: { fontSize: 12, fontWeight: "600" },
});

export default memo(MessageReminderInner);
