// src/domains/store/screens/StoreOrdersScreen.tsx
// 🔒 STORE ORDERS SCREEN (D-35..46) – STABLE / FINAL
// UPDATE:
// - Order icon Ionicons yerine emoji 📝 kullanıldı
// - Mimari korunarak stabil hale getirildi

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

import { useAppTheme } from "../../../shared/theme/appTheme";
import { storeIcons } from "../constants/storeIcons";
import type { StoreStackParamList } from "../navigation/StoreNavigator";

import { getOrders } from "../services/storeOrderService";

import type {
  StoreOrder,
  StoreOrderStatus,
} from "../types/storeOrder.types";

type Nav = NativeStackNavigationProp<StoreStackParamList, "StoreOrders">;

export default function StoreOrdersScreen() {

  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ------------------------------------------------------------------ */
  /* LOAD                                                               */
  /* ------------------------------------------------------------------ */

  async function load() {

    try {

      setIsLoading(true);

      const list = await getOrders();

      setOrders(list);

    } finally {

      setIsLoading(false);

    }

  }

  useEffect(() => {
    load();
  }, []);

  /* ------------------------------------------------------------------ */
  /* STATUS META                                                        */
  /* ------------------------------------------------------------------ */

  function getStatusMeta(status: StoreOrderStatus) {

    switch (status) {

      case "new":
        return {
          icon: "time-outline",
          color: "#ff9f0a",
          label: "Yeni Sipariş",
        };

      case "processing":
        return {
          icon: "cube-outline",
          color: "#ff9f0a",
          label: "Hazırlanıyor",
        };

      case "shipped":
        return {
          icon: "car-outline",
          color: "#007aff",
          label: "Kargoda",
        };

      case "delivered":
        return {
          icon: "checkmark-circle",
          color: "#34c759",
          label: "Teslim edildi",
        };

      case "cancelled":
        return {
          icon: "close-circle",
          color: "#ff3b30",
          label: "İptal edildi",
        };

      default:
        return {
          icon: "cube-outline",
          color: T.mutedText,
          label: status,
        };

    }

  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (

    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.headerLeft}>

          <Text style={styles.orderEmoji}>📝</Text>

          <Text style={[styles.title, { color: T.textColor }]}>
            Siparişlerim
          </Text>

        </View>

        {isLoading && (
          <Text style={[styles.subtle, { color: T.mutedText }]}>
            Yükleniyor…
          </Text>
        )}

      </View>

      {/* LIST */}

      <FlatList
        data={orders}
        keyExtractor={(i) => i.id}
        onRefresh={load}
        refreshing={isLoading}
        contentContainerStyle={
          orders.length === 0 ? styles.emptyWrap : undefined
        }
        ListEmptyComponent={
          <View style={styles.center}>

            <Ionicons
              name={storeIcons.shopping}
              size={28}
              color={T.mutedText}
            />

            <Text style={{ color: T.mutedText, fontWeight: "800", marginTop: 6 }}>
              Sipariş yok
            </Text>

            <Text style={{ color: T.mutedText, marginTop: 4 }}>
              İlk siparişini oluşturmak için alışveriş yap.
            </Text>

          </View>
        }
        renderItem={({ item }) => {

          const meta = getStatusMeta(item.status);

          return (

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate("StoreOrderDetail", {
                  orderId: item.id,
                })
              }
              style={[
                styles.card,
                {
                  backgroundColor: T.cardBg,
                  borderColor: T.border,
                },
              ]}
            >

              <View style={styles.row}>

                <View style={styles.orderRow}>

                  <Text style={styles.orderEmojiSmall}>📝</Text>

                  <Text
                    style={{ color: T.textColor, fontWeight: "900" }}
                    numberOfLines={1}
                  >
                    {item.id}
                  </Text>

                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: meta.color + "22" },
                  ]}
                >

                  <Ionicons
                    name={meta.icon as any}
                    size={12}
                    color={meta.color}
                  />

                  <Text
                    style={[
                      styles.badgeText,
                      { color: meta.color },
                    ]}
                  >
                    {meta.label}
                  </Text>

                </View>

              </View>

              <Text style={{ color: T.mutedText, fontWeight: "800" }}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>

              <Text
                style={{
                  color: T.accent,
                  fontWeight: "900",
                  marginTop: 4,
                }}
              >
                ₺{item.total.toFixed(2)}
              </Text>

            </TouchableOpacity>

          );

        }}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
  },

  subtle: {
    fontSize: 12,
    fontWeight: "800",
  },

  emptyWrap: {
    flexGrow: 1,
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "900",
  },

  orderEmoji: {
    fontSize: 18,
  },

  orderEmojiSmall: {
    fontSize: 16,
  },

});