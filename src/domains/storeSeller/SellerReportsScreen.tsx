// src/domains/storeSeller/SellerReportsScreen.tsx
// 🔒 SATİCI YÖNETİMİ – RAPORLAR (UI ONLY)

import { FlatList, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES (UI-ONLY)                                                     */
/* ------------------------------------------------------------------ */

type ReportMetric = {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
};

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI-ONLY)                                                 */
/* ------------------------------------------------------------------ */

const MOCK_METRICS: ReportMetric[] = [
  {
    id: "m1",
    title: "Toplam Satış",
    value: "₺124.500",
    subtitle: "Son 30 gün",
  },
  {
    id: "m2",
    title: "Toplam Sipariş",
    value: "342",
    subtitle: "Son 30 gün",
  },
  {
    id: "m3",
    title: "En Çok Satan Ürün",
    value: "Ürün A",
    subtitle: "78 adet",
  },
  {
    id: "m4",
    title: "Kampanya Etkisi",
    value: "+%22",
    subtitle: "Satış artışı",
  },
];

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SellerReportsScreen() {
  const T = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Raporlar
      </Text>

      <Text style={[styles.subtitle, { color: T.mutedText }]}>
        Satış ve performans özetleri
      </Text>

      <FlatList
        data={MOCK_METRICS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Text style={[styles.metricTitle, { color: T.mutedText }]}>
              {item.title}
            </Text>

            <Text style={[styles.metricValue, { color: T.textColor }]}>
              {item.value}
            </Text>

            {item.subtitle ? (
              <Text style={[styles.metricSubtitle, { color: T.mutedText }]}>
                {item.subtitle}
              </Text>
            ) : null}
          </View>
        )}
      />

      <View style={[styles.placeholder, { borderColor: T.border }]}>
        <Text style={[styles.placeholderText, { color: T.mutedText }]}>
          Grafikler ve detaylı raporlar{"\n"}
          ilerleyen adımlarda eklenecek
        </Text>
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
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  metricTitle: {
    fontSize: 13,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: {
    marginTop: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});