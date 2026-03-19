// src/domains/corporate/components/SuggestedCompanyCard.tsx
// 🔒 ADIM 10 UI-ONLY component (mini follow / hide)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { useAppTheme } from "../../../shared/theme/appTheme";
import type { Company } from "../types/company.types";

export default function SuggestedCompanyCard({
  company,
  onPress,
  onHide,
  onToggleMiniFollow,
  isMiniFollowing,
  T,
}: {
  company: Company;
  onPress: () => void;
  onHide: () => void;
  onToggleMiniFollow: () => void;
  isMiniFollowing: boolean;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {/* top row: avatar + hide */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: T.backgroundColor, borderColor: T.border },
          ]}
        >
          <Ionicons name="business" size={18} color={T.textColor} />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onHide}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.hideBtn}
        >
          <Ionicons name="close" size={16} color={T.mutedText} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.name, { color: T.textColor }]} numberOfLines={1}>
        {company.name}
      </Text>

      <Text style={[styles.sector, { color: T.mutedText }]} numberOfLines={1}>
        {company.sector}
      </Text>

      {/* mini follow */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggleMiniFollow}
        style={[
          styles.miniBtn,
          {
            backgroundColor: isMiniFollowing ? T.border : T.accent,
          },
        ]}
      >
        <Text
          style={{
            color: isMiniFollowing ? T.textColor : "#fff",
            fontWeight: "900",
            fontSize: 12,
          }}
        >
          {isMiniFollowing ? "Takip ediliyor" : "Takip et"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  hideBtn: {
    paddingLeft: 6,
    paddingBottom: 2,
  },

  name: {
    fontSize: 13,
    fontWeight: "900",
  },

  sector: {
    fontSize: 12,
  },

  miniBtn: {
    marginTop: 4,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
});