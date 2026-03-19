// src/domains/corporate/analytics/screens/CorporateAnalyticsScreen.tsx

import { ScrollView, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import FunnelView from "../components/FunnelView";
import MetricCard from "../components/MetricCard";
import { useCorporateAnalytics } from "../hooks/useCorporateAnalytics";

export default function CorporateAnalyticsScreen() {
  const T = useAppTheme();
  const { data } = useCorporateAnalytics("j1");

  if (!data) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.backgroundColor }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "900", color: T.textColor }}>
        İşe Alım Analizi
      </Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <MetricCard label="Toplam Başvuru" value={data.totalApplications} />
        <MetricCard label="Ortalama AI Skoru" value={`%${data.avgScore}`} />
      </View>

      <Text style={{ fontSize: 16, fontWeight: "800", color: T.textColor }}>
        Başvuru Hunisi
      </Text>

      <FunnelView data={data.funnel} />

      <Text style={{ fontSize: 16, fontWeight: "800", color: T.textColor }}>
        Süre Analizi (Saat)
      </Text>

      {data.timeMetrics.map((t) => (
        <MetricCard key={t.label} label={t.label} value={t.avgHours} />
      ))}
    </ScrollView>
  );
}