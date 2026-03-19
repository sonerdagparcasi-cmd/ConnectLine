// src/domains/store/components/StoreCartBadge.tsx
// 🔒 STORE CART BADGE – STABLE

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  count: number;
  color: string;
};

export default function StoreCartBadge({ count, color }: Props) {

  const safeCount = Math.max(0, count || 0);

  return (
    <View style={styles.container}>
      <Ionicons
        name="cart-outline"
        size={22}
        color={color}
      />

      {safeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.text}>
            {safeCount > 9 ? "9+" : safeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "#ff3b30",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  text: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
});