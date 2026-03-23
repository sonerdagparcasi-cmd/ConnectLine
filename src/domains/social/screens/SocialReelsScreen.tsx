import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View, type ViewToken } from "react-native";

import SocialReelItem from "../components/SocialReelItem";
import { getReelsPosts, subscribeFeed } from "../services/socialFeedStateService";
import type { SocialPost } from "../types/social.types";

export default function SocialReelsScreen() {
  const [posts, setPosts] = useState<SocialPost[]>(() => getReelsPosts());
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    const unsub = subscribeFeed(() => {
      setPosts(getReelsPosts());
    });
    return unsub;
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setVisibleIndex(viewableItems[0].index ?? 0);
      }
    }
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.page}>
            <SocialReelItem post={item} isActive={index === visibleIndex} />
          </View>
        )}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  page: {
    height: "100%",
  },
});
