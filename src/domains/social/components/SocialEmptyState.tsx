import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  title: string;
  description?: string;
};

export default function SocialEmptyState({ title, description }: Props) {
  const T = useAppTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: T.textColor }]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, { color: T.mutedText }]}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  desc: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
});
