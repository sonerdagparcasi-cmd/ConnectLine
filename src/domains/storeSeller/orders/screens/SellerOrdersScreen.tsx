// src/domains/storeSeller/orders/screens/SellerOrdersScreen.tsx
// 🔒 SELLER ORDERS SCREEN – STABLE

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import type { StoreSellerStackParamList } from "../../navigation/StoreSellerNavigator";
import { sellerOrderService } from "../services/sellerOrderService";
import type { SellerOrder } from "../types/sellerOrder.types";

type Nav = NativeStackNavigationProp<StoreSellerStackParamList>;

export default function SellerOrdersScreen() {
  const T = useAppTheme();
  const nav = useNavigation<Nav>();

  const sellerId = "mockSeller";

  const [orders, setOrders] = useState<SellerOrder[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const list = await sellerOrderService.getSellerOrders(sellerId);
    setOrders(list);
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Siparişler
      </Text>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={40} color={T.mutedText} />
          <Text style={{ color: T.mutedText }}>Henüz sipariş yok</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
              onPress={() =>
                nav.navigate("SellerOrderDetail", { orderId: item.id })
              }
            >
              <Text style={{ color: T.textColor, fontWeight: "900" }}>
                Sipariş #{item.id.slice(-5)}
              </Text>

              <Text style={{ color: T.mutedText }}>
                {item.totalPrice} {item.currency}
              </Text>

              <Text style={{ color: T.mutedText, fontSize: 12 }}>
                Durum: {item.status}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
});