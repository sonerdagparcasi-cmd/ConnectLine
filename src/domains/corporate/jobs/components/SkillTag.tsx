// src/domains/corporate/jobs/components/SkillTag.tsx

import { Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export default function SkillTag({ label }: { label: string }) {
  const T = useAppTheme();
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: T.cardBg,
        borderWidth: 1,
        borderColor: T.border,
      }}
    >
      <Text style={{ color: T.textColor, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
    </View>
  );
}