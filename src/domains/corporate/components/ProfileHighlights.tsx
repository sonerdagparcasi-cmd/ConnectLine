// src/domains/corporate/components/ProfileHighlights.tsx
// 🔒 FAZ 7 — HIGHLIGHTS (SELECTIVE EMPHASIS)
//
// Amaç:
// - Kurumun güçlü yanlarını kısa ve seçici biçimde göstermek
// - “Neden bu kurum?” sorusuna sessiz cevap vermek
//
// Kurallar:
// - UI-only
// - Maks. 4 madde gösterilir
// - Fazlası sessizce gizlenir
// - Davranış yok
// - Boş veri render edilmez

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  highlights: string[];
};

const MAX_ITEMS = 4;

export default function ProfileHighlights({ highlights }: Props) {
  const T = useAppTheme();

  if (!highlights || highlights.length === 0) return null;

  const visible = highlights.slice(0, MAX_ITEMS);

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {/* ================= HEADER ================= */}
      <Text style={[styles.title, { color: T.textColor }]}>
        Öne Çıkanlar
      </Text>

      {/* ================= LIST ================= */}
      <View style={styles.list}>
        {visible.map((item, idx) => (
          <View key={`${item}-${idx}`} style={styles.row}>
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={T.mutedText}
              style={{ marginTop: 2 }}
            />
            <Text
              style={[
                styles.text,
                { color: T.textColor },
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  list: {
    gap: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  text: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    flex: 1,
  },
});