// src/domains/chat/components/message/MessageStatusBadge.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import type { MessageStatus } from "../../types/chat.types";

type Props = {
  status: MessageStatus;
  isRead?: boolean;
  onRetry?: () => void;
};

function MessageStatusBadgeInner({ status, isRead, onRetry }: Props) {
  const T = useAppTheme();

  if (status === "sending") {
    return (
      <ActivityIndicator
        size="small"
        color={T.mutedText}
        style={styles.icon}
      />
    );
  }

  if (status === "failed" && onRetry) {
    return (
      <TouchableOpacity onPress={onRetry} hitSlop={8}>
        <Ionicons name="refresh" size={14} color={T.accent} style={styles.icon} />
      </TouchableOpacity>
    );
  }

  if (status === "failed") {
    return (
      <Ionicons name="alert-circle" size={14} color="#ff4d4f" style={styles.icon} />
    );
  }

  if (status === "listening" || status === "listened") {
    return (
      <Ionicons
        name={status === "listening" ? "volume-high" : "ear"}
        size={14}
        color={T.accent}
        style={styles.icon}
      />
    );
  }

  if (status === "sent") {
    return (
      <Ionicons name="checkmark" size={14} color={T.mutedText} style={styles.icon} />
    );
  }

  const showRead = status === "seen" && isRead;
  const color = showRead ? T.accent : T.mutedText;

  return (
    <View style={styles.double}>
      <Ionicons name="checkmark" size={14} color={color} />
      <Ionicons name="checkmark" size={14} color={color} style={styles.overlap} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { marginLeft: 4 },
  double: { flexDirection: "row", marginLeft: 4 },
  overlap: { marginLeft: -6 },
});

export default memo(MessageStatusBadgeInner);
