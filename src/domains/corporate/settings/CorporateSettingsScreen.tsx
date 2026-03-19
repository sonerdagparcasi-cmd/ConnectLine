// src/domains/corporate/settings/CorporateSettingsScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import CorporateTopBar from "../components/CorporateTopBar";

/**
 * CorporateSettingsScreen
 *
 * - SADECE Kurumsal domain
 * - Chat / Social / Store ile KARIŞMAZ
 * - Kimlik seçimi (Şirket / Bireysel)
 * - Backend YOK (UI-level mock)
 * - Mimari KİLİTLİ
 */

type CorporateIdentityType = "company" | "individual" | null;

export default function CorporateSettingsScreen() {
  const T = useAppTheme();
  const [identityType, setIdentityType] = useState<CorporateIdentityType>(null);

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title={t("corporate.settings.title")} />

      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: T.textColor }]}>
          {t("corporate.settings.identityType")}
        </Text>

        <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <OptionRow
            label={t("corporate.settings.company")}
            active={identityType === "company"}
            onPress={() => setIdentityType("company")}
          />
          <OptionRow
            label={t("corporate.settings.individual")}
            active={identityType === "individual"}
            onPress={() => setIdentityType("individual")}
          />
        </View>

        <Text style={{ color: T.mutedText, marginTop: 14 }}>
          {t("corporate.settings.note")}
        </Text>
      </View>
    </View>
  );
}

function OptionRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const T = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.row}
      activeOpacity={0.85}
    >
      <Text style={{ color: T.textColor, fontWeight: "800" }}>{label}</Text>

      <View
        style={[
          styles.radio,
          {
            borderColor: T.border,
            backgroundColor: active ? "rgba(127,127,127,0.20)" : "transparent",
          },
        ]}
      >
        {active ? (
          <Ionicons name="checkmark" size={16} color={T.textColor} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  row: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});