// src/domains/corporate/components/CorporateTrustSignal.tsx
// 🔒 ADIM 15.1 — Trust Signal (UI-only)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

/**
 * 🔒 CorporateTrustSignal
 *
 * AMAÇ:
 * - Kurumsal profilde "güvenilir / düzenli" hissi
 * - Backend, doğrulama veya claim YOK
 *
 * KURALLAR:
 * - UI-only
 * - Sessiz component (gerek yoksa render olmaz)
 * - Screen logic taşımaz
 */

type Props = {
  isRecentlyActive?: boolean;
  hasWebsite?: boolean;
  hasDescription?: boolean;
  hasLocation?: boolean;
};

export default function CorporateTrustSignal({
  isRecentlyActive,
  hasWebsite,
  hasDescription,
  hasLocation,
}: Props) {
  const T = useAppTheme();

  const items = [
    isRecentlyActive
      ? { icon: "pulse", label: "Aktif" }
      : null,
    hasWebsite
      ? { icon: "globe-outline", label: "Web sitesi" }
      : null,
    hasDescription
      ? { icon: "document-text-outline", label: "Profil bilgisi" }
      : null,
    hasLocation
      ? { icon: "location-outline", label: "Konum" }
      : null,
  ].filter(Boolean) as { icon: any; label: string }[];

  if (items.length === 0) return null;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {items.map((it) => (
        <View key={it.label} style={styles.item}>
          <Ionicons name={it.icon} size={14} color={T.accent} />
          <Text style={[styles.text, { color: T.textColor }]}>
            {it.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});