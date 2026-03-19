// src/domains/social/components/SocialStoriesProfileRail.tsx
// 🔒 SOCIAL STORIES PROFILE RAIL — GRADIENT RING ANIMATION

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import { isStoryViewed } from "../services/socialStoryStateService";
import type { SocialStory } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

type Props = {
  stories: SocialStory[];
  currentUserId: string;
};

const RING_SIZE = 72;
const AVATAR_SIZE = 58;
const RING_RADIUS = RING_SIZE * 0.28;
const AVATAR_RADIUS = AVATAR_SIZE * 0.28;

export default function SocialStoriesProfileRail({
  stories,
  currentUserId,
}: Props) {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    };
  }, [ringAnim]);

  const ringOpacityA = ringAnim;
  const ringOpacityB = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  function openStory(userId: string) {
    navigation.navigate("SocialStoryViewer", { initialUserId: userId });
  }

  function createStory() {
    navigation.navigate("SocialCreateStory");
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        keyExtractor={(s) => s.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={createStory}
            style={styles.storyItem}
          >
            <View
              style={[
                styles.avatarBase,
                {
                  borderColor: T.border,
                  backgroundColor: T.cardBg,
                },
              ]}
            >
              <Ionicons name="add" size={22} color={T.textColor} />
            </View>

            <Text style={[styles.label, { color: T.textColor }]}>
              {t("social.story")}
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const isOwn = item.userId === currentUserId;
          const isSeen = isStoryViewed(item.id);

          const avatarContent = item.userAvatarUri ? (
            <Image source={{ uri: item.userAvatarUri }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={20} color={T.textColor} />
          );

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.storyItem}
              onPress={() => openStory(item.userId)}
            >
              <View style={styles.ringWrap}>
                {isOwn || isSeen ? (
                  <View
                    style={[
                      styles.ringBase,
                      { borderColor: "#9CA3AF" },
                    ]}
                  />
                ) : (
                  <>
                    <Animated.View
                      style={[
                        styles.ringBase,
                        styles.ringLayer,
                        { opacity: ringOpacityA },
                      ]}
                    >
                      <LinearGradient
                        colors={["#00BFFF", "#1834AE"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.ringGradient}
                      />
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.ringBase,
                        styles.ringLayer,
                        { opacity: ringOpacityB },
                      ]}
                    >
                      <LinearGradient
                        colors={["#1834AE", "#00BFFF"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.ringGradient}
                      />
                    </Animated.View>
                  </>
                )}

                <View
                  style={[
                    styles.avatarOuter,
                    { backgroundColor: T.cardBg },
                  ]}
                >
                  <View
                    style={[
                      styles.avatarBase,
                      {
                        borderColor: T.cardBg,
                        backgroundColor: T.cardBg,
                      },
                    ]}
                  >
                    {avatarContent}
                  </View>
                </View>
              </View>

              <Text
                numberOfLines={1}
                style={[styles.label, { color: T.textColor }]}
              >
                {item.username}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },

  list: {
    paddingHorizontal: 10,
    gap: 12,
  },

  storyItem: {
    width: 70,
    alignItems: "center",
  },

  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  ringBase: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_RADIUS,
    borderWidth: 3.5,
    borderColor: "transparent",
  },

  ringLayer: {
    position: "absolute",
    overflow: "hidden",
  },

  ringGradient: {
    width: "100%",
    height: "100%",
  },

  avatarOuter: {
    position: "absolute",
    width: AVATAR_SIZE + 4,
    height: AVATAR_SIZE + 4,
    borderRadius: AVATAR_RADIUS + 2,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarBase: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
  },

  label: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
});