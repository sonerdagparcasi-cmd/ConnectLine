// src/domains/corporate/recruitment/components/CandidateRow.tsx

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { RankedItem } from "../ai/ranking.types";

export default function CandidateRow({
  item,
  onPress,
  onShortlistToggle,
}: {
  item: RankedItem;
  onPress: () => void;
  onShortlistToggle: () => void;
}) {
  const T = useAppTheme();

  const isShort = item.status === "shortlist";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, { borderColor: T.border }]}
      activeOpacity={0.85}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontWeight: "900", color: T.textColor }}>
          {item.candidateName}
        </Text>
        <Text style={{ color: T.mutedText }}>
          {item.jobTitle} • %{item.aiScore}
        </Text>
        <Text style={{ color: T.mutedText, fontSize: 12 }}>
          {item.rankReason.join(" · ")}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onShortlistToggle}
        style={[
          styles.shortBtn,
          {
            borderColor: T.border,
            backgroundColor: isShort ? T.accent : "transparent",
          },
        ]}
        activeOpacity={0.85}
      >
        <Text style={{ color: isShort ? "#fff" : T.textColor, fontWeight: "800" }}>
          {isShort ? "Kısa Liste" : "Ekle"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  shortBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});