// src/domains/store/components/StoreSearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function StoreSearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const T = useAppTheme();
  return (
    <View style={[styles.wrap, { borderColor: T.border, backgroundColor: T.cardBg }]}>
      <Ionicons name="search" size={16} color={T.mutedText} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={T.mutedText}
        style={[styles.input, { color: T.textColor }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { flex: 1, fontSize: 13, fontWeight: "800" },
});