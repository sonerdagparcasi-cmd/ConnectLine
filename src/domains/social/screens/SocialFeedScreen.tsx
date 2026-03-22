// src/domains/social/screens/SocialFeedScreen.tsx
// 🔒 SOCIAL FEED — REELS MODE (vertical fullscreen, flex slot height via onLayout)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from "react-native";

import { t } from "../../../shared/i18n/t";
import SocialNotificationBell from "../components/SocialNotificationBell";
import SocialPostCard from "../components/SocialPostCard";

import type { SocialStackParamList } from "../navigation/SocialNavigator";

import {
  getFeedPagination,
  getFeedPosts,
  isPostSaved,
  loadMoreFeedPosts,
  subscribeFeed,
  toggleLike,
  toggleSavedPost,
} from "../services/socialFeedStateService";

import {
  blockUser,
  getCurrentSocialUserId,
  isMuted,
  isUserBlocked,
  subscribeFollow,
} from "../services/socialFollowService";

import {
  REPORT_REASONS,
  reportPost,
  reportUser,
} from "../services/socialReportService";

import { addNotification } from "../services/socialNotificationService";

import type { SocialPost } from "../types/social.types";

/* ------------------------------------------------------------------ */

type Nav = NativeStackNavigationProp<SocialStackParamList>;

/* ------------------------------------------------------------------ */

export default function SocialFeedScreen() {
  const navigation = useNavigation<Nav>();

  const [posts, setPosts] = useState<SocialPost[]>(() => getFeedPosts());
  const [hiddenMap, setHiddenMap] = useState<Record<string, boolean>>({});
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [slotHeight, setSlotHeight] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const idx = viewableItems[0].index;
        if (idx != null) setVisibleIndex(idx);
      }
    }
  );

  useEffect(() => {
    setPosts(getFeedPosts());

    const unsubFeed = subscribeFeed(() => {
      setPosts(getFeedPosts());
    });
    const unsubFollow = subscribeFollow(() => {
      setPosts(getFeedPosts());
    });

    return () => {
      unsubFeed();
      unsubFollow();
    };
  }, []);

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          !hiddenMap[p.id] &&
          !isUserBlocked(p.userId) &&
          !isMuted(p.userId)
      ),
    [posts, hiddenMap]
  );

  const handleLoadMore = useCallback(() => {
    const { hasMore, loading } = getFeedPagination();
    if (!hasMore || loading) return;
    loadMoreFeedPosts();
  }, []);

  const handleToggleLike = useCallback((postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    toggleLike(postId);
  }, [posts]);

  const toggleHidden = useCallback((postId: string) => {
    setHiddenMap((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const toggleSave = useCallback((postId: string) => {
    toggleSavedPost(postId);
  }, []);

  const sharePost = useCallback(
    (post: SocialPost) => {
      const options: { text: string; onPress?: () => void }[] = [
        {
          text: t("social.share.toProfile"),
          onPress: () =>
            addNotification({
              id: `share_${Date.now()}`,
              type: "share",
              actorUserId: "me",
              actorUsername: "sen",
              targetUserId: post.userId,
              postId: post.id,
              text: "gönderiyi paylaştı",
              createdAt: new Date().toISOString(),
              read: false,
            }),
        },
        {
          text: t("social.share.toMessage"),
          onPress: () =>
            addNotification({
              id: `share_${Date.now()}_msg`,
              type: "share",
              actorUserId: "me",
              actorUsername: "sen",
              targetUserId: post.userId,
              postId: post.id,
              text: "gönderiyi mesajda paylaştı",
              createdAt: new Date().toISOString(),
              read: false,
            }),
        },
        {
          text: t("social.share.copyLink"),
          onPress: () => {},
        },
      ];
      if (post.event) {
        options.push({
          text: t("social.share.shareEvent"),
          onPress: () =>
            addNotification({
              id: `share_ev_${Date.now()}`,
              type: "share",
              actorUserId: "me",
              actorUsername: "sen",
              targetUserId: post.userId,
              postId: post.id,
              eventId: post.event?.eventId,
              text: "etkinliği paylaştı",
              createdAt: new Date().toISOString(),
              read: false,
            }),
        });
      }
      Alert.alert(t("social.share"), "", [
        ...options,
        { text: t("common.cancel"), style: "cancel" as const },
      ]);
    },
    []
  );

  const openPostMenu = useCallback(
    (post: SocialPost) => {
      const isHidden = !!hiddenMap[post.id];
      const isMyPost = post.userId === getCurrentSocialUserId();

      const reportPostReason = () => {
        Alert.alert(
          t("social.report.post"),
          "",
          [
            ...REPORT_REASONS.map((r) => ({
              text: r.labelTr,
              onPress: () => {
                reportPost(post.id, r.value);
                Alert.alert("", "Bildirimin alındı");
              },
            })),
            { text: t("common.cancel"), style: "cancel" as const },
          ]
        );
      };

      const reportUserReason = () => {
        Alert.alert(
          t("social.report.user"),
          "",
          [
            ...REPORT_REASONS.map((r) => ({
              text: r.labelTr,
              onPress: () => {
                reportUser(post.userId, r.value);
                Alert.alert("", "Bildirimin alındı");
              },
            })),
            { text: t("common.cancel"), style: "cancel" as const },
          ]
        );
      };

      const buttons: { text: string; onPress?: () => void; style?: "cancel" }[] = [
        {
          text: t("social.feed.edit"),
          onPress: () =>
            navigation.navigate("SocialCreatePost", {
              editingPostId: post.id,
            } as never),
        },
        {
          text: isHidden ? t("social.feed.unhide") : t("social.feed.hide"),
          onPress: () => toggleHidden(post.id),
        },
      ];
      if (!isMyPost) {
        buttons.push(
          { text: t("social.report.post"), onPress: reportPostReason },
          {
            text: t("social.report.quick"),
            onPress: () => {
              reportPost(post.id);
              Alert.alert("", "Bildirimin alındı");
            },
          },
          { text: t("social.report.user"), onPress: reportUserReason },
          {
            text: t("social.block"),
            onPress: () => {
              blockUser(post.userId);
              Alert.alert("", "Kullanıcı engellendi");
            },
          }
        );
      }
      buttons.push({ text: t("common.cancel"), style: "cancel" });
      Alert.alert(t("social.postDetail.title"), "", buttons);
    },
    [hiddenMap, navigation]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SocialPost; index: number }) => (
      <View
        style={
          slotHeight > 0
            ? { height: slotHeight, flexGrow: 0 }
            : { flex: 1, minHeight: 0 }
        }
      >
        <SocialPostCard
          post={item}
          reels
          isActive={index === visibleIndex}
          saved={isPostSaved(item.id)}
          onPressPost={() =>
            navigation.navigate("SocialPostDetail", { postId: item.id })
          }
          onPressMedia={(mediaIndex) =>
            navigation.navigate("SocialMediaPreview", {
              media: item.media,
              initialIndex: mediaIndex,
            })
          }
          onToggleLike={() => handleToggleLike(item.id)}
          onPressComments={() =>
            navigation.navigate("SocialPostDetail", { postId: item.id })
          }
          onPressMenu={() => openPostMenu(item)}
          onPressShare={() => sharePost(item)}
          onToggleSave={() => toggleSave(item.id)}
        />
      </View>
    ),
    [
      handleToggleLike,
      toggleSave,
      openPostMenu,
      sharePost,
      navigation,
      visibleIndex,
      slotHeight,
    ]
  );

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyWrap}>
        <Ionicons name="newspaper-outline" size={48} color="#888" />
        <Text style={styles.emptyTitle}>{t("social.empty.feed")}</Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.feedRoot}>
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && h !== slotHeight) setSlotHeight(h);
        }}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        style={styles.listFlex}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 80,
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.6}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
      />

      <View style={styles.topRightActions}>
        <SocialNotificationBell iconColor="#ffffff" />
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("SocialCreatePost")}
          style={styles.topRightFab}
        >
          <Ionicons name="add" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  feedRoot: { flex: 1, backgroundColor: "#000000" },
  listFlex: { flex: 1 },
  listContent: { flexGrow: 1 },
  topRightActions: {
    position: "absolute",
    right: 12,
    top: 52,
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
  emptyWrap: {
    flex: 1,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    color: "#ffffff",
  },
});
