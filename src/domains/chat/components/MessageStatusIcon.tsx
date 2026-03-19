import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { useChatSettings } from "../hooks/useChatSettings";
import { MessageStatus } from "../types/chat.types";

type Props = {
  status: MessageStatus;
  isRead?: boolean;          // ✅ ADIM 4.3
  onRetry?: () => void;      // 🔄 retry (UI-only)
};

export default function MessageStatusIcon({
  status,
  isRead = false,
  onRetry,
}: Props) {
  const T = useAppTheme();
  const { settings } = useChatSettings();

  /* -------------------------------------------------- */
  /* FAILED / RETRY                                     */
  /* -------------------------------------------------- */
  if (status === "failed") {
    return (
      <TouchableOpacity onPress={onRetry}>
        <Ionicons
          name="refresh"
          size={14}
          color={T.accent}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  }

  /* -------------------------------------------------- */
  /* AUDIO STATES                                       */
  /* -------------------------------------------------- */
  if (status === "listening") {
    return (
      <Ionicons
        name="volume-high"
        size={14}
        color={T.accent}
        style={styles.icon}
      />
    );
  }

  if (status === "listened") {
    return (
      <Ionicons
        name="ear"
        size={14}
        color={T.accent}
        style={styles.icon}
      />
    );
  }

  /* -------------------------------------------------- */
  /* SENT                                               */
  /* -------------------------------------------------- */
  if (status === "sent") {
    return (
      <Ionicons
        name="checkmark"
        size={14}
        color={T.mutedText}
        style={styles.icon}
      />
    );
  }

  /* -------------------------------------------------- */
  /* DELIVERED / READ (HOOK-DRIVEN)                     */
  /* -------------------------------------------------- */

  const showRead =
    settings.showReadReceipts && isRead;

  const color = showRead ? T.accent : T.mutedText;

  return (
    <View style={styles.double}>
      <Ionicons name="checkmark" size={14} color={color} />
      <Ionicons
        name="checkmark"
        size={14}
        color={color}
        style={styles.overlap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginLeft: 6,
  },
  double: {
    flexDirection: "row",
    marginLeft: 6,
  },
  overlap: {
    marginLeft: -6,
  },
});