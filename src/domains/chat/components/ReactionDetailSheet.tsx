// src/domains/chat/components/ReactionDetailSheet.tsx
// ADIM 8 – Reaction detail: emoji → list of users

import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export type ReactionDetail = {
  emoji: string;
  users: string[];
};

type Props = {
  visible: boolean;
  reactions: ReactionDetail[];
  onClose: () => void;
};

export default function ReactionDetailSheet({
  visible,
  reactions,
  onClose,
}: Props) {
  const T = useAppTheme();
  const overlayBg = T.isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.25)";
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: overlayBg }]}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        {reactions.map((r) => (
          <View key={r.emoji} style={styles.row}>
            <Text style={styles.emoji}>{r.emoji}</Text>
            <Text style={[styles.users, { color: T.textColor }]}>
              {r.users.join(", ")}
            </Text>
          </View>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  emoji: {
    fontSize: 18,
  },
  users: {
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },
});
