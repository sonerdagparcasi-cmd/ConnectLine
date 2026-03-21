// src/domains/social/screens/SocialFeedScreen.tsx
// 🔒 SOCIAL FEED – PERFORMANCE + VIRTUALIZATION GUARD
// UPDATE: My Events section added (feed footer)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import SocialPostCard from "../components/SocialPostCard";
import SocialStoriesRail from "../components/SocialStoriesRail";

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
  isBlocked,
  isMuted,
  subscribeFollow,
} from "../services/socialFollowService";

import {
  REPORT_REASONS,
  reportPost,
  reportUser,
} from "../services/socialReportService";

import { SocialEvent, socialEventService } from "../services/socialEventService";
import { addNotification } from "../services/socialNotificationService";

import { getStories } from "../services/socialStoryStateService";

import type { SocialPost } from "../types/social.types";

/* ------------------------------------------------------------------ */

type Nav = NativeStackNavigationProp<SocialStackParamList>;

/* ------------------------------------------------------------------ */
/* VIRTUALIZATION CONFIG                                              */
/* ------------------------------------------------------------------ */

const ITEM_HEIGHT = 460;

/* ------------------------------------------------------------------ */

export default function SocialFeedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const [posts, setPosts] = useState<SocialPost[]>(() => getFeedPosts());
  const [storiesTick, setStoriesTick] = useState(0);
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [hiddenMap, setHiddenMap] = useState<Record<string, boolean>>({});
  const [loadingMore, setLoadingMore] = useState(false);

  /* ------------------------------------------------------------------ */
  /* LOAD EVENTS                                                        */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    async function loadEvents() {
      const e = await socialEventService.getEvents();
      setEvents(e);
    }

    loadEvents();
  }, []);

  /* ------------------------------------------------------------------ */
  /* REALTIME FEED                                                      */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    setPosts(getFeedPosts());

    const unsubFeed = subscribeFeed(() => {
      setPosts(getFeedPosts());
      setLoadingMore(false);
    });
    const unsubFollow = subscribeFollow(() => {
      setPosts(getFeedPosts());
      setStoriesTick((n) => n + 1);
    });

    return () => {
      unsubFeed();
      unsubFollow();
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* FILTER                                                             */
  /* ------------------------------------------------------------------ */

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          !hiddenMap[p.id] &&
          !isBlocked(p.userId) &&
          !isMuted(p.userId)
      ),
    [posts, hiddenMap]
  );

  /* ------------------------------------------------------------------ */
  /* PAGINATION                                                         */
  /* ------------------------------------------------------------------ */

  const handleLoadMore = useCallback(() => {
    const { hasMore, loading } = getFeedPagination();

    if (!hasMore || loading) return;

    setLoadingMore(true);

    loadMoreFeedPosts();
  }, []);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

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
              text: t(r.labelKey),
              onPress: () => reportPost(post.id, r.value),
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
              text: t(r.labelKey),
              onPress: () => reportUser(post.userId, r.value),
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
            onPress: () => reportPost(post.id),
          },
          { text: t("social.report.user"), onPress: reportUserReason },
          { text: t("social.block"), onPress: () => blockUser(post.userId) }
        );
      }
      buttons.push({ text: t("common.cancel"), style: "cancel" });
      Alert.alert(t("social.postDetail.title"), "", buttons);
    },
    [hiddenMap]
  );

  /* ------------------------------------------------------------------ */
  /* HEADER                                                             */
  /* ------------------------------------------------------------------ */

  const storiesForRail = useMemo(
    () =>
      getStories().filter(
        (s) => !isMuted(s.userId) && !isBlocked(s.userId)
      ),
    [storiesTick]
  );

  const listHeader = useMemo(
    () => (
      <SocialStoriesRail
        stories={storiesForRail}
        onOpenStory={(userId) =>
          navigation.navigate("SocialStoryViewer", {
            initialUserId: userId,
          })
        }
      />
    ),
    [navigation, storiesForRail]
  );

  /* ------------------------------------------------------------------ */
  /* FOOTER – MY EVENTS                                                 */
  /* ------------------------------------------------------------------ */

  const listFooter = useMemo(() => {
    if (!events.length) return null;

    return (
      <View style={styles.eventsBlock}>
        <Text style={[styles.eventsTitle, { color: T.textColor }]}>
          📅 {t("social.feed.myEvents")}
        </Text>

        {events.map((e) => (
          <TouchableOpacity
            key={e.id}
            style={[
              styles.eventCard,
              { borderColor: T.border, backgroundColor: T.cardBg },
            ]}
            onPress={() =>
              navigation.navigate("SocialEventDetail", { eventId: e.id })
            }
          >
            <Text style={[styles.eventTitle, { color: T.textColor }]}>
              {e.title}
            </Text>

            <Text style={{ color: T.mutedText }}>
              {e.date} · {e.location}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [events, navigation, T]);

  /* ------------------------------------------------------------------ */
  /* ITEM RENDER                                                        */
  /* ------------------------------------------------------------------ */

  const renderItem = useCallback(
    ({ item }: { item: SocialPost }) => (
      <SocialPostCard
        post={item}
        saved={isPostSaved(item.id)}
        onPressPost={() =>
          navigation.navigate("SocialPostDetail", { postId: item.id })
        }
        onPressMedia={(index) =>
          navigation.navigate("SocialMediaPreview", {
            media: item.media,
            initialIndex: index,
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
    ),
    [handleToggleLike, toggleSave, openPostMenu, sharePost, posts]
  );

  /* ------------------------------------------------------------------ */
  /* ITEM LAYOUT                                                        */
  /* ------------------------------------------------------------------ */

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const listEmpty = useMemo(
    () => (
      <View style={[styles.emptyWrap, { backgroundColor: T.backgroundColor }]}>
        <Ionicons name="newspaper-outline" size={48} color={T.mutedText} />
        <Text style={[styles.emptyTitle, { color: T.textColor }]}>
          {t("social.empty.feed")}
        </Text>
      </View>
    ),
    [T]
  );

  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <FlatList
        data={visiblePosts}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}

        showsVerticalScrollIndicator={false}

        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.6}

        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews

        getItemLayout={getItemLayout}

        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("SocialCreatePost")}
        style={styles.topRightFab}
      >
        <Ionicons name="add" size={30} color={T.textColor} />
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1 },

  topRightFab: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  eventsBlock: {
    padding: 16,
  },

  eventsTitle: {
    fontWeight: "900",
    marginBottom: 10,
    fontSize: 16,
  },

  eventCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  eventTitle: {
    fontWeight: "800",
    marginBottom: 4,
  },

  emptyWrap: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginTop: 12 },
});