// 🔒 ProfileVisitorFeedbackHint (UI-only)
// Amaç: Ziyaretçiye bağlamsal mikro ipucu (takip / paylaş / kaydet gibi)
// Kural: Hesap yok, servis yok, state minimum

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  isOwner: boolean;
};

export default function ProfileVisitorFeedbackHint({ isOwner }: Props) {
  const T = useAppTheme();

  if (isOwner) return null;

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <Ionicons name="sparkles" size={16} color={T.accent} />
      <Text style={[styles.text, { color: T.textColor }]}>
        Bu profili takip ederek güncellemeleri kaçırma
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
});