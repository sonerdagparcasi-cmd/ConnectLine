// src/domains/store/components/SortPills.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreSortMode } from "../services/storeCatalogService";

const OPTIONS: Array<{ id: StoreSortMode; label: string }> = [
  { id: "popular", label: "Popüler" },
  { id: "new", label: "Yeni" },
  { id: "price_asc", label: "Fiyat ↑" },
  { id: "price_desc", label: "Fiyat ↓" },
];

export default function SortPills({
  value,
  onChange,
}: {
  value: StoreSortMode;
  onChange: (v: StoreSortMode) => void;
}) {
  const T = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.9}
              onPress={() => onChange(opt.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? T.cardBg : "transparent",
                  borderColor: active ? T.accent : T.border,
                },
              ]}
            >
              <Text style={[styles.text, { color: active ? T.textColor : T.mutedText }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12, marginBottom: 10 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  text: { fontSize: 12, fontWeight: "900" },
});