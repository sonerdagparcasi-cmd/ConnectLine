import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export default function StoreSkeleton({ h = 14 }: { h?: number }) {
  const T = useAppTheme();
  return (
    <View style={[styles.box, { backgroundColor: T.border, height: h }]} />
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 10, opacity: 0.5 },
});