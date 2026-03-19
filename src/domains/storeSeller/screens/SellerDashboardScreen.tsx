// src/domains/storeSeller/screens/SellerDashboardScreen.tsx
// 🔒 SELLER DASHBOARD — STABLE / UX CONNECTED

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreSellerStackParamList } from "../navigation/StoreSellerNavigator";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type Nav = NativeStackNavigationProp<StoreSellerStackParamList>;

type DashboardCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  onPress: () => void;
  T: ReturnType<typeof useAppTheme>;
};

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SellerDashboardScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  /* ------------------------------------------------------------------ */
  /* METRICS (UI ONLY)                                                 */
  /* ------------------------------------------------------------------ */

  const metrics = useMemo(
    () => [
      {
        label: "Bugün Sipariş",
        value: "0",
        onPress: () => navigation.navigate("SellerOrders"),
      },
      {
        label: "Toplam Satış",
        value: "0₺",
        onPress: () => navigation.navigate("SellerReports"),
      },
      {
        label: "Aktif Ürün",
        value: "0",
        onPress: () => navigation.navigate("SellerProducts"),
      },
      {
        label: "Aktif Kampanya",
        value: "0",
        onPress: () => navigation.navigate("SellerCampaigns"),
      },
    ],
    [navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: T.textColor }]}>
            Satıcı Paneli
          </Text>

          <Text style={[styles.subtitle, { color: T.mutedText }]}>
            Mağazanı buradan yönet
          </Text>
        </View>

        {/* QUICK ACTIONS */}

        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("SellerProducts")}
            style={[
              styles.quickBtn,
              { borderColor: T.border },
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={18}
              color={T.textColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("SellerOrders")}
            style={[
              styles.quickBtn,
              { borderColor: T.border },
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={T.textColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* METRICS */}

      <View style={styles.metricsRow}>
        {metrics.map((m) => (
          <TouchableOpacity
            key={m.label}
            activeOpacity={0.85}
            onPress={m.onPress}
            style={[
              styles.metricBox,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Text style={[styles.metricValue, { color: T.textColor }]}>
              {m.value}
            </Text>

            <Text style={[styles.metricLabel, { color: T.mutedText }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DASHBOARD GRID */}

      <View style={styles.grid}>
        <DashboardCard
          icon="cube-outline"
          label="Ürünler"
          hint="Ürün ekle / düzenle"
          onPress={() => navigation.navigate("SellerProducts")}
          T={T}
        />

        <DashboardCard
          icon="receipt-outline"
          label="Siparişler"
          hint="Gelen siparişler"
          onPress={() => navigation.navigate("SellerOrders")}
          T={T}
        />

        <DashboardCard
          icon="pricetags-outline"
          label="Kampanyalar"
          hint="İndirim & etkinlik"
          onPress={() => navigation.navigate("SellerCampaigns")}
          T={T}
        />

        <DashboardCard
          icon="bar-chart-outline"
          label="Raporlar"
          hint="Satış performansı"
          onPress={() => navigation.navigate("SellerReports")}
          T={T}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* DASHBOARD CARD COMPONENT                                           */
/* ------------------------------------------------------------------ */

function DashboardCard({
  icon,
  label,
  hint,
  onPress,
  T,
}: DashboardCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: T.cardBg,
          borderColor: T.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: T.backgroundColor,
            borderColor: T.border,
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={T.textColor} />
      </View>

      <Text style={[styles.cardTitle, { color: T.textColor }]}>
        {label}
      </Text>

      <Text style={[styles.cardHint, { color: T.mutedText }]}>
        {hint}
      </Text>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  quickActions: {
    flexDirection: "row",
    gap: 8,
  },

  quickBtn: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  metricBox: {
    width: "23%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },

  metricValue: {
    fontSize: 16,
    fontWeight: "900",
  },

  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  cardHint: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
});