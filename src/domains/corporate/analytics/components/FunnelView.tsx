// src/domains/corporate/analytics/components/FunnelView.tsx

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { FunnelMetric } from "../types/analytics.types";

export default function FunnelView({ data }: { data: FunnelMetric[] }) {
  const T = useAppTheme();

  return (
    <View style={{ gap: 8 }}>
      {data.map((f) => (
        <View
          key={f.step}
          style={[
            styles.row,
            { borderColor: T.border, backgroundColor: T.cardBg },
          ]}
        >
          <Text style={{ color: T.textColor, fontWeight: "800" }}>
            {f.step.toUpperCase()}
          </Text>
          <Text style={{ color: T.mutedText }}>{f.count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});