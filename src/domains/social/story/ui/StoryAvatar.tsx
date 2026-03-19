import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

/** Dış ring 64 (r20), padding 2 → ince halka; avatar 56 (r16) */
const RING_OUTER = 64;
const RING_RADIUS = 20;
const RING_PADDING = 3;
const RING_INNER = RING_OUTER - RING_PADDING * 2; // 58
const RING_INNER_RADIUS = 16;
const AVATAR = 56;
const AVATAR_RADIUS = 16;

const GRADIENT_A: [string, string] = ["#00BFFF", "#1834AE"];
const GRADIENT_B: [string, string] = ["#1834AE", "#00BFFF"];
const SEEN_RING = "#9CA3AF";

function StoryRing({
  seen,
  ringAnim,
  premiumSeenMuted,
  children,
}: {
  seen: boolean;
  ringAnim?: Animated.Value;
  /** Premium rail: seen halka %60 opaklık */
  premiumSeenMuted?: boolean;
  children: ReactNode;
}) {
  const ringInner = (
    <View style={styles.ringInnerClip}>
      {children}
    </View>
  );

  if (seen) {
    return (
      <View
        style={[
          styles.ringOuter,
          {
            backgroundColor: SEEN_RING,
            opacity: premiumSeenMuted ? 0.6 : 1,
          },
        ]}
      >
        {ringInner}
      </View>
    );
  }

  if (ringAnim) {
    const ringOpacityA = ringAnim;
    const ringOpacityB = ringAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });

    return (
      <View style={styles.ringOuter}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.gradientLayer,
            {
              opacity: ringOpacityA,
            },
          ]}
        >
          <LinearGradient
            colors={GRADIENT_A}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.gradientLayer,
            {
              opacity: ringOpacityB,
            },
          ]}
        >
          <LinearGradient
            colors={GRADIENT_B}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {ringInner}
      </View>
    );
  }

  return (
    <View style={styles.ringOuter}>
      <View style={styles.gradientLayer} pointerEvents="none">
        <LinearGradient
          colors={GRADIENT_A}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {ringInner}
    </View>
  );
}

export default function StoryAvatar({
  name,
  uri,
  userId,
  seen,
  active,
  isMe,
  ringAnim,
  premiumUI,
}: {
  name: string;
  uri: string | null;
  userId: string;
  seen: boolean;
  active?: boolean;
  isMe?: boolean;
  ringAnim?: Animated.Value;
  /** SocialStoriesRail premium: beyaz label, add badge, basınç scale, seen soluk */
  premiumUI?: boolean;
}) {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const openStory = () =>
    navigation.navigate("SocialStoryViewer", {
      initialUserId: userId,
      initialStoryIndex: 0,
    });

  const springTo = (to: number) =>
    Animated.spring(scaleAnim, {
      toValue: to,
      friction: 6,
      tension: 320,
      useNativeDriver: true,
    }).start();

  const innerAvatar =
    premiumUI ? (
      <View style={styles.avatarWrap}>
        <Pressable
          onPress={openStory}
          onPressIn={() => springTo(0.95)}
          onPressOut={() => springTo(1)}
          style={styles.avatarPressFill}
        >
          {uri ? (
            <Image source={{ uri }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatarFallback, { backgroundColor: T.cardBg }]}
            >
              <Ionicons name="person" size={22} color={T.textColor} />
            </View>
          )}
        </Pressable>
        {isMe && (
          <TouchableOpacity
            style={styles.addBadge}
            onPress={() => navigation.navigate("SocialCreateStory")}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    ) : (
      <TouchableOpacity
        style={styles.avatarWrap}
        activeOpacity={0.9}
        onPress={openStory}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: T.cardBg }]}>
            <Ionicons name="person" size={22} color={T.textColor} />
          </View>
        )}
        {isMe && (
          <TouchableOpacity
            style={styles.avatarPlus}
            onPress={() => navigation.navigate("SocialCreateStory")}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={13} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );

  const ringBlock = (
    <View style={[styles.ringWrap, active && styles.ringWrapActive]}>
      <StoryRing
        seen={seen}
        ringAnim={seen ? undefined : ringAnim}
        premiumSeenMuted={!!premiumUI}
      >
        {innerAvatar}
      </StoryRing>
    </View>
  );

  return (
    <View style={styles.container}>
      {premiumUI ? (
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }], alignItems: "center" }}
        >
          {ringBlock}
        </Animated.View>
      ) : (
        ringBlock
      )}

      <Text
        numberOfLines={1}
        style={
          premiumUI
            ? styles.namePremium
            : [styles.name, { color: T.textColor }]
        }
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: RING_OUTER,
  },

  ringWrap: {
    borderRadius: RING_RADIUS,
  },

  ringWrapActive: {
    ...Platform.select({
      ios: {
        shadowColor: "#00BFFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
        shadowColor: "#00BFFF",
      },
    }),
  },

  ringOuter: {
    width: RING_OUTER,
    height: RING_OUTER,
    borderRadius: RING_RADIUS,
    padding: RING_PADDING,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RING_RADIUS,
    overflow: "hidden",
  },

  ringInnerClip: {
    width: RING_INNER,
    height: RING_INNER,
    borderRadius: RING_INNER_RADIUS,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    overflow: "hidden",
    flexShrink: 0,
  },

  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR_RADIUS,
    overflow: "hidden",
    position: "relative",
  },

  avatarPressFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_RADIUS,
    overflow: "hidden",
  },

  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR_RADIUS,
  },

  avatarFallback: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },

  addBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00BFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
    zIndex: 4,
  },

  avatarPlus: {
    position: "absolute",
    right: 1.5,
    bottom: 1.5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00BFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    maxWidth: RING_OUTER + 8,
  },

  namePremium: {
    marginTop: 6,
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    maxWidth: 64,
  },
});
