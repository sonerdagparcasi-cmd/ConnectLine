// src/domains/chat/components/MessageRow.tsx
/**
 * 🔒 CHAT DOMAIN – MESSAGE ROW (LOCKED)
 *
 * TRANSFER_EXPORT_V2 / FULL CONTEXT EXPORT
 *
 * KAPSAM:
 * - ADIM 6  : MessageRow extraction
 * - ADIM 9  : Reply preview
 * - ADIM 10 : Forwarded message UI
 * - ADIM 11 : Pin (UI-only)
 * - ADIM 12 : Inline emoji reaction bar
 * - ADIM 13 : Reaction counter chips
 * - ADIM 14 : Reaction detail sheet
 * - ADIM 15 : Swipe-to-reply
 * - ADIM 16 : Audio playback UI
 * - ADIM 17 : Message meta (time + status)
 *
 * KURALLAR:
 * - UI-only (backend varsayımı YOK)
 * - State SADECE local (MessageRow içinde)
 * - Navigation YOK
 * - Hook YOK
 * - Domain izolasyonu korunur
 *
 * KESİNLİKLE YASAK:
 * ❌ Global state bağlamak
 * ❌ ChatRoom logic taşımak
 * ❌ Backend / realtime varsayımı
 * ❌ Bu dosyada refactor
 *
 * YENİ ÖZELLİK:
 * ➕ SADECE yeni ADIM ile
 * ➕ Yeni component veya wrapper ile
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import type { UiMessage } from "../services/chatMessageFactory";
import InlineEmojiBar from "./InlineEmojiBar";
import MessageStatusIcon from "./MessageStatusIcon";
import ReactionDetailSheet from "./ReactionDetailSheet";

/* ------------------------------------------------------------------ */
/* CONSTANTS (🔒)                                                      */
/* ------------------------------------------------------------------ */

const SWIPE_REPLY_THRESHOLD = 56;
const SWIPE_MAX_TRANSLATE = 72;

/* ------------------------------------------------------------------ */
/* TYPES (🔒 UI-ONLY)                                                  */
/* ------------------------------------------------------------------ */

type LocalMessage = UiMessage & {
  editedAt?: number;
  pinned?: boolean;
  forwardedFrom?: string;
};

type ReactionMap = Record<string, number>;

type Props = {
  item: LocalMessage;
  isHighlighted: boolean;

  onOpenMedia: (m: LocalMessage) => void;
  onOpenActions: (m: LocalMessage) => void;
  onSwipeReply: (m: LocalMessage) => void;
  onPressReplyBanner: (id: string) => void;

  activeAudioId: string | null;
  playing: boolean;
  togglePlay: (m: LocalMessage) => void;
  toggleSpeed: (m: LocalMessage) => void;
};

/* ------------------------------------------------------------------ */
/* COMPONENT (🔒)                                                      */
/* ------------------------------------------------------------------ */

export default function MessageRow({
  item,
  isHighlighted,
  onOpenMedia,
  onOpenActions,
  onSwipeReply,
  onPressReplyBanner,
  activeAudioId,
  playing,
  togglePlay,
  toggleSpeed,
}: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onAccentText = T.isDark ? T.textColor : C.buttonText;
  const onAccentMuted = T.isDark ? T.mutedText : "rgba(255,255,255,0.85)";

  /* ---------- SWIPE → REPLY (🔒) ---------- */

  const translateX = useRef(new Animated.Value(0)).current;
  const repliedOnce = useRef(false);

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 6 && Math.abs(g.dy) < 8,
        onPanResponderMove: (_, g) => {
          if (g.dx > 0) {
            const c = Math.min(g.dx, SWIPE_MAX_TRANSLATE);
            translateX.setValue(c);
            if (c > SWIPE_REPLY_THRESHOLD && !repliedOnce.current) {
              repliedOnce.current = true;
              Haptics.impactAsync(
                Haptics.ImpactFeedbackStyle.Medium
              ).catch(() => {});
            }
          }
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > SWIPE_REPLY_THRESHOLD) onSwipeReply(item);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          repliedOnce.current = false;
        },
      }),
    [item, onSwipeReply]
  );

  /* ---------- REACTIONS (🔒 UI-ONLY) ---------- */

  const [showPicker, setShowPicker] = useState(false);
  const [reactions, setReactions] = useState<ReactionMap>({});
  const [detailOpen, setDetailOpen] = useState(false);

  function addReaction(e: string) {
    setReactions((p) => ({ ...p, [e]: (p[e] ?? 0) + 1 }));
    Haptics.selectionAsync().catch(() => {});
  }

  function removeReaction(e: string) {
    setReactions((p) => {
      const n = { ...p };
      if (!n[e]) return p;
      if (n[e] === 1) delete n[e];
      else n[e] -= 1;
      return n;
    });
    Haptics.selectionAsync().catch(() => {});
  }

  const reactionList = Object.entries(reactions);

  /* ---------- RENDER (🔒) ---------- */

  return (
    <View style={{ marginBottom: 14 }}>
      {showPicker && (
        <InlineEmojiBar
          onSelect={(e) => {
            setShowPicker(false);
            addReaction(e);
          }}
        />
      )}

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...swipeResponder.panHandlers}
      >
        <Pressable
          onPress={() => onOpenMedia(item)}
          onLongPress={() => setShowPicker(true)}
          delayLongPress={180}
          style={[
            styles.bubble,
            {
              alignSelf: item.mine ? "flex-end" : "flex-start",
              backgroundColor: item.mine ? T.accent : T.cardBg,
              borderColor: isHighlighted ? T.accent : T.border,
            },
          ]}
        >
          {item.pinned && (
            <View style={styles.pinRow}>
              <Ionicons name="pin" size={12} color={T.mutedText} />
              <Text style={styles.pinText}>Sabitlendi</Text>
            </View>
          )}

          {!!item.replyTo && (
            <Pressable
              onPress={() => onPressReplyBanner(item.replyTo!.messageId)}
              style={[
                styles.replyPreview,
                {
                  borderLeftColor: item.mine ? onAccentText : T.accent,
                },
              ]}
            >
              <Text style={[styles.replyAuthor, { color: item.mine ? onAccentText : T.textColor }]}>
                {item.replyTo.mine ? "Sen" : "Karşı taraf"}
              </Text>
              <Text style={[styles.replyText, { color: item.mine ? onAccentMuted : T.mutedText }]} numberOfLines={2}>
                {item.replyTo.preview}
              </Text>
            </Pressable>
          )}

          {!!item.forwardedFrom && (
            <Text style={styles.forwarded}>
              {t("chat.forwarded")} • {item.forwardedFrom}
            </Text>
          )}

          {!!item.text && (
            <Text
              style={{
                color: item.mine ? onAccentText : T.textColor,
                fontWeight: "700",
              }}
            >
              {item.text}
            </Text>
          )}

          {!!item.audio && (
            <View style={styles.audioRow}>
              <TouchableOpacity onPress={() => togglePlay(item)}>
                <Ionicons
                  name={
                    activeAudioId === item.id && playing ? "pause" : "play"
                  }
                  size={18}
                  color={item.mine ? onAccentText : T.textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleSpeed(item)}>
                <Text
                style={{
                  color: item.mine ? onAccentText : T.textColor,
                  fontWeight: "800",
                }}
                >
                  {item.audio.speed ?? 1}x
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.meta}>
            <Text style={[styles.time, { color: item.mine ? onAccentMuted : T.mutedText }]}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {item.mine && <MessageStatusIcon status={item.status} />}
          </View>
        </Pressable>
      </Animated.View>

      {reactionList.length > 0 && (
        <View
          style={[
            styles.reactionRow,
            { alignSelf: item.mine ? "flex-end" : "flex-start" },
          ]}
        >
          {reactionList.map(([e, c]) => (
            <TouchableOpacity
              key={e}
              onPress={() => removeReaction(e)}
              onLongPress={() => setDetailOpen(true)}
              style={[
                styles.chip,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <Text style={{ color: T.textColor }}>{e}</Text>
              <Text style={{ color: T.textColor, fontWeight: "800", fontSize: 12 }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ReactionDetailSheet
        visible={detailOpen}
        onClose={() => setDetailOpen(false)}
        reactions={reactionList.map(([e, c]) => ({
          emoji: e,
          users: Array(c).fill(item.mine ? "Sen" : "Kullanıcı"),
        }))}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES (🔒)                                                         */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "76%",
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
  },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  pinText: { fontSize: 11, fontWeight: "700", opacity: 0.7 },
  replyPreview: {
    borderLeftWidth: 3,
    paddingLeft: 6,
    marginBottom: 6,
  },
  replyAuthor: { fontSize: 11, fontWeight: "800" },
  replyText: { fontSize: 12, opacity: 0.85 },
  forwarded: {
    fontSize: 11,
    fontWeight: "700",
    opacity: 0.6,
    marginBottom: 4,
  },
  audioRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  meta: {
    flexDirection: "row",
    alignSelf: "flex-end",
    gap: 6,
    marginTop: 4,
  },
  time: { fontSize: 10, fontWeight: "700", opacity: 0.75 },
  reactionRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  chip: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
  },
});