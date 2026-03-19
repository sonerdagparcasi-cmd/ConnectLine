// src/domains/chat/components/message/MessageText.tsx

import React, { memo } from "react";
import { StyleSheet, Text } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  text: string;
  isMine: boolean;
  textColor: string;
  highlight?: string;
  fontSize?: number;
};

function MessageTextInner({ text, isMine, textColor, highlight, fontSize = 15 }: Props) {
  const T = useAppTheme();
  const highlightBg = T.isDark ? "rgba(255,235,59,0.35)" : "rgba(255,235,59,0.5)";
  const lineHeight = Math.round(fontSize * 1.35);
  const baseStyle = [styles.text, { color: textColor, fontSize, lineHeight }];

  if (!highlight || !highlight.trim()) {
    return <Text style={baseStyle} selectable>{text}</Text>;
  }

  const lower = text.toLowerCase();
  const h = highlight.trim().toLowerCase();
  const idx = lower.indexOf(h);
  if (idx === -1) {
    return <Text style={baseStyle} selectable>{text}</Text>;
  }

  return (
    <Text style={baseStyle} selectable>
      <Text>{text.slice(0, idx)}</Text>
      <Text style={[styles.highlight, { color: textColor, backgroundColor: highlightBg }]}>{text.slice(idx, idx + h.length)}</Text>
      <Text>{text.slice(idx + h.length)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "600",
  },
  highlight: {
    fontWeight: "800",
  },
});

export default memo(MessageTextInner);
