// src/domains/store/components/StoreListEmpty.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function StoreListEmpty({ title }: { title: string }) {
  const T = useAppTheme();
  return (
    <View style={[styles.wrap, { borderColor: T.border, backgroundColor: T.cardBg }]}>
      <Ionicons name="search" size={22} color={T.mutedText} />
      <Text style={[styles.title, { color: T.textColor }]}>{title}</Text>
      <Text style={[styles.sub, { color: T.mutedText }]}>
        Filtreleri değiştirip tekrar deneyebilirsin.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 12, textAlign: "center" },
});