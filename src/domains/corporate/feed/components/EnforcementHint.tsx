// src/domains/corporate/feed/components/EnforcementHint.tsx
// 🔒 FAZ 12 — Enforcement Feedback UX (UI-only helper)
// Rol: Disabled aksiyonlar için sessiz açıklama metni
// Kurallar:
// - State YOK
// - Navigation YOK
// - Alert / Toast YOK
// - Sadece metin render eder
// - Inline veya overlay (absolute) kullanılabilir

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

type EnforcementHintProps = {
  /** Gösterilecek metin (LOCKED COPY üst katmanda seçilir) */
  text: string;

  /** Görünürlük kontrolü (üst katman karar verir) */
  visible?: boolean;

  /**
   * Render modu
   * - inline: akış içinde tek satır
   * - overlay: küçük baloncuk (absolute)
   */
  mode?: "inline" | "overlay";

  /** Overlay için opsiyonel konum */
  align?: "center" | "left" | "right";
};

export default function EnforcementHint({
  text,
  visible = true,
  mode = "inline",
  align = "center",
}: EnforcementHintProps) {
  const T = useAppTheme();

  if (!visible) return null;

  if (mode === "overlay") {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            backgroundColor: T.cardBg,
            borderColor: T.border,
          },
          align === "left" && { left: 8, right: "auto" },
          align === "right" && { right: 8, left: "auto" },
        ]}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: T.mutedText,
            textAlign: "center",
            lineHeight: 16,
          }}
          numberOfLines={2}
        >
          {text}
        </Text>
      </View>
    );
  }

  // inline (default)
  return (
    <Text
      style={{
        marginTop: 6,
        fontSize: 12,
        fontWeight: "700",
        color: T.mutedText,
        textAlign: "center",
        lineHeight: 16,
      }}
      numberOfLines={1}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 240,
  },
});