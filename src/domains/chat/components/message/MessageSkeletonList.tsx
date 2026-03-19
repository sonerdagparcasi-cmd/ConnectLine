// src/domains/chat/components/message/MessageSkeletonList.tsx
// List of message skeletons for conversation loading state (inverted: newest at bottom)

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { MessageSkeleton } from "./MessageSkeleton";

const SKELETON_CONFIG = [
  { mine: false, widthRatio: 0.75 },
  { mine: true, widthRatio: 0.5 },
  { mine: false, widthRatio: 0.6 },
  { mine: true, widthRatio: 0.85 },
  { mine: false, widthRatio: 0.45 },
  { mine: true, widthRatio: 0.55 },
];

type Props = {
  /** Optional label below skeletons (e.g. t("chat.loading.messages")) */
  loadingLabel?: string;
};

export function MessageSkeletonList({ loadingLabel }: Props) {
  const T = useAppTheme();
  return (
    <View style={styles.container}>
      {SKELETON_CONFIG.map((props, i) => (
        <MessageSkeleton key={`sk-${i}`} {...props} />
      ))}
      {loadingLabel ? (
        <Text style={[styles.label, { color: T.mutedText }]}>{loadingLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  label: { fontSize: 13, textAlign: "center", marginTop: 12 },
});
