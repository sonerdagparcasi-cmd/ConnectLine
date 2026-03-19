// src/domains/corporate/jobs/components/JobCard.tsx

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { CorporateJob } from "../types/job.types";
import SkillTag from "./SkillTag";

export default function JobCard({
  job,
  onPress,
}: {
  job: CorporateJob;
  onPress: () => void;
}) {
  const T = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { borderColor: T.border, backgroundColor: T.cardBg }]}
    >
      <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 16 }}>
        {job.title}
      </Text>

      <Text style={{ color: T.mutedText, marginTop: 4 }}>
        {job.companyName} · {job.location}
      </Text>

      <View style={styles.skills}>
        {job.skills.map((s) => (
          <SkillTag key={s} label={s} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 14,
    marginVertical: 8,
    gap: 6,
  },
  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
});