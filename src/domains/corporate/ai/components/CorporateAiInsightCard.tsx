// src/domains/corporate/ai/components/CorporateAiInsightCard.tsx
// 🔒 ADIM 24 — AI Öneri Kartı (Owner World)
// Kurallar:
// - UI-only
// - Ayrı ekran DEĞİL
// - Zorlamaz, rehberlik eder
// - Analitik / İlanlar / Mesajlar içinde kullanılabilir

import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

export type AiInsightLevel = "info" | "success" | "warning";

type Props = {
  title: string;
  message: string;
  level?: AiInsightLevel;
};

export default function CorporateAiInsightCard({
  title,
  message,
  level = "info",
}: Props) {
  const T = useAppTheme();

  const config = {
    info: {
      icon: "sparkles",
      bg: "rgba(0,153,255,0.10)",
      color: T.accent,
    },
    success: {
      icon: "checkmark-circle",
      bg: "rgba(0,200,120,0.12)",
      color: "#00b37e",
    },
    warning: {
      icon: "alert-circle",
      bg: "rgba(255,170,0,0.14)",
      color: "#ff9900",
    },
  }[level];

  return (
    <View
      style={{
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        backgroundColor: config.bg,
        borderWidth: 1,
        borderColor: T.border,
        flexDirection: "row",
        gap: 12,
      }}
    >
      <Ionicons
        name={config.icon as any}
        size={22}
        color={config.color}
        style={{ marginTop: 2 }}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: T.textColor,
            fontWeight: "900",
            marginBottom: 4,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: T.mutedText,
            fontWeight: "700",
            lineHeight: 20,
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}