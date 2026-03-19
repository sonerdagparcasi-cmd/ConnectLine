// src/domains/corporate/network/screens/CorporateNetworkScreen.tsx

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCorporateNetwork } from "../hooks/useCorporateNetwork";

export default function CorporateNetworkScreen() {
  const T = useAppTheme();
  const { network, loading } = useCorporateNetwork();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.accent} />
      </View>
    );
  }

  if (!network) {
    return (
      <View style={styles.center}>
        <Text style={{ color: T.mutedText }}>
          Ağ bilgisi bulunamadı
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: T.backgroundColor },
      ]}
    >
      <Text style={[styles.title, { color: T.textColor }]}>
        Kurumsal Ağ
      </Text>

      <View style={styles.grid}>
        <Stat
          label="Bağlantılar"
          value={network.connections}
          color={T.accent}
        />

        <Stat
          label="Bekleyen İstekler"
          value={network.pendingRequests}
          color={T.textColor}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* UI PARTS                                                           */
/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={{ fontSize: 22, fontWeight: "900", color }}>
        {value}
      </Text>
      <Text style={{ fontSize: 13, color: "#666" }}>
        {label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#f2f2f2",
    gap: 6,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});