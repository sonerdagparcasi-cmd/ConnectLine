import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function ReportDateFilter({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const T = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.box, { borderColor: T.border }]}
    >
      <Text style={{ color: T.textColor, fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
});