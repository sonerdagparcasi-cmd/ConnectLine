// src/domains/chat/components/ActiveUsersRail.tsx
// Animated horizontal avatar rail with centered preview expansion (story-style).

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

const NORMAL_SIZE = 48;
const NORMAL_RADIUS = 24;
const ACTIVE_WIDTH = 90;
const ACTIVE_HEIGHT = 120;
const ACTIVE_RADIUS = 16;
const MY_AVATAR_SIZE = 52;
const CYCLE_MS = 3000;
const ANIM_DURATION = 280;

export type RailUser = {
  id: string;
  name: string;
  avatarUri?: string | null;
  previewText?: string;
  /** If true or undefined, show gradient story ring; if false, show grey ring */
  unseen?: boolean;
};

type Props = {
  users: RailUser[];
  currentUser: { name: string; avatarUri?: string | null };
};

function RailItem({
  user,
  isActive,
  onLayout,
}: {
  user: RailUser;
  isActive: boolean;
  onLayout: (w: number) => void;
}) {
  const T = useAppTheme();
  const expand = useSharedValue(0);

  useEffect(() => {
    expand.value = withTiming(isActive ? 1 : 0, {
      duration: ANIM_DURATION,
    });
  }, [isActive, expand]);

  const animatedStyle = useAnimatedStyle(() => {
    const w = NORMAL_SIZE + (ACTIVE_WIDTH - NORMAL_SIZE) * expand.value;
    const h = NORMAL_SIZE + (ACTIVE_HEIGHT - NORMAL_SIZE) * expand.value;
    const r = NORMAL_RADIUS + (ACTIVE_RADIUS - NORMAL_RADIUS) * expand.value;
    return {
      width: w,
      height: h,
      borderRadius: r,
    };
  }, []);

  const unseen = user.unseen !== false;
  const content = isActive ? (
    <View style={styles.previewInner}>
      <View style={[styles.previewAvatar, { backgroundColor: T.border }]}>
        {user.avatarUri ? (
          <Image source={{ uri: user.avatarUri }} style={styles.previewAvatarImg} />
        ) : (
          <Ionicons name="person" size={24} color={T.mutedText} />
        )}
      </View>
      <Text
        style={[styles.previewText, { color: T.mutedText }]}
        numberOfLines={2}
      >
        {user.previewText ?? t("chat.mediaPreview.title")}
      </Text>
    </View>
  ) : user.avatarUri ? (
    <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
  ) : (
    <Ionicons name="person" size={22} color={T.mutedText} />
  );

  return (
    <View style={styles.itemWrap} onLayout={(e) => onLayout(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.avatarBox, animatedStyle]}>
        {unseen ? (
          <LinearGradient
            colors={T.isDark ? T.darkGradient.colors : T.lightGradient.colors}
            style={styles.storyRing}
          >
            <View style={[styles.avatarInner, { backgroundColor: T.cardBg }]}>
              {content}
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.storyRingSeen, { borderColor: T.border }]}>
            <View style={[styles.avatarInner, { backgroundColor: T.cardBg }]}>
              {content}
            </View>
          </View>
        )}
      </Animated.View>
      <Text
        style={[styles.username, { color: T.textColor }]}
        numberOfLines={1}
      >
        {user.name}
      </Text>
    </View>
  );
}

export default function ActiveUsersRail({ users, currentUser }: Props) {
  const T = useAppTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const itemWidths = useRef<number[]>([]);
  const railWidth = useRef(0);

  const cycle = useCallback(() => {
    if (users.length <= 1) return;
    setActiveIndex((i) => (i + 1) % users.length);
  }, [users.length]);

  useEffect(() => {
    const id = setInterval(cycle, CYCLE_MS);
    return () => clearInterval(id);
  }, [cycle]);

  const handleItemLayout = useCallback((index: number, w: number) => {
    itemWidths.current[index] = w;
  }, []);

  const handleRailLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    railWidth.current = e.nativeEvent.layout.width;
  }, []);

  useEffect(() => {
    const gap = 12;
    const approx = NORMAL_SIZE + gap;
    const x = activeIndex * approx - railWidth.current / 2 + approx / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, x), animated: true });
  }, [activeIndex]);

  if (users.length === 0) {
    return (
      <View style={styles.railRow}>
        <View style={styles.rail} />
        <View style={[styles.myAvatarWrap, { borderColor: T.border }]}>
          {currentUser.avatarUri ? (
            <Image source={{ uri: currentUser.avatarUri }} style={styles.myAvatarImg} />
          ) : (
            <Ionicons name="person" size={26} color={T.mutedText} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.railRow} onLayout={handleRailLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        style={styles.rail}
      >
        {users.map((user, index) => (
          <RailItem
            key={user.id}
            user={user}
            isActive={index === activeIndex}
            onLayout={(w) => handleItemLayout(index, w)}
          />
        ))}
      </ScrollView>
      <View style={[styles.myAvatarWrap, { borderColor: T.border }]}>
        {currentUser.avatarUri ? (
          <Image source={{ uri: currentUser.avatarUri }} style={styles.myAvatarImg} />
        ) : (
          <Ionicons name="person" size={26} color={T.mutedText} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  railRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  rail: {
    flex: 1,
  },
  railContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingRight: 8,
  },
  itemWrap: {
    alignItems: "center",
    minWidth: NORMAL_SIZE + 4,
  },
  avatarBox: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  storyRing: {
    padding: 3,
    borderRadius: 26,
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  storyRingSeen: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: NORMAL_RADIUS,
  },
  previewInner: {
    flex: 1,
    width: "100%",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  previewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewAvatarImg: {
    width: "100%",
    height: "100%",
  },
  previewText: {
    fontSize: 10,
    textAlign: "center",
    maxWidth: ACTIVE_WIDTH - 12,
  },
  username: {
    fontSize: 11,
    maxWidth: 70,
    textAlign: "center",
    marginTop: 4,
  },
  myAvatarWrap: {
    width: MY_AVATAR_SIZE,
    height: MY_AVATAR_SIZE,
    borderRadius: MY_AVATAR_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  myAvatarImg: {
    width: "100%",
    height: "100%",
  },
});
