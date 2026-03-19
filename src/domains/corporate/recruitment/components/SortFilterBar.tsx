// src/domains/corporate/recruitment/components/SortFilterBar.tsx

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { RankingQuery, SortMode, StatusFilter } from "../ai/ranking.types";

const SORTS: Array<{ key: SortMode; label: string }> = [
  { key: SortMode.SMART, label: "Akıllı" },
  { key: SortMode.SCORE, label: "Skor" },
  { key: SortMode.DATE, label: "Tarih" },
];

const STATUSES: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni" },
  { key: "reviewing", label: "İnceleme" },
  { key: "shortlisted", label: "Kısa Liste" },
  { key: "rejected", label: "Reddedildi" },
];

export default function SortFilterBar({
  query,
  onChange,
}: {
  query: RankingQuery;
  onChange: (patch: Partial<RankingQuery>) => void;
}) {
  const T = useAppTheme();

  return (
    <View style={[styles.wrap, { borderColor: T.border }]}>
      <TextInput
        value={query.search ?? ""}
        onChangeText={(v) => onChange({ search: v })}
        placeholder="Aday / pozisyon ara"
        placeholderTextColor={T.mutedText}
        style={[
          styles.search,
          { color: T.textColor, borderColor: T.border, backgroundColor: T.cardBg },
        ]}
      />

      <View style={styles.row}>
        {SORTS.map((s) => {
          const active = query.sortMode === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => onChange({ sortMode: s.key })}
              style={[
                styles.pill,
                {
                  borderColor: T.border,
                  backgroundColor: active ? T.accent : "transparent",
                },
              ]}
            >
              <Text style={{ color: active ? "#fff" : T.textColor, fontWeight: "700" }}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.row}>
        {STATUSES.map((s) => {
          const active = query.status === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => onChange({ status: s.key })}
              style={[
                styles.pill,
                {
                  borderColor: T.border,
                  backgroundColor: active ? T.accent : "transparent",
                },
              ]}
            >
              <Text style={{ color: active ? "#fff" : T.textColor, fontWeight: "700" }}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.row}>
        <Text style={{ color: T.mutedText, fontWeight: "700" }}>Min Skor:</Text>

        {[0, 50, 70, 85].map((v) => {
          const active = query.minScore === v;
          return (
            <TouchableOpacity
              key={v}
              onPress={() => onChange({ minScore: v })}
              style={[
                styles.pillSmall,
                {
                  borderColor: T.border,
                  backgroundColor: active ? T.accent : "transparent",
                },
              ]}
            >
              <Text style={{ color: active ? "#fff" : T.textColor, fontWeight: "800" }}>
                {v}+
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    padding: 12,
    gap: 10,
  },
  search: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillSmall: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});