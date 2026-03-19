// src/domains/chat/components/InboxRowSkeleton.tsx
// Single row skeleton for chat list loading state

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";

export const InboxRowSkeleton = React.memo(function InboxRowSkeleton() {
  const T = useAppTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.row, { borderColor: T.border }]}>
      <View style={[styles.avatar, { backgroundColor: T.border }]} />
      <View style={styles.textWrap}>
        <Animated.View style={[styles.lineName, { backgroundColor: T.border, opacity }]} />
        <Animated.View style={[styles.linePreview, { backgroundColor: T.border, opacity }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  textWrap: { flex: 1 },
  lineName: { height: 14, borderRadius: 7, width: "50%", marginBottom: 8 },
  linePreview: { height: 12, borderRadius: 6, width: "80%" },
});
