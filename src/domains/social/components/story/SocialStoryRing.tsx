import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  seen?: boolean;
  children: React.ReactNode;
};

const SWAP_MS = 3000;

const TOP = "#00BFFF";
const BOTTOM = "#1834AE";
const SEEN = "#9CA3AF";

const OUTER_SIZE = 64; // 58 avatar + 3px ring each side
const INNER_SIZE = 58;
const OUTER_RADIUS = 18;
const INNER_RADIUS = 14;

export default function SocialStoryRing({ seen, children }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (seen) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: SWAP_MS,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: SWAP_MS,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [anim, seen]);

  const opacityA = useMemo(() => anim, [anim]);
  const opacityB = useMemo(
    () =>
      anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
    [anim]
  );

  if (seen) {
    return (
      <View style={[styles.ring, styles.seenRing]}>
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.ring}>
      <Animated.View style={[styles.layer, { opacity: opacityA }]}>
        <LinearGradient
          colors={[TOP, BOTTOM]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View style={[styles.layer, { opacity: opacityB }]}>
        <LinearGradient
          colors={[BOTTOM, TOP]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  seenRing: {
    backgroundColor: SEEN,
  },

  layer: {
    ...StyleSheet.absoluteFillObject,
  },

  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: OUTER_RADIUS,
  },

  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_RADIUS,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

