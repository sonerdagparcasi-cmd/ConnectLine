import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialFeedHeader from "../components/SocialFeedHeader";
import SocialNotificationBell from "../components/SocialNotificationBell";
import SocialPostCard from "../components/SocialPostCard";
import SocialPostSkeleton from "../components/SocialPostSkeleton";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import {
  loadInitial,
  loadMore,
  subscribeFeed,
} from "../services/socialFeedStateService";
import { subscribeFollow } from "../services/socialFollowService";
import {
  getStories,
  subscribeStories,
} from "../services/socialStoryStateService";
import type { SocialPost, SocialStory } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

export default function SocialFeedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const [feed, setFeed] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [stories, setStories] = useState<SocialStory[]>([]);

  useEffect(() => {
    const initial = loadInitial();
    setFeed(initial.feed);
    setHasMore(initial.hasMore);
    setStories(getStories());
    setLoading(false);

    const unsubFeed = subscribeFeed(() => {
      setFeed((prev) => [...prev]);
    });
    const unsubFollow = subscribeFollow(() => {
      setFeed((prev) => [...prev]);
    });
    const unsubStories = subscribeStories(() => {
      setStories(getStories());
    });
    return () => {
      unsubFeed();
      unsubFollow();
      unsubStories();
    };
  }, []);
  const visiblePosts = useMemo(() => feed, [feed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const res = loadInitial();
    setFeed(res.feed);
    setHasMore(res.hasMore);
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const res = loadMore();
    setFeed(res.feed);
    setHasMore(res.hasMore);
    setLoadingMore(false);
  }, [loadingMore, hasMore]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0) {
        setVisibleIndex(viewableItems[0].index ?? 0);
      }
    }
  );

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
        <View style={styles.skeletonWrap}>
          <SocialPostSkeleton />
          <SocialPostSkeleton />
          <SocialPostSkeleton />
        </View>
      </View>
    );
  }

  if (visiblePosts.length === 0) {
    return (
      <View style={[styles.root, styles.emptyCenter, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.textColor }}>{t("no_posts")}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SocialPostCard
            post={item}
            isActive={index === visibleIndex}
            shouldPreload={index === visibleIndex + 1}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <SocialFeedHeader
            stories={stories}
            onOpenStory={(userId) =>
              navigation.navigate("SocialStoryViewer", {
                initialUserId: userId,
                initialStoryIndex: 0,
              })
            }
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <SocialPostSkeleton count={3} compact />
          ) : (
            <View style={styles.footerSpace} />
          )
        }
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
      />

      <View style={styles.topRightActions}>
        <SocialNotificationBell iconColor={T.textColor} />
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("SocialCreatePost")}
          style={styles.topRightFab}
        >
          <Ionicons name="add" size={30} color={T.textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingBottom: 80,
  },
  skeletonWrap: {
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  emptyCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  footerSpace: {
    height: 1,
  },
  topRightActions: {
    position: "absolute",
    right: 12,
    top: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  topRightFab: {
    width: 44,
    height: 44,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
