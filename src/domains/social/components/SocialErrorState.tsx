import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  message: string;
  onRetry?: () => void;
};

export default function SocialErrorState({ message, onRetry }: Props) {
  const T = useAppTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.message, { color: T.error }]}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry}>
          <Text style={[styles.retry, { color: T.accent }]}>{t("retry")}</Text>
        </TouchableOpacity>
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
  message: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  retry: {
    marginTop: 12,
    fontWeight: "600",
  },
});
