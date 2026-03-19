// src/domains/corporate/components/ProfileAboutBlock.tsx
// 🔒 FAZ 7 — ABOUT BLOCK (READABILITY POLISH)
//
// Amaç:
// - Metni daha rahat okunur hale getirmek
// - Kurumsal, sakin ve güven veren bir anlatım
//
// Kurallar:
// - UI-only
// - Davranış YOK (expand/collapse yok)
// - Boşsa render edilmez
// - Owner edit girişi korunur ama geri planda

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  text: string;
  isOwner: boolean;
  onEdit?: () => void;
};

export default function ProfileAboutBlock({ text, isOwner, onEdit }: Props) {
  const T = useAppTheme();

  if (!text || !text.trim()) return null;

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
          Hakkında
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
      <Text
        style={[
          styles.text,
          { color: T.textColor },
        ]}
      >
        {text}
      </Text>
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
    gap: 10,
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
    paddingVertical: 2,
  },

  editText: {
    fontSize: 11,
    fontWeight: "700",
  },

  text: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
});