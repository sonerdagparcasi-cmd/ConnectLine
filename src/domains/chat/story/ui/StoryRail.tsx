import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useChatProfile } from "../../profile/useChatProfile";
import { groupStoriesByUser } from "../chatStoryGroupService";
import { getStories, isStoryViewed } from "../chatStoryStateService";
import StoryAvatar from "./StoryAvatar";

const ITEM_WIDTH = 76; // 64 + 12 marginRight

type Props = {
  stories: any[];
  currentUserId: string;
};

export default function StoryRail({ stories, currentUserId }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { profile } = useChatProfile();

  const allStories = getStories();
  const groups = groupStoriesByUser(allStories as any);

  const meName = useMemo(() => {
    const raw = profile?.displayName?.trim();
    if (!raw) return "Sen";
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return parts[0] ?? "Sen";
    return `${parts[0]} ${parts[1][0]}`;
  }, [profile?.displayName]);

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

  return (
    <View style={styles.container}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={groups}
        keyExtractor={(i) => i.userId}
        renderItem={({ item, index }) => {
          const viewed = item.stories.every((s: any) =>
            isStoryViewed(s.id, item.userId)
          );

          return (
            <StoryAvatar
              name={item.userId === "me" ? meName : item.username}
              uri={
                item.userId === "me"
                  ? (profile?.avatarUri ?? null)
                  : (item.avatarUri ?? null)
              }
              userId={item.userId}
              seen={viewed}
              active={index === activeIndex}
              isMe={item.userId === "me"}
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
});
