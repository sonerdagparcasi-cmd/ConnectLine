// src/domains/chat/components/ChatMessageItem.tsx

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { MessageStatus } from "../types/chat.types";
import {
    formatDateLabel,
    formatTime,
    getMessagePreview,
    startOfDay,
} from "../utils/chatMessageUtils";
import MessageStatusIcon from "./MessageStatusIcon";

/* ------------------------------------------------------------------ */
/* TYPES (🔒 KİLİTLİ)                                                   */
/* ------------------------------------------------------------------ */

export type MediaKind = "image" | "video" | "file" | "contact" | "location";

export type ReplyMeta = {
  messageId: string;
  preview: string;
  mine: boolean;
};

export type ForwardMeta = {
  fromLabel: string;
};

export type UiMessage = {
  id: string;
  mine: boolean;
  status: MessageStatus;
  createdAt: number;
  text?: string;
  storyReply?: {
    storyId: string;
    storyOwnerId: string;
    storyMediaUri?: string | null;
  };
  audio?: {
    uri: string;
    speed?: 1 | 1.5 | 2;
  };
  media?: {
    kind: MediaKind;
    uri?: string;
    fileName?: string;
  };
  replyTo?: ReplyMeta;
  forwarded?: ForwardMeta;
};

/* ------------------------------------------------------------------ */
/* PROPS                                                               */
/* ------------------------------------------------------------------ */

type Props = {
  item: UiMessage;
  prev?: UiMessage;
  isPlaying: boolean;
  activeAudioId: string | null;

  onLongPress: (m: UiMessage) => void;
  onTogglePlay: (m: UiMessage) => void;
  onToggleSpeed: (m: UiMessage) => void;
  onOpenMedia: (m: UiMessage) => void;
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function ChatMessageItem({
  item,
  prev,
  isPlaying,
  activeAudioId,
  onLongPress,
  onTogglePlay,
  onToggleSpeed,
  onOpenMedia,
}: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? T.textColor : C.buttonText;
  const onAccentMuted = T.isDark ? T.mutedText : "rgba(255,255,255,0.85)";

  const showDate =
    !prev || startOfDay(prev.createdAt) !== startOfDay(item.createdAt);

  const bubbleTextColor = item.mine ? onAccentText : T.textColor;
  const bubbleSubColor = item.mine ? onAccentMuted : T.mutedText;

  return (
    <>
      {showDate && (
        <View style={[styles.dateSeparator, { backgroundColor: T.cardBg }]}>
          <Text style={[styles.dateText, { color: T.textColor }]}>
            {formatDateLabel(item.createdAt)}
          </Text>
        </View>
      )}

      <Pressable
        onLongPress={() => onLongPress(item)}
        delayLongPress={250}
        style={[
          styles.bubble,
          {
            alignSelf: item.mine ? "flex-end" : "flex-start",
            backgroundColor: item.mine ? T.accent : T.cardBg,
            borderColor: T.border,
          },
        ]}
      >
        {/* FORWARDED */}
        {!!item.forwarded && (
          <View style={styles.forwardRow}>
            <Ionicons
              name="arrow-redo-outline"
              size={14}
              color={bubbleSubColor}
            />
            <Text style={[styles.forwardText, { color: bubbleSubColor }]}>
              {item.forwarded.fromLabel}
            </Text>
          </View>
        )}

        {/* REPLY */}
        {!!item.replyTo && (
          <View
            style={[
              styles.quoteBox,
              {
                borderLeftColor: item.mine
                  ? (T.isDark ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.6)")
                  : T.accent,
                backgroundColor: item.mine
                  ? (T.isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.15)")
                  : T.cardBg,
              },
            ]}
          >
            <Text
              style={[
                styles.quoteTitle,
                {
                  color: item.mine ? onAccentText : T.textColor,
                },
              ]}
              numberOfLines={1}
            >
              {item.replyTo.mine ? "Sen" : "Karşı taraf"}
            </Text>
            <Text
              style={[
                styles.quoteText,
                {
                  color: item.mine ? bubbleSubColor : T.mutedText,
                },
              ]}
              numberOfLines={2}
            >
              {item.replyTo.preview}
            </Text>
          </View>
        )}

        {/* STORY REPLY */}
        {!!item.storyReply && (
          <View style={styles.storyReplyBubble}>
            <Text style={[styles.storyReplyLabel, { color: bubbleSubColor }]}>
              Story’ye yanıt
            </Text>
            {!!item.text && (
              <Text style={[styles.storyReplyText, { color: bubbleTextColor }]}>
                {item.text}
              </Text>
            )}
          </View>
        )}

        {/* TEXT */}
        {!!item.text && !item.storyReply && (
          <Text style={{ color: bubbleTextColor }}>{item.text}</Text>
        )}

        {/* AUDIO */}
        {!!item.audio && (
          <View style={styles.audioRow}>
            <TouchableOpacity
              onPress={() => onTogglePlay(item)}
              style={styles.audioBtn}
            >
              <Ionicons
                name={
                  activeAudioId === item.id && isPlaying ? "pause" : "play"
                }
                size={18}
                color={bubbleTextColor}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onToggleSpeed(item)}
              style={[
                styles.speedPill,
                {
                  borderColor: item.mine
                    ? (T.isDark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.4)")
                    : T.border,
                },
              ]}
            >
              <Text
                style={{
                  color: bubbleTextColor,
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {item.audio.speed ?? 1}x
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                color: bubbleSubColor,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              Sesli mesaj
            </Text>
          </View>
        )}

        {/* MEDIA */}
        {!!item.media && (
          <TouchableOpacity
            onPress={() => onOpenMedia(item)}
            style={[
              styles.mediaPill,
              {
                borderColor: item.mine
                  ? (T.isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.35)")
                  : T.border,
                backgroundColor: item.mine
                  ? (T.isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.15)")
                  : T.cardBg,
              },
            ]}
          >
            <Ionicons
              name={
                item.media.kind === "image"
                  ? "image-outline"
                  : item.media.kind === "video"
                  ? "videocam-outline"
                  : item.media.kind === "file"
                  ? "attach-outline"
                  : item.media.kind === "contact"
                  ? "person-outline"
                  : "location-outline"
              }
              size={16}
              color={bubbleTextColor}
            />
            <Text
              style={{ color: bubbleTextColor, fontWeight: "800" }}
              numberOfLines={1}
            >
              {getMessagePreview(item)}
            </Text>
          </TouchableOpacity>
        )}

        {/* META */}
        <View style={styles.meta}>
          <Text style={[styles.time, { color: bubbleSubColor }]}>
            {formatTime(item.createdAt)}
          </Text>
          {item.mine && <MessageStatusIcon status={item.status} />}
        </View>
      </Pressable>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  dateSeparator: {
    alignSelf: "center",
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
  },

  bubble: {
    maxWidth: "76%",
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    marginBottom: 6,
  },

  forwardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  forwardText: {
    fontSize: 12,
    fontWeight: "800",
  },

  quoteBox: {
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  quoteTitle: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 12,
    fontWeight: "700",
  },

  storyReplyBubble: {
    marginBottom: 4,
  },
  storyReplyLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    opacity: 0.9,
    marginBottom: 2,
  },
  storyReplyText: {
    fontSize: 13,
    fontWeight: "600",
  },

  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  audioBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  speedPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  mediaPill: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  meta: {
    flexDirection: "row",
    gap: 6,
    alignSelf: "flex-end",
    marginTop: 6,
    alignItems: "center",
  },
  time: {
    fontSize: 10,
    opacity: 0.9,
  },
});