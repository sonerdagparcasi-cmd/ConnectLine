// src/domains/store/components/StoreErrorState.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function StoreErrorState({
  title,
  onRetry,
}: {
  title: string;
  onRetry?: () => void;
}) {
  const T = useAppTheme();
  return (
    <View style={[styles.wrap, { borderColor: T.border, backgroundColor: T.cardBg }]}>
      <Ionicons name="warning-outline" size={22} color={T.mutedText} />
      <Text style={[styles.title, { color: T.textColor }]}>{title}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.btn, { borderColor: T.border }]} onPress={onRetry}>
          <Text style={[styles.btnText, { color: T.textColor }]}>Tekrar Dene</Text>
        </TouchableOpacity>
      )}
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
    gap: 10,
  },
  title: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderRadius: 12 },
  btnText: { fontSize: 13, fontWeight: "800" },
});