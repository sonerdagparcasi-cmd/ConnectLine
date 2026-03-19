// src/domains/chat/components/message/MessageSystem.tsx

import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  text: string;
};

function MessageSystemInner({ text }: Props) {
  const T = useAppTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: T.cardBg }]}>
      <Text style={[styles.text, { color: T.mutedText }]} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: "85%",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default memo(MessageSystemInner);
