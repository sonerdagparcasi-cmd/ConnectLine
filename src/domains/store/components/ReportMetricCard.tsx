import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function ReportMetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  const T = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <Text style={[styles.title, { color: T.mutedText }]}>{title}</Text>
      <Text style={[styles.value, { color: T.textColor }]}>{value}</Text>
      {!!subtitle && <Text style={{ color: T.mutedText }}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 6 },
  title: { fontSize: 12, fontWeight: "900" },
  value: { fontSize: 18, fontWeight: "900" },
});