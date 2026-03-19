// src/domains/chat/components/ChatMessageBubble.tsx

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { MessageStatus } from "../types/chat.types";
import MessageStatusIcon from "./MessageStatusIcon";

/* ------------------------------------------------------------------ */
/* TYPES (🔒 UI-ONLY)                                                   */
/* ------------------------------------------------------------------ */

export type MediaKind =
  | "image"
  | "video"
  | "file"
  | "contact"
  | "location";

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
  audio?: { uri: string; speed?: 1 | 1.5 | 2 };
  media?: { kind: MediaKind; uri?: string; fileName?: string };
  replyTo?: ReplyMeta;
  forwarded?: ForwardMeta;
};

type Props = {
  item: UiMessage;
  isMine: boolean;
  accent: string;
  cardBg: string;
  border: string;
  textColor: string;
  mutedText: string;

  formatTime: (ts: number) => string;
  getPreview: (m: UiMessage) => string;

  onLongPress: () => void;
  onPressMedia?: () => void;
  onTogglePlay?: () => void;
  onToggleSpeed?: () => void;

  isPlaying?: boolean;
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function ChatMessageBubble({
  item,
  isMine,
  accent,
  cardBg,
  border,
  textColor,
  mutedText,
  formatTime,
  getPreview,
  onLongPress,
  onPressMedia,
  onTogglePlay,
  onToggleSpeed,
  isPlaying,
}: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? textColor : C.buttonText;
  const onAccentMuted = T.isDark ? mutedText : "rgba(255,255,255,0.85)";
  const bubbleText = isMine ? onAccentText : textColor;
  const bubbleSub = isMine ? onAccentMuted : mutedText;

  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={250}
      style={[
        styles.bubble,
        {
          alignSelf: isMine ? "flex-end" : "flex-start",
          backgroundColor: isMine ? accent : cardBg,
          borderColor: border,
        },
      ]}
    >
      {/* FORWARDED */}
      {!!item.forwarded && (
        <View style={styles.forwardRow}>
          <Ionicons
            name="arrow-redo-outline"
            size={14}
            color={bubbleSub}
          />
          <Text style={[styles.forwardText, { color: bubbleSub }]}>
            {item.forwarded.fromLabel}
          </Text>
        </View>
      )}

      {/* REPLY */}
      {!!item.replyTo && (
        <View
          style={[
            styles.replyBox,
            {
              borderLeftColor: isMine
                ? (T.isDark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.5)")
                : accent,
              backgroundColor: isMine
                ? (T.isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)")
                : cardBg,
            },
          ]}
        >
          <Text
            style={[
              styles.replyTitle,
              { color: bubbleText },
            ]}
            numberOfLines={1}
          >
            {item.replyTo.mine ? "Sen" : "Karşı taraf"}
          </Text>
          <Text
            style={[styles.replyText, { color: bubbleSub }]}
            numberOfLines={2}
          >
            {item.replyTo.preview}
          </Text>
        </View>
      )}

      {/* TEXT */}
      {!!item.text && (
        <Text style={{ color: bubbleText }}>{item.text}</Text>
      )}

      {/* AUDIO */}
      {!!item.audio && (
        <View style={styles.audioRow}>
          <TouchableOpacity onPress={onTogglePlay}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color={bubbleText}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleSpeed}>
            <Text style={{ color: bubbleText, fontWeight: "800" }}>
              {(item.audio.speed ?? 1) + "x"}
            </Text>
          </TouchableOpacity>

          <Text style={{ color: bubbleSub, fontSize: 12 }}>
            Sesli mesaj
          </Text>
        </View>
      )}

      {/* MEDIA */}
      {!!item.media && (
        <TouchableOpacity
          onPress={onPressMedia}
          style={[
            styles.mediaRow,
            {
              borderColor: isMine
                ? (T.isDark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.4)")
                : border,
            },
          ]}
        >
          <Ionicons
            name="attach-outline"
            size={16}
            color={bubbleText}
          />
          <Text
            style={{ color: bubbleText, fontWeight: "700" }}
            numberOfLines={1}
          >
            {getPreview(item)}
          </Text>
        </TouchableOpacity>
      )}

      {/* META */}
      <View style={styles.meta}>
        <Text style={[styles.time, { color: bubbleSub }]}>
          {formatTime(item.createdAt)}
        </Text>
        {isMine && <MessageStatusIcon status={item.status} />}
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "76%",
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    marginBottom: 6,
  },

  forwardRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  forwardText: {
    fontSize: 12,
    fontWeight: "800",
  },

  replyBox: {
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
  },
  replyTitle: {
    fontSize: 12,
    fontWeight: "900",
  },
  replyText: {
    fontSize: 12,
    fontWeight: "700",
  },

  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  mediaRow: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  meta: {
    flexDirection: "row",
    gap: 6,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  time: {
    fontSize: 10,
    fontWeight: "700",
  },
});