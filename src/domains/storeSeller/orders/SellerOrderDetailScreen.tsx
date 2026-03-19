// src/domains/storeSeller/orders/SellerOrderDetailScreen.tsx
// 🔒 SELLER ORDER DETAIL — STABLE

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function SellerOrderDetailScreen() {
  const T = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Sipariş Detayı
      </Text>

      <Text style={{ color: T.mutedText }}>
        Satıcı sipariş detay ekranı
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
});