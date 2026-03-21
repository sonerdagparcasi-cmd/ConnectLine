// src/domains/social/screens/SocialExploreScreen.tsx
// FAZ 4 – Explore: trending, videos, suggested people, events, hashtags

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

import SocialScreenLayout from "../components/SocialScreenLayout";
import SocialSuggestedUserCard, {
  type SuggestedUser,
} from "../components/SocialSuggestedUserCard";

import type { SocialStackParamList } from "../navigation/SocialNavigator";

import {
  getHashtagsFromPosts,
  getTrendingPosts,
  getTrendingVideos,
} from "../services/socialFeedStateService";

import {
  getMutualConnections,
  getSuggestedUsers,
  isFollowing,
  subscribeFollow,
  toggleFollow,
} from "../services/socialFollowService";
import { subscribeFeed } from "../services/socialFeedStateService";

import { socialEventService, type SocialEvent } from "../services/socialEventService";

import type { SocialPost } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

const TRENDING_LIMIT = 6;
const VIDEOS_PREVIEW = 4;
const SUGGESTED_LIMIT = 10;
const EVENTS_LIMIT = 5;

export default function SocialExploreScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [listTick, setListTick] = useState(0);

  useEffect(() => {
    const bump = () => setListTick((n) => n + 1);
    const u1 = subscribeFollow(bump);
    const u2 = subscribeFeed(bump);
    return () => {
      u1();
      u2();
    };
  }, []);

  const trendingPosts = useMemo(
    () => getTrendingPosts(TRENDING_LIMIT),
    [listTick]
  );
  const trendingVideos = useMemo(
    () => getTrendingVideos(VIDEOS_PREVIEW),
    [listTick]
  );
  const suggestedUsers: SuggestedUser[] = useMemo(() => {
    return getSuggestedUsers(SUGGESTED_LIMIT).map((u) => ({
      userId: u.userId,
      username: u.username,
      userAvatarUri: null,
      mutualCount: getMutualConnections(u.userId),
    }));
  }, [listTick]);
  const hashtags = useMemo(() => getHashtagsFromPosts(), [listTick]);

  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    socialEventService.getEvents().then((list) => {
      if (!cancelled) {
        setEvents(list.slice(0, EVENTS_LIMIT));
        setEventsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openPost = useCallback(
    (post: SocialPost) => {
      navigation.navigate("SocialPostDetail", { postId: post.id });
    },
    [navigation]
  );

  const openVideoFeed = useCallback(() => {
    navigation.navigate("SocialVideoFeed");
  }, [navigation]);

  const openEvent = useCallback(
    (eventId: string) => {
      navigation.navigate("SocialEventDetail", { eventId });
    },
    [navigation]
  );

  const openProfile = useCallback(
    (userId: string) => {
      navigation.navigate("SocialProfileContainer", { userId });
    },
    [navigation]
  );

  function renderTrendingGrid() {
    if (trendingPosts.length === 0) {
      return (
        <View style={[styles.emptyBox, { backgroundColor: T.cardBg }]}>
          <Ionicons name="images-outline" size={32} color={T.mutedText} />
          <Text style={[styles.emptyText, { color: T.mutedText }]}>
            {t("social.loading")}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        {trendingPosts.map((post) => {
          const media = post.media?.[0];
          const isVideo = media?.type === "video";
          return (
            <TouchableOpacity
              key={post.id}
              style={styles.gridItem}
              activeOpacity={0.9}
              onPress={() => openPost(post)}
            >
              {media?.uri ? (
                <Image source={{ uri: media.uri }} style={styles.gridImage} />
              ) : (
                <View
                  style={[
                    styles.placeholder,
                    { backgroundColor: T.backgroundColor },
                  ]}
                >
                  <Ionicons name="image" size={20} color={T.mutedText} />
                </View>
              )}
              {isVideo && (
                <View
                  style={[
                    styles.videoBadge,
                    { backgroundColor: T.textColor + "99" },
                  ]}
                >
                  <Ionicons name="videocam" size={12} color={T.cardBg} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  function renderVideosRow() {
    if (trendingVideos.length === 0) {
      return (
        <View style={[styles.emptyRow, { backgroundColor: T.cardBg }]}>
          <Text style={[styles.emptyText, { color: T.mutedText }]}>
            {t("social.noVideos")}
          </Text>
        </View>
      );
    }
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {trendingVideos.map((post) => {
          const media = post.media?.[0];
          return (
            <TouchableOpacity
              key={post.id}
              style={[styles.videoCard, { backgroundColor: T.cardBg }]}
              onPress={() => openPost(post)}
            >
              {media?.uri ? (
                <Image
                  source={{ uri: media.uri }}
                  style={styles.videoThumb}
                />
              ) : (
                <View
                  style={[
                    styles.videoThumb,
                    styles.placeholder,
                    { backgroundColor: T.backgroundColor },
                  ]}
                >
                  <Ionicons name="videocam" size={24} color={T.mutedText} />
                </View>
              )}
              <View
                style={[
                  styles.playOverlay,
                  { backgroundColor: "rgba(0,0,0,0.35)" },
                ]}
              >
                <Ionicons name="play" size={28} color={T.cardBg} />
              </View>
              {media?.durationSec != null && (
                <View
                  style={[
                    styles.durationBadge,
                    { backgroundColor: T.textColor + "dd" },
                  ]}
                >
                  <Text style={[styles.durationText, { color: T.cardBg }]}>
                    {Math.floor(media.durationSec / 60)}:
                    {String(media.durationSec % 60).padStart(2, "0")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.seeAllCard, { backgroundColor: T.cardBg, borderColor: T.border }]}
          onPress={openVideoFeed}
        >
          <Ionicons name="play-circle" size={36} color={T.accent} />
          <Text style={[styles.seeAllText, { color: T.textColor }]}>
            {t("social.seeAll")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <SocialScreenLayout title={t("social.explore.title")}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Suggested people */}
        <View style={[styles.section, { borderBottomColor: T.border }]}>
          <Text style={[styles.sectionTitle, { color: T.textColor }]}>
            {t("social.suggestedPeople")}
          </Text>
          {suggestedUsers.length === 0 ? (
            <View style={[styles.emptyRow, { backgroundColor: T.cardBg }]}>
              <Text style={[styles.emptyText, { color: T.mutedText }]}>
                {t("social.noSuggestions")}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {suggestedUsers.map((user) => (
                <View key={user.userId} style={styles.suggestedItem}>
                  <SocialSuggestedUserCard
                    user={user}
                    isFollowing={isFollowing(user.userId)}
                    onFollow={() => toggleFollow(user.userId)}
                    onPress={() => openProfile(user.userId)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Trending posts */}
        <View style={[styles.section, { borderBottomColor: T.border }]}>
          <Text style={[styles.sectionTitle, { color: T.textColor }]}>
            {t("social.trending")}
          </Text>
          {renderTrendingGrid()}
        </View>

        {/* Trending videos */}
        <View style={[styles.section, { borderBottomColor: T.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: T.textColor }]}>
              {t("social.trendingVideos")}
            </Text>
            {trendingVideos.length > 0 && (
              <TouchableOpacity onPress={openVideoFeed}>
                <Text style={[styles.seeAllLink, { color: T.accent }]}>
                  {t("social.seeAll")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {renderVideosRow()}
        </View>

        {/* Events near you */}
        <View style={[styles.section, { borderBottomColor: T.border }]}>
          <Text style={[styles.sectionTitle, { color: T.textColor }]}>
            {t("social.nearbyEvents")}
          </Text>
          {eventsLoading ? (
            <View style={[styles.emptyRow, { backgroundColor: T.cardBg }]}>
              <ActivityIndicator color={T.accent} size="small" />
              <Text style={[styles.emptyText, { color: T.mutedText }]}>
                {t("social.loading")}
              </Text>
            </View>
          ) : events.length === 0 ? (
            <View style={[styles.emptyRow, { backgroundColor: T.cardBg }]}>
              <Text style={[styles.emptyText, { color: T.mutedText }]}>
                {t("social.noEvents")}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {events.map((ev) => (
                <TouchableOpacity
                  key={ev.id}
                  style={[styles.eventCard, { backgroundColor: T.cardBg, borderColor: T.border }]}
                  onPress={() => openEvent(ev.id)}
                >
                  <View
                    style={[
                      styles.eventPlaceholder,
                      { backgroundColor: T.backgroundColor },
                    ]}
                  >
                    <Ionicons name="calendar" size={24} color={T.mutedText} />
                  </View>
                  <Text
                    style={[styles.eventTitle, { color: T.textColor }]}
                    numberOfLines={2}
                  >
                    {ev.title}
                  </Text>
                  <Text
                    style={[styles.eventDate, { color: T.mutedText }]}
                    numberOfLines={1}
                  >
                    {ev.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <View style={[styles.section, { borderBottomColor: T.border }]}>
            <Text style={[styles.sectionTitle, { color: T.textColor }]}>
              {t("social.hashtags")}
            </Text>
            <View style={styles.hashtagWrap}>
              {hashtags.slice(0, 12).map(({ tag }) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.hashtagChip, { backgroundColor: T.cardBg, borderColor: T.border }]}
                >
                  <Text style={[styles.hashtagText, { color: T.textColor }]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SocialScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },

  section: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  seeAllLink: { fontSize: 13, fontWeight: "700" },

  horizontalList: {
    paddingRight: 12,
    gap: 10,
  },
  suggestedItem: { marginRight: 10 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -2,
  },
  gridItem: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  placeholder: {
    flex: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  videoBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    padding: 4,
    borderRadius: 4,
  },

  videoCard: {
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
  },
  videoThumb: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: { fontSize: 10, fontWeight: "700" },

  seeAllCard: {
    width: 100,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllText: { fontSize: 12, fontWeight: "700", marginTop: 6 },

  eventCard: {
    width: 140,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  eventPlaceholder: {
    height: 70,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  eventTitle: { fontSize: 13, fontWeight: "700" },
  eventDate: { fontSize: 11, marginTop: 2 },

  hashtagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hashtagChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  hashtagText: { fontSize: 13, fontWeight: "600" },

  emptyBox: {
    minHeight: 120,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRow: {
    minHeight: 80,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: { fontSize: 13, marginTop: 6 },
});
