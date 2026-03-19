import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

export default function StoreFlyToCartAnimation({
  startX,
  startY,
  endX,
  endY,
  emoji,
  onEnd,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  emoji: string;
  onEnd?: () => void;
}) {

  const position = useRef(
    new Animated.ValueXY({ x: startX, y: startY })
  ).current;

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    Animated.parallel([

      Animated.timing(position, {
        toValue: { x: endX, y: endY },
        duration: 600,
        useNativeDriver: true,
      }),

      Animated.timing(scale, {
        toValue: 0.3,
        duration: 600,
        useNativeDriver: true,
      }),

    ]).start(() => onEnd?.());

  }, []);

  return (
    <Animated.View
      style={[
        styles.fly,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale },
          ],
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({

  fly: {
    position: "absolute",
    zIndex: 999,
  },

  emoji: {
    fontSize: 28,
  },

});