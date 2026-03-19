// src/domains/corporate/analytics/components/MetricCard.tsx

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export default function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const T = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <Text style={{ color: T.mutedText, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: T.textColor, fontSize: 22, fontWeight: "900" }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    flex: 1,
  },
});