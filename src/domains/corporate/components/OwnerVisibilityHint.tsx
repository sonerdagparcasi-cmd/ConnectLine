// src/domains/corporate/components/OwnerViewProfileHint.tsx
// 🔒 FAZ 9A / ADIM 2 — Owner View Profile Hint (UI-only)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  isOwner: boolean;
  onPress: () => void;
};

export default function OwnerViewProfileHint({
  isOwner,
  onPress,
}: Props) {
  const T = useAppTheme();

  if (!isOwner) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Ionicons
        name="eye-outline"
        size={16}
        color={T.mutedText}
      />

      <Text style={[styles.text, { color: T.mutedText }]}>
        Profilini ziyaretçi gibi görüntüle
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});