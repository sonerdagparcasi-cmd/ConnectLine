// src/domains/corporate/components/ProfileFocusAreas.tsx
// 🔒 FAZ 7 — FOCUS AREAS (CONCEPTUAL POLISH)
//
// Amaç:
// - Kurumun hangi alanlara odaklandığını net göstermek
// - Pazarlama değil, profesyonel tanım hissi vermek
//
// Kurallar:
// - UI-only
// - Davranış YOK
// - Maks. 6 alan gösterilir
// - Fazlası sessizce gizlenir
// - Owner edit girişi korunur (geri planda)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  areas: string[];
  isOwner: boolean;
  onEdit?: () => void;
};

const MAX_ITEMS = 6;

export default function ProfileFocusAreas({ areas, isOwner, onEdit }: Props) {
  const T = useAppTheme();

  if (!areas || areas.length === 0) return null;

  const visibleAreas = areas.slice(0, MAX_ITEMS);

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.textColor }]}>
          Odak Alanları
        </Text>

        {isOwner && onEdit ? (
          <TouchableOpacity
            onPress={onEdit}
            activeOpacity={0.8}
            style={styles.editBtn}
          >
            <Ionicons name="pencil" size={13} color={T.mutedText} />
            <Text style={[styles.editText, { color: T.mutedText }]}>
              Düzenle
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ================= CONTENT ================= */}
      <View style={styles.items}>
        {visibleAreas.map((area, idx) => (
          <View
            key={`${area}-${idx}`}
            style={[
              styles.item,
              { backgroundColor: T.backgroundColor, borderColor: T.border },
            ]}
          >
            <Text
              style={[
                styles.itemText,
                { color: T.textColor },
              ]}
            >
              {area}
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  editText: {
    fontSize: 11,
    fontWeight: "700",
  },

  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  item: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },

  itemText: {
    fontSize: 12,
    fontWeight: "700",
  },
});