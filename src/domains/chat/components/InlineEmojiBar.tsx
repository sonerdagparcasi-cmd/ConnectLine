// src/domains/chat/components/InlineEmojiBar.tsx
// ADIM 8 – Inline reaction picker: 👍 ❤️ only

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

const EMOJIS = ["👍", "❤️"] as const;

export type InlineEmoji = (typeof EMOJIS)[number];

type Props = {
  onSelect: (emoji: string) => void;
};

export default function InlineEmojiBar({ onSelect }: Props) {
  const T = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: T.cardBg,
          borderColor: T.border,
        },
      ]}
    >
      {EMOJIS.map((e) => (
        <TouchableOpacity
          key={e}
          onPress={() => onSelect(e)}
          style={styles.item}
          activeOpacity={0.8}
        >
          <Text style={styles.emoji}>{e}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  item: {
    paddingHorizontal: 4,
  },
  emoji: {
    fontSize: 18,
  },
});
