// src/domains/chat/components/message/ReactionBar.tsx
// Long-press message → show this bar to pick emoji reaction

import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

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

type Props = {
  onSelect: (emoji: ReactionEmoji) => void;
  onClose?: () => void;
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

function ReactionBarInner({ onSelect, onClose }: Props) {
  const T = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => onSelect(emoji)}
          activeOpacity={0.8}
          style={styles.emojiBtn}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  emojiBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 22,
  },
});

export default memo(ReactionBarInner);
