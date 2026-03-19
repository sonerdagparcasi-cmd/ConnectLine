// src/domains/chat/components/ChatNotificationBadge.tsx
// Red notification badge for unread count – use on chat tab (bottom/top)

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

const BADGE_BG = "#FF3B30";

type Props = {
  count: number;
};

/**
 * Renders a small red circular badge with unread count.
 * Hidden when count is 0. Shows "99+" when count > 99.
 * Scales up slightly when count changes.
 */
export function ChatNotificationBadge({ count }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count <= 0) return;
    scale.setValue(1.2);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 80,
      bounciness: 6,
    }).start();
  }, [count, scale]);

  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BADGE_BG,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
