// src/domains/corporate/announcements/components/EventMeta.tsx

import { Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export default function EventMeta({
  date,
  location,
  isOnline,
}: {
  date?: number;
  location?: string;
  isOnline?: boolean;
}) {
  const T = useAppTheme();
  if (!date) return null;

  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: T.mutedText, fontWeight: "700" }}>
        {new Date(date).toLocaleString("tr-TR")}
      </Text>
      <Text style={{ color: T.mutedText }}>
        {isOnline ? "Online Etkinlik" : location ?? "—"}
      </Text>
    </View>
  );
}