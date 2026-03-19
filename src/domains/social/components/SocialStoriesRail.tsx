// src/domains/social/components/SocialStoriesRail.tsx
// 🔒 SOCIAL STORIES RAIL – keep scroll hide, Chat-like item UI

import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { groupStoriesByUser } from "../services/socialStoryGroupService";
import { getStoryMeta } from "../story/services/socialStoryStateService";
import type { SocialStory } from "../types/social.types";
import { useSocialProfile } from "../hooks/useSocialProfile";
import StoryAvatar from "../story/ui/StoryAvatar";

/* ------------------------------------------------------------------ */

type Props = {
  stories: SocialStory[];
  onOpenStory: (userId: string) => void;
  scrollY?: Animated.Value;
};

/* ------------------------------------------------------------------ */

const ITEM_WIDTH = 76; // 64 + 12 marginRight (match Chat)

const HIDE_THRESHOLD = 18;
const SHOW_THRESHOLD = 6;

const ANIM_MS = 180;

/* ------------------------------------------------------------------ */

export default function SocialStoriesRail({
  stories,
  onOpenStory,
  scrollY,
}: Props) {
  const T = useAppTheme();

  /* ------------------------------------------------------------------ */
  /* STORY GROUPING                                                     */
  /* ------------------------------------------------------------------ */

  const { profile } = useSocialProfile();

  const groups = useMemo(
    () => groupStoriesByUser(stories, profile.userId),
    [stories, profile.userId]
  );

  const currentUserId = profile?.userId;

  const hasUnseenStory = useMemo(() => {
    const uid = currentUserId ?? "";
    return groups.some((g) =>
      !g.stories.every((s) =>
        (getStoryMeta(s.id).seenBy ?? []).includes(uid)
      )
    );
  }, [groups, currentUserId]);

  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasUnseenStory) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      ringAnim.setValue(0);
    };
  }, [hasUnseenStory, ringAnim]);

  /* ------------------------------------------------------------------ */
  const [activeIndex, setActiveIndex] = useState(0);

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const railHeight = useRef(0);

  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 50,
    }),
    []
  );

  const onViewableItemsChanged = useMemo(
    () => ({
      viewableItems,
    }: {
      viewableItems: Array<{ index: number | null }>;
    }) => {
      const first = viewableItems[0];
      if (first?.index != null) setActiveIndex(first.index);
    },
    []
  );

  const getItemLayout = useMemo(
    () => (_: any, index: number) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    []
  );

  /* ------------------------------------------------------------------ */
  /* SCROLL BASED HIDE / SHOW                                           */
  /* ------------------------------------------------------------------ */

  function hideRail() {
    if (isHidden.current) return;

    isHidden.current = true;

    const h = railHeight.current || 110;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -(h + 6),
        duration: ANIM_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIM_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function showRail() {
    if (!isHidden.current) return;

    isHidden.current = false;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIM_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIM_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function onRailLayout(e: LayoutChangeEvent) {
    railHeight.current = e.nativeEvent.layout.height;
  }

  /* ------------------------------------------------------------------ */
  /* SCROLL LISTENER                                                    */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!scrollY) return;

    const listener = scrollY.addListener(({ value }) => {
      const dy = value - lastScrollY.current;

      lastScrollY.current = value;

      if (value <= 0) {
        showRail();
        return;
      }

      if (dy > HIDE_THRESHOLD) hideRail();
      else if (dy < -SHOW_THRESHOLD) showRail();
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY]);

  /* ------------------------------------------------------------------ */

  const gradientColors: [string, string] = T.isDark
    ? ["#000000", "#1834ae"]
    : ["#f1f0f0", "#00bfff"];

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <Animated.View
      onLayout={onRailLayout}
      style={[
        styles.railWrap,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientWrap}
      >
        <View style={styles.wrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={groups}
            keyExtractor={(g) => g.userId}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const uid = currentUserId ?? "";
              const isOwn = item.userId === currentUserId;
              const allSeenByMe = item.stories.every((s) =>
                (getStoryMeta(s.id).seenBy ?? []).includes(uid)
              );

              return (
                <View style={styles.itemGap}>
                  <StoryAvatar
                    name={isOwn ? "Sen" : item.username}
                    uri={item.avatarUri ?? null}
                    userId={item.userId}
                    seen={allSeenByMe}
                    active={index === activeIndex}
                    isMe={isOwn}
                    premiumUI
                    ringAnim={
                      hasUnseenStory && !allSeenByMe ? ringAnim : undefined
                    }
                  />
                </View>
              );
            }}
            snapToInterval={ITEM_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={getItemLayout}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  railWrap: {},

  gradientWrap: {
    paddingTop: 4,
    paddingBottom: 8,
  },

  wrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  listContent: {
    paddingLeft: 12,
    paddingRight: 12,
  },

  itemGap: {
    marginRight: 12,
  },
});