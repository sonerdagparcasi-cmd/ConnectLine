// src/domains/store/components/CategoryChips.tsx
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreCategory } from "../types/store.types";

export default function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: {
  categories: StoreCategory[];
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
}) {
  const T = useAppTheme();

  const data: Array<{ id: string; name: string; _all?: true }> = [
    { id: "__all__", name: "Tümü", _all: true },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <View style={styles.wrap}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.row}
        renderItem={({ item }) => {
          const isAll = item._all === true;
          const active = isAll ? selectedId === null : selectedId === item.id;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onSelect(isAll ? null : item.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? T.cardBg : "transparent",
                  borderColor: active ? T.accent : T.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? T.textColor : T.mutedText }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 12, marginBottom: 10 },
  row: { gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: { fontSize: 12, fontWeight: "900" },
});