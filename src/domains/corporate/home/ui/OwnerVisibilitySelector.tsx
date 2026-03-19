// 🔒 FAZ 10A / ADIM 10A.2 — Owner Visibility Selector (UI-only)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export type VisibilityLevel = "public" | "limited" | "private";

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
};

export default function OwnerVisibilitySelector({ value, onChange }: Props) {
  const T = useAppTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Profil Görünürlüğü
      </Text>

      <Option
        title="Herkese Açık"
        active={value}
        onPress={() => onChange(true)}
        T={T}
      />

      <Option
        title="Gizli"
        active={!value}
        onPress={() => onChange(false)}
        T={T}
      />
    </View>
  );
}

function Option({
  title,
  active,
  onPress,
  T,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.option,
        {
          borderColor: active ? T.accent : T.border,
        },
      ]}
    >
      <Ionicons
        name={active ? "checkmark-circle" : "ellipse-outline"}
        size={18}
        color={active ? T.accent : T.mutedText}
      />
      <Text style={{ color: T.textColor, fontWeight: "800" }}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});