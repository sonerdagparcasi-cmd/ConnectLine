import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const SWAP_MS = 3000;

const TOP = "#00BFFF";
const BOTTOM = "#1834AE";
const SEEN = "#9CA3AF";

export default function StoryRing({
  seen,
  children,
}: {
  seen: boolean;
  children: React.ReactNode;
}) {
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

    return () => {
      loop.stop();
    };
  }, [anim, seen]);

  const opacityA = anim;
  const opacityB = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  if (seen) {
    return (
      <View style={[styles.ring, { backgroundColor: SEEN }]}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.ring}>
      <Animated.View style={[styles.layer, { opacity: opacityA }]}>
        <LinearGradient
          colors={[TOP, BOTTOM]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
      <Animated.View style={[styles.layer, { opacity: opacityB }]}>
        <LinearGradient
          colors={[BOTTOM, TOP]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: 3,
    borderRadius: 18,
    overflow: "hidden",
  },

  layer: {
    ...StyleSheet.absoluteFillObject,
  },

  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
});
