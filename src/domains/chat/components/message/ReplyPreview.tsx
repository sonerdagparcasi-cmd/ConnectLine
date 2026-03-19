// src/domains/chat/components/message/ReplyPreview.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { t } from "../../../../shared/i18n/t";
import type { MessageReplyMeta } from "./message.types";

type Props = {
  reply: MessageReplyMeta;
  isMine: boolean;
  onPress?: () => void;
};

function ReplyPreviewInner({ reply, isMine, onPress }: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? T.textColor : C.buttonText;
  const onAccentMuted = T.isDark ? T.mutedText : "rgba(255,255,255,0.85)";
  const borderColor = isMine ? (T.isDark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.5)") : T.accent;
  const bgColor = isMine ? (T.isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)") : T.cardBg;
  const titleColor = isMine ? onAccentText : T.textColor;
  const previewColor = isMine ? onAccentMuted : T.mutedText;

  const senderLabel = reply.mine ? (reply.senderName ?? t("chat.message.you")) : (reply.senderName ?? t("chat.message.forwarded"));

  const inner = (
    <>
      <View style={styles.header}>
        <Ionicons name="arrow-undo" size={12} color={previewColor} />
        <Text style={[styles.sender, { color: titleColor }]} numberOfLines={1}>
          {senderLabel}
        </Text>
      </View>
      <Text style={[styles.preview, { color: previewColor }]} numberOfLines={2}>
        {reply.preview}
      </Text>
    </>
  );

  const wrapStyle = [styles.wrap, { borderLeftColor: borderColor, backgroundColor: bgColor }];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={wrapStyle}>
        {inner}
      </Pressable>
    );
  }
  return <View style={wrapStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  sender: {
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },
  preview: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default memo(ReplyPreviewInner);
