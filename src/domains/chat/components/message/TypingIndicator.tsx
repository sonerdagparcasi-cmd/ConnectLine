// src/domains/chat/components/message/TypingIndicator.tsx

import React, { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

type Props = {
  /** Optional label e.g. "Alice is typing..." */
  label?: string;
};

function TypingIndicatorInner({ label }: Props) {
  const T = useAppTheme();
  const a = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = [];
    a.forEach((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      loops.push(loop);
      loop.start();
    });
    return () => loops.forEach((l) => l.stop());
  }, [a]);

  const dots = a.map((anim, i) => (
    <Animated.View
      key={i}
      style={[
        styles.dot,
        {
          backgroundColor: T.mutedText,
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              }),
            },
          ],
        },
      ]}
    />
  ));

  return (
    <View style={[styles.wrap, { backgroundColor: T.cardBg, borderColor: T.border }]}>
      <View style={styles.dotsRow}>{dots}</View>
      {label ? (
        <Text style={[styles.label, { color: T.mutedText }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default memo(TypingIndicatorInner);
