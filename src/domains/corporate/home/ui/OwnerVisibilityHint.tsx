// src/domains/corporate/home/ui/OwnerVisibilityHint.tsx
// 🔒 FAZ 10A.3 — Owner Visibility Hint (UI-only)
//
// AMAÇ:
// - Owner’a seçilen görünürlüğün ne anlama geldiğini sakin şekilde anlatmak
//
// KURALLAR:
// - UI-only
// - Enforcement YOK
// - Persistence YOK
// - useCompany YOK
// - Sadece owner render eder (parent responsibility)

import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  isOwner: boolean;
  isPublic: boolean;
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function OwnerVisibilityHint({ isOwner, isPublic }: Props) {
  const T = useAppTheme();

  if (!isOwner) return null;

  return (
    <View
      style={{
        marginTop: 16,
        marginHorizontal: 16,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.border,
        backgroundColor: T.cardBg,
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <Ionicons
        name={isPublic ? "eye-outline" : "lock-closed-outline"}
        size={18}
        color={T.mutedText}
        style={{ marginTop: 2 }}
      />

      <Text
        style={{
          flex: 1,
          color: T.mutedText,
          fontSize: 12,
          fontWeight: "700",
          lineHeight: 17,
        }}
      >
        {isPublic
          ? "Profilin şu anda herkese açık. Ziyaretçiler paylaşımlarını görebilir ve etkileşime geçebilir."
          : "Profilin gizli durumda. Ziyaretçiler paylaşımları ve etkileşimleri göremez."}
      </Text>
    </View>
  );
}