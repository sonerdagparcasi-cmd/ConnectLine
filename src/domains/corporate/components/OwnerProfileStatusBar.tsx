// src/domains/corporate/components/OwnerProfileStatusBar.tsx
// 🔒 FAZ 9A / ADIM 1 — Owner Profile Status Bar (UI-only)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  isOwner: boolean;
  missingCount: number;
};

export default function OwnerProfileStatusBar({
  isOwner,
  missingCount,
}: Props) {
  const T = useAppTheme();

  // Sadece owner görür
  if (!isOwner) return null;

  const isComplete = missingCount === 0;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: T.cardBg,
          borderColor: T.border,
        },
      ]}
    >
      <Ionicons
        name={isComplete ? "checkmark-circle" : "information-circle"}
        size={16}
        color={isComplete ? T.accent : T.mutedText}
      />

      <Text
        style={[
          styles.text,
          { color: isComplete ? T.textColor : T.mutedText },
        ]}
      >
        {isComplete
          ? "Profilin yayında ve güçlü görünüyor."
          : "Profilin yayında. İstersen bazı alanları güçlendirebilirsin."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
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
    flexShrink: 1,
  },
});