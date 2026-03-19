// 🔒 ProfileVisitorFeedbackToast (UI-only)
// Amaç: Kullanıcı aksiyonuna anlık, geçici geri bildirim
// Kural: local state, timeout, servis yok

import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export type FeedbackType = "followed" | "saved" | "hidden";

type Props = {
  type: FeedbackType | null;
  onHide: () => void;
};

export default function ProfileVisitorFeedbackToast({ type, onHide }: Props) {
  const T = useAppTheme();

  useEffect(() => {
    if (!type) return;
    const t = setTimeout(onHide, 2200);
    return () => clearTimeout(t);
  }, [type, onHide]);

  if (!type) return null;

  const map = {
    followed: {
      icon: "checkmark-circle",
      text: "Takip edildi",
    },
    saved: {
      icon: "bookmark",
      text: "Kaydedildi",
    },
    hidden: {
      icon: "eye-off",
      text: "Bu öneri gizlendi",
    },
  } as const;

  const cfg = map[type];

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Ionicons name={cfg.icon as any} size={16} color={T.accent} />
      <Text style={[styles.text, { color: T.textColor }]}>
        {cfg.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: "800",
  },
});