// src/domains/chat/screens/MediaPreviewScreen.tsx
// (C3.y.4 – ADIM 2: SWIPE TO DISMISS)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";

/* ------------------------------------------------------------------ */
/* TYPES (🔒 ROUTE CONTRACT)                                           */
/* ------------------------------------------------------------------ */

type Params = {
  uri: string;
  type: "image" | "video";
};

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                           */
/* ------------------------------------------------------------------ */

const CLOSE_THRESHOLD = 120;

/* ------------------------------------------------------------------ */
/* SCREEN                                                              */
/* ------------------------------------------------------------------ */

export default function MediaPreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { uri, type } = route.params as Params;

  const T = useAppTheme();
  const C = getColors(T.isDark);
  const videoRef = useRef<Video>(null);

  /* ---------------- ANIMATION ---------------- */

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = translateY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });
  const scale = translateY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > Math.abs(g.dx) && g.dy > 6,
      onPanResponderMove: Animated.event(
        [null, { dy: translateY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, g) => {
        if (g.dy > CLOSE_THRESHOLD) {
          navigation.goBack();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      videoRef.current?.stopAsync().catch(() => {});
      videoRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      {/* CLOSE */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.close}
        hitSlop={10}
        activeOpacity={0.85}
      >
        <Ionicons name="close" size={26} color={C.buttonText} />
      </TouchableOpacity>

      {/* MEDIA */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.mediaWrap,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        {type === "image" ? (
          <Image source={{ uri }} style={styles.media} resizeMode="contain" />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={false}   // ❌ autoplay yok
            isMuted              // 🔇 sessiz başlar
          />
        )}
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  close: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  mediaWrap: {
    flex: 1,
    justifyContent: "center",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});