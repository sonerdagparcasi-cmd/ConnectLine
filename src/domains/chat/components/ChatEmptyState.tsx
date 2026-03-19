// src/domains/chat/components/ChatEmptyState.tsx
// Reusable empty state: icon, title, description, optional CTA

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function ChatEmptyState({
  icon = "chatbubbles-outline",
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: T.border + "40" }]}>
        <Ionicons name={icon} size={48} color={T.mutedText} />
      </View>
      <Text style={[styles.title, { color: T.textColor }]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, { color: T.mutedText }]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.btn, { backgroundColor: T.accent }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color={C.buttonText} style={styles.btnIcon} />
          <Text style={[styles.btnText, { color: C.buttonText }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  desc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnIcon: { marginRight: 8 },
  btnText: { fontSize: 15, fontWeight: "700" },
});
