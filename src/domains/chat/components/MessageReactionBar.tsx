// src/domains/chat/components/MessageReactionBar.tsx
// Compact pill badge attached to bubble edge – only when reactions exist. No empty state, no + button.

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { CHAT_SPACING } from "../config/chatSpacing";

export type ReactionEmoji =
  | "👍"
  | "❤️"
  | "😂"
  | "😮"
  | "😢"
  | "👏"
  | "🔥"
  | "🎉"
  | "🤔"
  | "👎";

type ReactionEntry = {
  emoji: string;
  userId: string;
};

type Props = {
  /** Raw reactions (emoji + userId). Count is aggregated per emoji. */
  reactions?: ReactionEntry[];
  currentUserId?: string;
  onPress?: (emoji: ReactionEmoji) => void;
  /** Align pills to the right (e.g. for own messages). */
  alignRight?: boolean;
};

const EMOJIS: ReactionEmoji[] = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "👏",
  "🔥",
  "🎉",
  "🤔",
  "👎",
];
const EMOJI_SET = new Set<string>(EMOJIS);

function aggregate(
  reactions: ReactionEntry[],
  currentUserId: string
): { emoji: ReactionEmoji; count: number; byMe: boolean }[] {
  const map = new Map<ReactionEmoji, { count: number; byMe: boolean }>();
  for (const e of EMOJIS) {
    map.set(e, { count: 0, byMe: false });
  }
  for (const r of reactions) {
    if (!EMOJI_SET.has(r.emoji)) continue;
    const cur = map.get(r.emoji as ReactionEmoji)!;
    cur.count += 1;
    if (r.userId === currentUserId) cur.byMe = true;
  }
  return EMOJIS.map((emoji) => {
    const { count, byMe } = map.get(emoji)!;
    return { emoji, count, byMe };
  }).filter((x) => x.count > 0);
}

export default function MessageReactionBar({
  reactions = [],
  currentUserId = "",
  onPress,
  alignRight = false,
}: Props) {
  const T = useAppTheme();
  const aggregated = aggregate(reactions, currentUserId);

  if (aggregated.length === 0) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          alignSelf: alignRight ? "flex-end" : "flex-start",
          marginTop: CHAT_SPACING.reactionOffsetVertical,
          marginLeft: alignRight ? undefined : CHAT_SPACING.reactionOffsetHorizontal,
          marginRight: alignRight ? CHAT_SPACING.reactionOffsetHorizontal : undefined,
        },
      ]}
      pointerEvents="box-none"
    >
      {aggregated.map(({ emoji, count, byMe }) => {
        const content = (
          <View
            style={[
              styles.pill,
              {
                backgroundColor: T.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                borderColor: byMe ? T.accent : "transparent",
              },
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.count, { color: T.mutedText }]}>{count}</Text>
          </View>
        );
        return onPress ? (
          <TouchableOpacity
            key={emoji}
            onPress={() => onPress(emoji as ReactionEmoji)}
            activeOpacity={0.7}
            style={styles.pillTouch}
          >
            {content}
          </TouchableOpacity>
        ) : (
          <View key={emoji} style={styles.pillTouch}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillTouch: {
    alignSelf: "flex-start",
  },
  emoji: {
    fontSize: 13,
  },
  count: {
    fontSize: 11,
    fontWeight: "600",
  },
});
