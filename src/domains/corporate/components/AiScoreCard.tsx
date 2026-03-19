import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { scoreApplications } from "../ai/aiScoreEngine";
import { JobApplication } from "../recruitment/types/application.types";

type Props = {
  applications: JobApplication[];
};

export default function AiScoreCard({ applications }: Props) {
  const T = useAppTheme();

  if (!applications.length) return null;

  const ranked = scoreApplications(applications);

  const avgScore = Math.round(
    ranked.reduce((s, a) => s + a.aiScore, 0) / ranked.length
  );

  // En sık geçen 3 rankReason
  const reasonMap = new Map<string, number>();
  ranked.forEach((a) =>
    a.rankReason.forEach((r) =>
      reasonMap.set(r, (reasonMap.get(r) ?? 0) + 1)
    )
  );

  const topReasons = [...reasonMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([r]) => r);

  return (
    <View style={[styles.card, { borderColor: T.border }]}>
      <Text style={[styles.total, { color: T.accent }]}>
        %{avgScore} Ortalama AI Uyumu
      </Text>

      {topReasons.map((r) => (
        <Text key={r} style={{ color: T.textColor }}>
          • {r}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
  },
  total: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
});