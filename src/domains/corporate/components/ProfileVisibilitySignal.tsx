// src/domains/corporate/components/ProfileVisibilitySignal.tsx
// 🔒 ADIM 16.1 — Profile Visibility Signal (UI-only)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

/**
 * ProfileVisibilitySignal
 *
 * AMAÇ:
 * - Profilin paylaşılabilir / görünür olduğu hissini vermek
 * - Ziyaretçi ve sahip için pasif güven sinyali
 *
 * KURALLAR:
 * - UI-only
 * - Zorlayıcı CTA yok
 * - Backend / analytics yok
 */

type Props = {
  /**
   * Profil herkese açık mı hissi
   * Şimdilik her zaman true (UI-only)
   */
  isPublic?: boolean;
};

export default function ProfileVisibilitySignal({
  isPublic = true,
}: Props) {
  const T = useAppTheme();

  if (!isPublic) return null;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Ionicons
        name="globe-outline"
        size={16}
        color={T.mutedText}
        style={{ marginTop: 1 }}
      />
      <Text style={[styles.text, { color: T.mutedText }]}>
        Bu profil herkese açık ve paylaşılabilir
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});