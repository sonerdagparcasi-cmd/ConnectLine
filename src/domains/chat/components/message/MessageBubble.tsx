// src/domains/chat/components/message/MessageBubble.tsx
// ADIM 8 – Long press → actions; reactions bar; messageDeleted display

import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { t } from "../../../../shared/i18n/t";
import { CHAT_SPACING } from "../../config/chatSpacing";
import type { MessageBaseProps, MessageReplyMeta } from "./message.types";
import { formatMessageTime } from "./message.types";
import MessageStatusBadge from "./MessageStatusBadge";
import ReplyPreview from "./ReplyPreview";
import MessageReactionBar, { type ReactionEmoji } from "../MessageReactionBar";

export type ReactionEntry = { emoji: string; userId: string };

export type MessageBubbleProps = MessageBaseProps & {
  onLongPress?: () => void;
  onPressReply?: (reply: MessageReplyMeta) => void;
  onRetry?: () => void;
  isRead?: boolean;
  children?: React.ReactNode;
  /** When true, show "Mesaj silindi" instead of content (Herkesten Sil). */
  messageDeleted?: boolean;
  /** Raw reactions for the bar (emoji + userId). Only shown when present. */
  reactionEntries?: ReactionEntry[];
  currentUserId?: string;
  onReactionPress?: (emoji: ReactionEmoji) => void;
  /** When true, subtle highlight (e.g. message selected for actions). */
  isSelected?: boolean;
  /** Bottom margin (8pt grid: same sender 4, user switch 12, default 8). */
  rowMarginBottom?: number;
};

function MessageBubbleInner({
  isMine,
  status,
  createdAt,
  editedAt,
  forwarded,
  replyTo,
  senderName,
  senderAvatarUri,
  onLongPress,
  onPressReply,
  onRetry,
  isRead,
  children,
  messageDeleted,
  reactionEntries,
  currentUserId,
  onReactionPress,
  isSelected = false,
  rowMarginBottom = CHAT_SPACING.messageGap,
}: MessageBubbleProps) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? T.textColor : C.buttonText;
  const onAccentMuted = T.isDark ? T.mutedText : "rgba(255,255,255,0.85)";

  const bubbleBg = isMine ? T.accent : T.cardBg;
  const bubbleBorder = T.border;
  const subColor = isMine ? onAccentMuted : T.mutedText;

  const replyWithSender: MessageReplyMeta | undefined = replyTo
    ? { ...replyTo, senderName: replyTo.senderName ?? (replyTo.mine ? "You" : senderName) }
    : undefined;

  const hasReactions = reactionEntries && reactionEntries.length > 0;
  const showReactions = hasReactions;

  return (
    <View
      style={[
        styles.row,
        { flexDirection: isMine ? "row-reverse" : "row", marginBottom: rowMarginBottom },
      ]}
    >
      {!isMine && (
        <View style={styles.avatarWrap}>
          {senderAvatarUri ? (
            <Image
              source={{ uri: senderAvatarUri }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: T.border }]}>
              <Ionicons name="person" size={16} color={T.mutedText} />
            </View>
          )}
        </View>
      )}

      <View style={[styles.bubbleColumn, { alignItems: isMine ? "flex-end" : "flex-start" }]}>
        <Pressable
          onLongPress={onLongPress}
          delayLongPress={250}
          style={[
            styles.bubble,
            {
              alignSelf: isMine ? "flex-end" : "flex-start",
              backgroundColor: bubbleBg,
              borderColor: isSelected ? (isMine ? "rgba(255,255,255,0.4)" : T.accent) : bubbleBorder,
              opacity: isSelected ? 0.96 : 1,
            },
          ]}
        >
          {!!forwarded && (
            <View style={styles.forwardRow}>
              <Ionicons name="arrow-redo-outline" size={14} color={subColor} />
              <Text style={[styles.forwardText, { color: subColor }]}>
                {forwarded.fromLabel}
              </Text>
            </View>
          )}

          {replyWithSender && (
            <ReplyPreview
              reply={replyWithSender}
              isMine={isMine}
              onPress={onPressReply ? () => onPressReply(replyWithSender) : undefined}
            />
          )}

          {messageDeleted ? (
            <Text style={[styles.deletedText, { color: subColor }]}>
              {t("chat.messageDeleted")}
            </Text>
          ) : (
            children
          )}

          <View style={styles.meta}>
            {!!editedAt && !messageDeleted && (
              <Text style={[styles.edited, { color: subColor }]}>
                {t("chat.message.edited")}
              </Text>
            )}
            <Text style={[styles.time, { color: subColor }]}>
              {formatMessageTime(createdAt)}
            </Text>
            {isMine && !messageDeleted && (
              <MessageStatusBadge
                status={status}
                isRead={isRead}
                onRetry={onRetry}
              />
            )}
          </View>
        </Pressable>

        {showReactions && (
          <MessageReactionBar
            reactions={reactionEntries}
            currentUserId={currentUserId}
            onPress={onReactionPress}
            alignRight={isMine}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-end",
    gap: CHAT_SPACING.avatarToBubble,
  },
  avatarWrap: {
    width: 28,
    height: 28,
    borderRadius: 12,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleColumn: {
    maxWidth: `${CHAT_SPACING.bubbleMaxWidthPercent * 100}%`,
  },
  bubble: {
    maxWidth: "100%",
    borderRadius: 14,
    paddingVertical: CHAT_SPACING.bubblePaddingVertical,
    paddingHorizontal: CHAT_SPACING.bubblePaddingHorizontal,
    borderWidth: 1,
  },
  deletedText: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
  },
  forwardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  forwardText: {
    fontSize: 12,
    fontWeight: "700",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  edited: {
    fontSize: 10,
    fontWeight: "600",
    fontStyle: "italic",
  },
  time: {
    fontSize: 11,
    fontWeight: "700",
  },
});

export default memo(MessageBubbleInner);
