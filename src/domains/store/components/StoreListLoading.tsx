// src/domains/store/components/StoreListLoading.tsx
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function StoreListLoading({ title }: { title?: string }) {
  const T = useAppTheme();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator />
      <Text style={[styles.text, { color: T.mutedText }]}>{title ?? "Yükleniyor..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, alignItems: "center", justifyContent: "center", gap: 10 },
  text: { fontSize: 12, fontWeight: "600" },
});