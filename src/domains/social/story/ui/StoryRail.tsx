import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useSocialProfile } from "../../hooks/useSocialProfile";
import { groupStoriesByUser } from "../services/socialStoryGroupService";
import {
  getStories,
  isStoryViewed,
  subscribeStories,
} from "../services/socialStoryStateService";
import StoryAvatar from "./StoryAvatar";

const ITEM_WIDTH = 76; // 64 + 12 marginRight

type Props = {
  stories: any[];
};

export default function StoryRail({ stories }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [storyRev, setStoryRev] = useState(0);
  const { profile } = useSocialProfile();
  const navigation = useNavigation<any>();

  useEffect(() => subscribeStories(() => setStoryRev((n) => n + 1)), []);

  const allStories = useMemo(() => getStories(), [storyRev]);
  const groups = useMemo(
    () => groupStoriesByUser(allStories as any, profile.userId),
    [allStories, profile.userId]
  );

  const meName = useMemo(() => {
    const raw = profile?.username?.trim();
    if (!raw) return "Sen";
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return parts[0] ?? "Sen";
    return `${parts[0]} ${parts[1][0]}`;
  }, [profile?.username]);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 50,
    }),
    []
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const first = viewableItems[0];
      if (first?.index != null) setActiveIndex(first.index);
    },
    []
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    []
  );

  const currentUserId = profile?.userId;
  const railData = useMemo(
    () => [{ userId: "__add__", isAddCard: true }, ...groups],
    [groups]
  );

  const hasUnseenStory = useMemo(
    () =>
      groups.some(
        (g) =>
          !g.stories.every((s: any) =>
            isStoryViewed(s.id, g.userId, currentUserId)
          )
      ),
    [groups, currentUserId]
  );

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

  return (
    <View style={styles.container}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={railData}
        keyExtractor={(item) => (item.isAddCard ? "__add__" : item.userId)}
        renderItem={({ item, index }) => {
          if (item.isAddCard) {
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addCard}
                onPress={() => navigation.navigate("SocialCreateStory")}
              >
                <View style={styles.addCircle}>
                  <Ionicons name="add-circle" size={30} color="#00BFFF" />
                </View>
                <Text style={styles.addLabel}>Hikaye Ekle</Text>
              </TouchableOpacity>
            );
          }
          const viewed = item.stories.every((s: any) =>
            isStoryViewed(s.id, item.userId, currentUserId)
          );

          return (
            <StoryAvatar
              name={item.userId === currentUserId ? meName : item.username}
              uri={
                item.userId === currentUserId
                  ? profile?.avatarUri ?? null
                  : item.avatarUri ?? null
              }
              userId={item.userId}
              seen={viewed}
              active={index === activeIndex}
              isMe={item.userId === currentUserId}
              ringAnim={
                hasUnseenStory && !viewed ? ringAnim : undefined
              }
            />
          );
        }}
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 0,
    marginTop: 8,
    alignItems: "center",
    flexDirection: "row",
  },

  content: {
    paddingLeft: 8,
    paddingRight: 14,
  },
  addCard: {
    width: 64,
    marginRight: 12,
    alignItems: "center",
  },
  addCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});

