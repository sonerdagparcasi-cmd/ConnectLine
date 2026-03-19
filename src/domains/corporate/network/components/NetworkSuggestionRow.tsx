// src/domains/corporate/network/components/NetworkSuggestionRow.tsx

import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  name: string;
  title: string;
  onConnect: () => void;
};

export default function NetworkSuggestionRow({
  name,
  title,
  onConnect,
}: Props) {
  const T = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: T.cardBg,
        borderColor: T.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text style={{ color: T.textColor, fontWeight: "900" }}>{name}</Text>
        <Text style={{ color: T.mutedText, marginTop: 2 }}>{title}</Text>
      </View>

      <TouchableOpacity
        onPress={onConnect}
        style={{
          paddingHorizontal: 14,
          height: 34,
          borderRadius: 17,
          backgroundColor: T.accent,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>Connect</Text>
      </TouchableOpacity>
    </View>
  );
}