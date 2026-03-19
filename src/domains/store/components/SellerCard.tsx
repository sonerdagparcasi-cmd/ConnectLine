// src/domains/store/components/SellerCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreSeller } from "../types/store.types";

export default function SellerCard({
  seller,
  onPress,
}: {
  seller: StoreSeller;
  onPress?: () => void;
}) {
  const T = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}
    >
      <View style={styles.left}>
        <View style={[styles.avatar, { borderColor: T.border }]}>
          <Ionicons name="storefront-outline" size={18} color={T.mutedText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: T.textColor }]} numberOfLines={1}>
            {seller.name}
          </Text>
          <Text style={[styles.meta, { color: T.mutedText }]} numberOfLines={1}>
            {seller.city ?? "—"} • ⭐ {(seller.rating ?? 0).toFixed(1)}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={T.mutedText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 14, fontWeight: "900" },
  meta: { fontSize: 12, fontWeight: "700" },
});