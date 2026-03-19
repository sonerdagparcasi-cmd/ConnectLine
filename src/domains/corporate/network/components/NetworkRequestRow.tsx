// src/domains/corporate/network/components/NetworkRequestRow.tsx

import { Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  name: string;
  title: string;
  onAccept: () => void;
  onIgnore: () => void;
};

export default function NetworkRequestRow({
  name,
  title,
  onAccept,
  onIgnore,
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
      }}
    >
      <Text style={{ color: T.textColor, fontWeight: "900" }}>{name}</Text>
      <Text style={{ color: T.mutedText, marginTop: 2 }}>{title}</Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TouchableOpacity
          onPress={onAccept}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 18,
            backgroundColor: T.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onIgnore}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: T.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: T.textColor, fontWeight: "800" }}>Ignore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}