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

import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialNotificationBell from "../components/SocialNotificationBell";
import SocialPostCard from "../components/SocialPostCard";
import SocialPostSkeleton from "../components/SocialPostSkeleton";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import { getFeedPosts, subscribeFeed } from "../services/socialFeedStateService";
import { subscribeFollow } from "../services/socialFollowService";
import type { SocialPost } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

export default function SocialFeedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const [posts, setPosts] = useState<SocialPost[]>(() => getFeedPosts());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadMoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPosts(getFeedPosts());
    const unsubFeed = subscribeFeed(() => setPosts(getFeedPosts()));
    const unsubFollow = subscribeFollow(() => setPosts(getFeedPosts()));
    return () => {
      unsubFeed();
      unsubFollow();
    };
  }, []);

  useEffect(() => {
    loadingTimerRef.current = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (loadMoreTimerRef.current) clearTimeout(loadMoreTimerRef.current);
    };
  }, []);

  const visiblePosts = useMemo(() => posts, [posts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshTimerRef.current = setTimeout(() => {
      setPosts(getFeedPosts());
      setRefreshing(false);
    }, 1000);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    loadMoreTimerRef.current = setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 1000);
  }, [loadingMore]);

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
        <Text style={{ color: T.textColor }}>Henüz paylaşım yok</Text>
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
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <Text style={{ color: T.mutedText, textAlign: "center" }}>Yukleniyor...</Text>
            </View>
          ) : (
            <View style={styles.footerSpace}>
              <Text style={{ color: "transparent", textAlign: "center" }}>{page}</Text>
            </View>
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
  footerLoading: {
    padding: 16,
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
