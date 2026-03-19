// src/domains/chat/screens/ChatPrivacyScreen.tsx
// Last seen, profile photo, read receipts, blocked users

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import { useChatSettings } from "../hooks/useChatSettings";

export default function ChatPrivacyScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const { settings, update } = useChatSettings();
  const [blockedOpen, setBlockedOpen] = useState(false);

  const MOCK_BLOCKED = [
    { id: "u2", name: "User Two" },
    { id: "u3", name: "User Three" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title={t("chat.privacy.title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Row
          label={t("chat.privacy.lastSeen")}
          value={settings.showLastSeen}
          onChange={(v) => update({ showLastSeen: v })}
          T={T}
          thumbColor={C.buttonText}
        />
        <Row
          label={t("chat.privacy.profilePhoto")}
          value={true}
          onChange={() => {}}
          T={T}
          thumbColor={C.buttonText}
        />
        <Row
          label={t("chat.privacy.readReceipts")}
          value={settings.showReadReceipts}
          onChange={(v) => update({ showReadReceipts: v })}
          T={T}
          thumbColor={C.buttonText}
        />
        <TouchableOpacity
          style={[styles.actionRow, { borderColor: T.border }]}
          onPress={() => setBlockedOpen(true)}
        >
          <Text style={[styles.actionLabel, { color: T.textColor }]}>
            {t("chat.privacy.blockedUsers")} ({settings.blockedUsers.length})
          </Text>
          <Ionicons name="chevron-forward" size={20} color={T.mutedText} />
        </TouchableOpacity>
      </ScrollView>

      {blockedOpen && (
        <View style={[styles.sheet, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: T.textColor }]}>
              {t("chat.privacy.blockedUsers")}
            </Text>
            <TouchableOpacity onPress={() => setBlockedOpen(false)}>
              <Ionicons name="close" size={24} color={T.textColor} />
            </TouchableOpacity>
          </View>
          {MOCK_BLOCKED.map((u) => (
            <View key={u.id} style={[styles.blockedRow, { borderColor: T.border }]}>
              <Text style={{ color: T.textColor }}>{u.name}</Text>
              <TouchableOpacity onPress={() => update({ blockedUsers: settings.blockedUsers.filter((id) => id !== u.id) })}>
                <Text style={{ color: T.accent, fontWeight: "600" }}>{t("chat.profile.unblock")}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Row({
  label,
  value,
  onChange,
  T,
  thumbColor,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  T: any;
  thumbColor: string;
}) {
  return (
    <View style={[styles.row, { borderColor: T.border }]}>
      <Text style={[styles.label, { color: T.textColor }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: T.border, true: T.accent }}
        thumbColor={thumbColor}
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
  scroll: { paddingVertical: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  label: { fontSize: 15 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  actionLabel: { fontSize: 15 },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
    maxHeight: "50%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700" },
  blockedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});
