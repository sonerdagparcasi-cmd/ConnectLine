import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import ReportDateFilter from "../components/ReportDateFilter";
import ReportMetricCard from "../components/ReportMetricCard";
import { storeReportService } from "../services/storeReportService";
import type { DateRange } from "../types/storeReport.types";

export default function StoreReportsScreen() {
  const T = useAppTheme();

  const range: DateRange = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const [sales, setSales] = useState<any>(null);
  const [returns, setReturns] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [s, r] = await Promise.all([
      storeReportService.getSalesSummary(range),
      storeReportService.getReturnStats(range),
    ]);
    setSales(s);
    setReturns(r);
  }

  return (
    <ScrollView
      style={{ backgroundColor: T.backgroundColor }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.textColor }]}>
          Raporlar
        </Text>

        <ReportDateFilter
          label="Son 30 Gün"
          onPress={() => {}}
        />
      </View>

      {sales && (
        <View style={styles.grid}>
          <ReportMetricCard
            title="Toplam Ciro"
            value={`${sales.totalRevenue}`}
          />
          <ReportMetricCard
            title="Sipariş"
            value={`${sales.orderCount}`}
          />
          <ReportMetricCard
            title="Sepet Ort."
            value={`${sales.averageOrderValue}`}
          />
        </View>
      )}

      {returns && (
        <View style={styles.grid}>
          <ReportMetricCard
            title="İadeler"
            value={`${returns.returnedOrders}`}
          />
          <ReportMetricCard
            title="İptaller"
            value={`${returns.cancelledOrders}`}
          />
        </View>
      )}

      <View style={[styles.notice, { borderColor: T.border }]}>
        <Text
          style={{
            color: T.mutedText,
            fontWeight: "800",
            fontSize: 12,
          }}
        >
          CSV dışa aktarma ve detaylı kırılımlar sonraki adımda açılabilir.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "900" },
  grid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  notice: { borderWidth: 1, borderRadius: 14, padding: 12 },
});