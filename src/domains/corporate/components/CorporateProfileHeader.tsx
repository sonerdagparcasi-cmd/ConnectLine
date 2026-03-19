// src/domains/corporate/components/CorporateProfileHeader.tsx
// 🔒 VITRIN HEADER — SINGLE SOURCE OF TRUTH
//
// Kurallar:
// - Avatar / ad / başlık = profileView
// - Company prop = yapısal data (followers, sector vs.)
// - Header logic YOK, sadece render
// - UI-only

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { useCompany } from "../hooks/useCompany";
import type { Company } from "../types/company.types";

type Props = {
  company: Company;
  isOwner: boolean;
  onPressSettings?: () => void;
};

export default function CorporateProfileHeader({
  company,
  isOwner,
  onPressSettings,
}: Props) {
  const T = useAppTheme();

  // 🔒 SINGLE TRUTH — vitrin
  const { profileView } = useCompany(company.id);

  const avatar = profileView?.avatarUri;
  const name = profileView?.displayName || company.name;
  const title = profileView?.displayTitle || company.title || company.sector;

  return (
    <View style={styles.container}>
      {isOwner && (
        <TouchableOpacity onPress={onPressSettings} style={styles.settings}>
          <Ionicons name="ellipsis-vertical" size={18} color={T.textColor} />
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.avatar,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        {avatar ? (
          <Ionicons name="image" size={42} color={T.textColor} />
        ) : (
          <Ionicons name="business" size={42} color={T.textColor} />
        )}
      </View>

      <Text style={[styles.name, { color: T.textColor }]}>{name}</Text>

      <Text style={[styles.subtitle, { color: T.mutedText }]}>
        {title || ""}
        {company.location ? ` • ${company.location}` : ""}
      </Text>

      <Text style={[styles.followers, { color: T.mutedText }]}>
        {company.followers} takipçi
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  settings: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 8,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  followers: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
});