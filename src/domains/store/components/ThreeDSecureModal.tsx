// src/domains/store/components/ThreeDSecureModal.tsx
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

/**
 * 🔒 D (35–46) 3D Secure (mock)
 * - UI-only modal
 * - confirm -> caller akışı tamamlar (order create / success)
 * - dismiss (geri tuşu / outside) için onRequestClose ekli (stabil)
 */

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function ThreeDSecureModal({ visible, onConfirm, onCancel }: Props) {
  const T = useAppTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => onCancel?.()}
    >
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <Text style={[styles.title, { color: T.textColor }]}>3D Secure Doğrulama</Text>

          <Text style={[styles.desc, { color: T.mutedText }]}>
            Banka doğrulaması (mock)
          </Text>

          <View style={styles.actions}>
            {!!onCancel && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onCancel}
                style={[styles.secondaryBtn, { borderColor: T.border }]}
              >
                <Text style={[styles.secondaryText, { color: T.textColor }]}>Vazgeç</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onConfirm}
              style={[styles.primaryBtn, { backgroundColor: T.accent }]}
            >
              <Text style={styles.primaryText}>Onayla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  box: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 1,
  },
  title: { fontSize: 16, fontWeight: "900" },
  desc: { fontSize: 13, fontWeight: "700" },

  actions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },

  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryText: { fontWeight: "900" },

  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },
});