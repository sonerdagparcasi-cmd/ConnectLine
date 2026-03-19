// src/domains/store/components/RatingBreakdown.tsx
// 🔒 RATING BREAKDOWN – STABLE

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { RatingSummary } from "../types/storeReview.types";

export default function RatingBreakdown({ summary }: { summary: RatingSummary }) {
  const T = useAppTheme();

  const total = summary.count > 0 ? summary.count : 1;
  const avg = Number(summary.average || 0).toFixed(1);

  return (
    <View style={[styles.box, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <Text style={[styles.head, { color: T.textColor }]}>
        ⭐ Puan: {avg} • {summary.count} değerlendirme
      </Text>

      {[5, 4, 3, 2, 1].map((k) => {
        const key = k as 1 | 2 | 3 | 4 | 5;

        const v = summary.distribution[key] || 0;

        const ratio = v / total;

        const width = Math.max(4, Math.round(ratio * 160));

        return (
          <View key={k} style={styles.row}>
            <Text style={[styles.left, { color: T.mutedText }]}>
              {k}⭐
            </Text>

            <View style={[styles.barBg, { borderColor: T.border }]}>
              <View
                style={[
                  styles.barFill,
                  { width, backgroundColor: T.accent },
                ]}
              />
            </View>

            <Text style={[styles.right, { color: T.mutedText }]}>
              {v}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },

  head: {
    fontSize: 13,
    fontWeight: "900",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  left: {
    width: 30,
    fontSize: 12,
    fontWeight: "900",
  },

  barBg: {
    borderWidth: 1,
    borderRadius: 999,
    height: 10,
    width: 170,
    overflow: "hidden",
  },

  barFill: {
    height: 10,
    borderRadius: 999,
  },

  right: {
    width: 26,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
});