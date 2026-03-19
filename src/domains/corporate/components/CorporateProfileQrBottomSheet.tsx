// src/domains/corporate/components/CorporateProfileQrBottomSheet.tsx
// 🔒 ADIM 18.4 — QR Bottom Sheet (UI-only, Corporate Domain)

import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import CorporateProfileQrCard from "./CorporateProfileQrCard";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Props = {
  visible: boolean;
  onClose: () => void;
  companyId: string;
  companyName?: string;
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function CorporateProfileQrBottomSheet({
  visible,
  onClose,
  companyId,
  companyName,
}: Props) {
  const T = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* ---------------- BACKDROP ---------------- */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      />

      {/* ---------------- SHEET ---------------- */}
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: T.cardBg,
            borderTopColor: T.border,
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: T.textColor }]}>
            {companyName ? `${companyName} • QR` : "QR ile Paylaş"}
          </Text>

          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={T.textColor} />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <CorporateProfileQrCard
          companyId={companyId}
          title="Kurumsal Profil"
        />
      </View>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "900",
  },
});