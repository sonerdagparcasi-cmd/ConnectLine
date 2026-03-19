// 🔒 STORE ORDER SUCCESS SCREEN (D-35..46) – STABLE

import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreStackParamList } from "../navigation/StoreNavigator";

/**
 * 🔒 StoreOrderSuccessScreen
 *
 * Kurallar:
 * - Checkout sonrası TEK YÖNLÜ başarı ekranı
 * - orderId param ile gelir
 * - Sepet temizliği checkout tarafında yapılmıştır
 * - Geri dönüşler stack’i bozmaz
 */

type Nav = NativeStackNavigationProp<StoreStackParamList>;
type R = RouteProp<StoreStackParamList, "StoreOrderSuccess">;

export default function StoreOrderSuccessScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();

  const orderId = route.params?.orderId;

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: T.textColor }]}>
          🎉 Sipariş Alındı
        </Text>

        {!!orderId && (
          <Text style={[styles.subtitle, { color: T.mutedText }]}>
            Sipariş No: {orderId}
          </Text>
        )}

        <Text style={[styles.desc, { color: T.mutedText }]}>
          Siparişin başarıyla oluşturuldu. Detaylarını “Siparişlerim”
          ekranından takip edebilirsin.
        </Text>

        <View style={styles.actions}>
          {/* 🔒 Orders (stack korunur) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: "StoreOrders" }],
              })
            }
            style={[styles.secondaryBtn, { borderColor: T.border }]}
          >
            <Text style={[styles.secondaryText, { color: T.textColor }]}>
              Siparişlerim
            </Text>
          </TouchableOpacity>

          {/* 🔒 Store Home (stack temiz) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: "StoreHome" }],
              })
            }
            style={[styles.primaryBtn, { backgroundColor: T.accent }]}
          >
            <Text style={styles.primaryText}>Mağazaya Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  desc: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  actions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },

  secondaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },

  secondaryText: {
    fontWeight: "900",
  },

  primaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "900",
  },
});