// src/domains/corporate/components/OwnerEditModeBanner.tsx
// 🔒 FAZ 9B / ADIM 1 — Owner Edit Mode Banner (UI-only)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  visible: boolean;
};

export default function OwnerEditModeBanner({ visible }: Props) {
  const T = useAppTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Ionicons name="create-outline" size={16} color={T.accent} />
      <Text style={[styles.text, { color: T.textColor }]}>
        Düzenleme modundasın. Yaptığın değişiklikler kaydedilmeden yayına
        alınmaz.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
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