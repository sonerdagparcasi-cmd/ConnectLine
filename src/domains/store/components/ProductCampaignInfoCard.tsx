import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreCampaign } from "../types/storeCampaign.types";

type Props = {
  campaign: StoreCampaign;
  onPressDetail?: () => void;
};

export default function ProductCampaignInfoCard({ campaign, onPressDetail }: Props) {
  const T = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Text style={[styles.emoji]}>{campaign.bannerEmoji ?? "🎉"}</Text>
          <Text style={[styles.title, { color: T.textColor }]}>{campaign.title}</Text>
        </View>

        {onPressDetail && (
          <TouchableOpacity
            onPress={onPressDetail}
            activeOpacity={0.9}
            style={[styles.detailBtn, { borderColor: T.border }]}
          >
            <Ionicons name="chevron-forward" size={16} color={T.textColor} />
          </TouchableOpacity>
        )}
      </View>

      {!!campaign.subtitle && (
        <Text style={[styles.subtitle, { color: T.mutedText }]}>
          {campaign.subtitle}
        </Text>
      )}

      {!!campaign.badgeText && (
        <View style={styles.badgeRow}>
          <Ionicons name="pricetag" size={14} color={T.accent} />
          <Text style={[styles.badgeText, { color: T.accent }]}>
            {campaign.badgeText}
          </Text>
        </View>
      )}

      <Text style={[styles.note, { color: T.mutedText }]}>
        Kampanya bu ürün için geçerlidir.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  emoji: { fontSize: 18 },
  title: { fontSize: 14, fontWeight: "900", flex: 1 },

  detailBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  subtitle: { fontSize: 12, fontWeight: "800" },

  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  badgeText: { fontSize: 12, fontWeight: "900" },

  note: { fontSize: 11, fontWeight: "800", marginTop: 4 },
});