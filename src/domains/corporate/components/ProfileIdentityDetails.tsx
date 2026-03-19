// src/domains/corporate/components/ProfileIdentityDetails.tsx
// 🔒 FAZ 16 — Identity Details (Vitrine Read-Only)
// Amaç:
// - Kimlik + Profil bilgilerini ikonlu ve net göstermek
// - Bireysel / Şirket farkı gözetmeden çalışmak
// - UI-only, davranış YOK

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  profile: {
    displayName: string;
    displayTitle: string;
    about: string;
    career: string;
  };
};

function Row({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text?: string;
}) {
  const T = useAppTheme();
  if (!text || !text.trim()) return null;

  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={16}
        color={T.mutedText}
        style={{ marginTop: 2 }}
      />
      <Text style={[styles.text, { color: T.textColor }]}>
        {text}
      </Text>
    </View>
  );
}

export default function ProfileIdentityDetails({ profile }: Props) {
  const T = useAppTheme();

  const hasAny =
    !!profile.displayTitle ||
    !!profile.career ||
    !!profile.about;

  if (!hasAny) return null;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Row icon="briefcase-outline" text={profile.displayTitle} />
      <Row icon="ribbon-outline" text={profile.career} />
      <Row icon="information-circle-outline" text={profile.about} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  text: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    flex: 1,
  },
});