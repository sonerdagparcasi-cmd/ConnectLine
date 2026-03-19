// src/domains/chat/components/message/MessageSkeleton.tsx
// Skeleton placeholder for a single message bubble (loading state)

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  /** true = right (mine), false = left (peer) */
  mine?: boolean;
  /** Width ratio 0.3–0.9 for variation */
  widthRatio?: number;
};

export const MessageSkeleton = React.memo(function MessageSkeleton({
  mine = false,
  widthRatio = 0.65,
}: Props) {
  const T = useAppTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const bubbleBg = mine ? `${T.accent}22` : T.border;
  const lineBg = mine ? (T.isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.25)") : T.cardBg;
  const lineBgShort = mine ? (T.isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.2)") : T.border;

  return (
    <View style={[styles.wrap, mine ? styles.wrapMine : styles.wrapPeer]}>
      <Animated.View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            alignSelf: mine ? "flex-end" : "flex-start",
            maxWidth: `${widthRatio * 100}%`,
          },
          { opacity },
        ]}
      >
        <View style={[styles.line, { backgroundColor: lineBg }]} />
        <View style={[styles.line, styles.lineShort, { backgroundColor: lineBgShort }]} />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginVertical: 4, marginHorizontal: 12 },
  wrapMine: { alignItems: "flex-end" },
  wrapPeer: { alignItems: "flex-start" },
  bubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: "center",
  },
  line: {
    height: 10,
    borderRadius: 5,
    width: "100%",
    marginBottom: 6,
  },
  lineShort: { width: "70%", marginBottom: 0 },
});
