// src/domains/corporate/components/CorporateVisitorEngagementBar.tsx
// 🔒 ADIM 8 – Visitor Engagement (UI ONLY)

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  companyName: string;
};

export default function CorporateVisitorEngagementBar({ companyName }: Props) {
  const T = useAppTheme();

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  function onMessage() {
    // Navigation’a zorla bağlamıyoruz (mimariyi bozmuyoruz).
    Alert.alert(
      "Mesaj",
      `${companyName} ile iletişim yakında bu alandan açılacak.`
    );
  }

  return (
    <View style={[styles.wrap, { borderColor: T.border }]}>
      <View style={styles.row}>
        <Pill
          active={liked}
          icon={liked ? "heart" : "heart-outline"}
          label={liked ? "İlgilendim" : "İlgileniyorum"}
          onPress={() => setLiked((v) => !v)}
        />
        <Pill
          active={saved}
          icon={saved ? "bookmark" : "bookmark-outline"}
          label={saved ? "Kaydedildi" : "Kaydet"}
          onPress={() => setSaved((v) => !v)}
        />
        <Pill
          active={false}
          icon="chatbubble-ellipses-outline"
          label="Mesaj"
          onPress={onMessage}
        />
      </View>

      <Text style={[styles.hint, { color: T.mutedText }]}>
        Küçük bir dokunuş: Beğenip kaydettiğinde, sana daha uygun şirketler
        önerebiliriz.
      </Text>
    </View>
  );
}

function Pill({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const T = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? T.cardBg : "transparent",
          borderColor: T.border,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={T.textColor} />
      <Text style={[styles.pillText, { color: T.textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    width: "100%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    opacity: 0.95,
  },
});