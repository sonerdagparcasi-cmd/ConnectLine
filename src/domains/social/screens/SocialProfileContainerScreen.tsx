// src/domains/social/screens/SocialProfileContainerScreen.tsx
// FAZ 1 – Profil üst kartı, sekmeler, sahip/ziyaretçi aksiyonları, gerçek veri

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { useSocialProfile } from "../hooks/useSocialProfile";
import type { SocialStackParamList } from "../navigation/SocialNavigator";

import {
  getMutualConnections,
  getSuggestedUsers,
  isFollowing,
  subscribeFollow,
  toggleFollow,
} from "../services/socialFollowService";

import {
  getPostsByUser,
  getSavedPosts,
  subscribeFeed,
} from "../services/socialFeedStateService";

import {
  socialEventService,
  type SocialEvent,
} from "../services/socialEventService";

import { addNotification } from "../services/socialNotificationService";

import SocialSuggestedUserCard, {
  type SuggestedUser,
} from "../components/SocialSuggestedUserCard";

import type { SocialPost } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;
type ProfileRoute = RouteProp<SocialStackParamList, "SocialProfileContainer">;
type Tab = "posts" | "videos" | "events" | "saved";

export default function SocialProfileContainerScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ProfileRoute>();
  const profileUserId = route.params?.userId;

  const {
    isOwner,
    profile,
    stats,
    ownerActions,
    visitorActions,
  } = useSocialProfile(profileUserId);

  const [tab, setTab] = useState<Tab>("posts");
  const [following, setFollowing] = useState(() => isFollowing(profile.userId));

  const [feedPosts, setFeedPosts] = useState<SocialPost[]>(() =>
    getPostsByUser(profile.userId)
  );
  const [savedList, setSavedList] = useState<SocialPost[]>(() =>
    getSavedPosts()
  );
  const [userEvents, setUserEvents] = useState<SocialEvent[]>([]);

  useEffect(() => {
    const unsub = subscribeFollow(() =>
      setFollowing(isFollowing(profile.userId))
    );
    return unsub;
  }, [profile.userId]);

  useEffect(() => {
    setFeedPosts(getPostsByUser(profile.userId));
    setSavedList(getSavedPosts());
    const unsub = subscribeFeed(() => {
      setFeedPosts(getPostsByUser(profile.userId));
      setSavedList(getSavedPosts());
    });
    return unsub;
  }, [profile.userId]);

  useEffect(() => {
    let cancelled = false;
    socialEventService.getEventsByUser(profile.userId).then((events) => {
      if (!cancelled) setUserEvents(events);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.userId]);

  const gridPosts = feedPosts;
  const videoPosts = useMemo(
    () =>
      feedPosts.filter((p) => p.media?.some((m) => m.type === "video")),
    [feedPosts]
  );
  const savedPosts = isOwner ? savedList : [];
  const mutualConnections = isOwner ? 0 : getMutualConnections(profile.userId);

  const gradientColors = useMemo(
    () =>
      T.isDark
        ? ([T.backgroundColor, T.cardBg] as const)
        : (["#e8f4fc", "#d0e8f8"] as const),
    [T.isDark, T.backgroundColor, T.cardBg]
  );

  const handleOwnerAction = useCallback(
    (id: string) => {
      if (id === "editProfile") navigation.navigate("SocialHome");
      else if (id === "addStory") navigation.navigate("SocialCreateStory");
      else if (id === "createEvent")
        navigation.navigate("SocialCreateEvent", undefined);
    },
    [navigation]
  );

  const handleVisitorAction = useCallback(
    (id: string) => {
      if (id === "follow") toggleFollow(profile.userId);
      else if (id === "message") Alert.alert("", "Mesaj (UI-only)");
      else if (id === "shareProfile") Alert.alert("", "Profili paylaş (UI-only)");
      else if (id === "blockUser") Alert.alert("", "Engelle (UI-only)");
      else if (id === "reportUser") Alert.alert("", "Bildir (UI-only)");
    },
    [profile.userId]
  );

  const followButtonLabel = following
    ? t("social.profile.unfollow")
    : t("social.follow");

  /* --------------- HEADER --------------- */

  const Header = (
    <View style={styles.headerWrap}>
      <View style={[styles.coverContainer, { backgroundColor: T.cardBg }]}>
        {profile.coverUri ? (
          <Image source={{ uri: profile.coverUri }} style={styles.cover} />
        ) : (
          <LinearGradient colors={gradientColors} style={styles.cover} />
        )}
        {isOwner && (
          <TouchableOpacity
            style={[styles.coverSettings, { backgroundColor: "rgba(0,0,0,0.3)" }]}
            onPress={() => navigation.navigate("SocialHome")}
          >
            <Ionicons name="settings-outline" size={20} color={T.textColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatar,
              { borderColor: T.border, backgroundColor: T.cardBg },
            ]}
          >
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={40} color={T.mutedText} />
            )}
          </View>
        </View>

        <Text style={[styles.displayName, { color: T.textColor }]}>
          {profile.username}
        </Text>
        <Text style={[styles.usernameSub, { color: T.mutedText }]}>
          @{profile.username.replace(/\s+/g, "").toLowerCase() || profile.userId}
        </Text>

        {!!profile.bio && (
          <Text style={[styles.bio, { color: T.textColor }]}>{profile.bio}</Text>
        )}

        <View style={[styles.metaBlock, { borderTopColor: T.border }]}>
          {!!profile.location && (
            <Text style={[styles.meta, { color: T.mutedText }]}>
              📍 {profile.location}
            </Text>
          )}
          {!!profile.education && (
            <Text style={[styles.meta, { color: T.mutedText }]}>
              🎓 {profile.education}
            </Text>
          )}
          {!!profile.job && (
            <Text style={[styles.meta, { color: T.mutedText }]}>
              💼 {profile.job}
            </Text>
          )}
          {!!profile.website && (
            <TouchableOpacity
              onPress={() => profile.website && Linking.openURL(profile.website)}
            >
              <Text style={[styles.meta, { color: T.accent }]}>
                🌐 {profile.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, { borderTopColor: T.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: T.textColor }]}>
              {stats.followers}
            </Text>
            <Text style={[styles.statLabel, { color: T.mutedText }]}>
              {t("social.followers")}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: T.textColor }]}>
              {stats.following}
            </Text>
            <Text style={[styles.statLabel, { color: T.mutedText }]}>
              {t("social.following")}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: T.textColor }]}>
              {stats.posts}
            </Text>
            <Text style={[styles.statLabel, { color: T.mutedText }]}>
              {t("social.posts")}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: T.textColor }]}>
              {stats.events}
            </Text>
            <Text style={[styles.statLabel, { color: T.mutedText }]}>
              {t("social.events")}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: T.textColor }]}>
              {mutualConnections}
            </Text>
            <Text style={[styles.statLabel, { color: T.mutedText }]}>
              {t("social.mutualConnections")}
            </Text>
          </View>
        </View>

        {/* Owner / Visitor actions */}
        <View style={styles.actionsRow}>
          {isOwner ? (
            ownerActions.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.actionBtn, { backgroundColor: T.accent }]}
                onPress={() => handleOwnerAction(a.id)}
              >
                <Text style={[styles.actionBtnText, { color: T.cardBg }]}>
                  {t(a.labelKey)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: T.accent }]}
                onPress={() => {
                  if (!following) {
                    addNotification({
                      id: `follow_${Date.now()}`,
                      type: "follow",
                      actorUserId: "me",
                      actorUsername: "sen",
                      targetUserId: profile.userId,
                      text: "seni takip etti",
                      createdAt: new Date().toISOString(),
                      read: false,
                    });
                  }
                  toggleFollow(profile.userId);
                }}
              >
                <Text style={[styles.actionBtnText, { color: T.cardBg }]}>
                  {followButtonLabel}
                </Text>
              </TouchableOpacity>
              {visitorActions
                .filter((a) => a.id !== "follow")
                .map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.actionBtn,
                      { backgroundColor: T.cardBg, borderWidth: 1, borderColor: T.border },
                    ]}
                    onPress={() => handleVisitorAction(a.id)}
                  >
                    <Text style={[styles.actionBtnText, { color: T.textColor }]}>
                      {t(a.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderTopColor: T.border }]}>
        <TabBtn
          label={t("social.tabs.posts")}
          active={tab === "posts"}
          onPress={() => setTab("posts")}
          T={T}
        />
        <TabBtn
          label={t("social.tabs.videos")}
          active={tab === "videos"}
          onPress={() => setTab("videos")}
          T={T}
        />
        <TabBtn
          label={t("social.tabs.events")}
          active={tab === "events"}
          onPress={() => setTab("events")}
          T={T}
        />
        <TabBtn
          label={t("social.tabs.saved")}
          active={tab === "saved"}
          onPress={() => setTab("saved")}
          T={T}
        />
      </View>
    </View>
  );

  /* --------------- LIST DATA --------------- */

  const isEventsTab = tab === "events";
  const postData =
    tab === "posts" ? gridPosts : tab === "videos" ? videoPosts : savedPosts;

  const renderPostItem = useCallback(
    ({ item }: { item: SocialPost }) => {
      const media = item.media?.[0];
      return (
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: T.cardBg }]}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate("SocialPostDetail", { postId: item.id })
          }
        >
          {media?.uri ? (
            <Image source={{ uri: media.uri }} style={styles.gridImg} />
          ) : (
            <View style={[styles.gridPlaceholder, { backgroundColor: T.backgroundColor }]}>
              <Ionicons name="image" size={24} color={T.mutedText} />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [T, navigation]
  );

  const renderEventItem = useCallback(
    ({ item }: { item: SocialEvent }) => (
      <TouchableOpacity
        style={[styles.gridItem, styles.eventCard, { backgroundColor: T.cardBg }]}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("SocialEventDetail", { eventId: item.id })
        }
      >
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.eventCover} />
        ) : (
          <View style={[styles.eventCoverPlaceholder, { backgroundColor: T.border }]}>
            <Ionicons name="calendar" size={28} color={T.mutedText} />
          </View>
        )}
        <View style={[styles.eventTitleWrap, { backgroundColor: T.cardBg }]}>
          <Text style={[styles.eventTitle, { color: T.textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [T, navigation]
  );

  const keyExtractorPost = (p: SocialPost) => p.id;
  const keyExtractorEvent = (e: SocialEvent) => e.id;

  const profileSuggested: SuggestedUser[] = useMemo(() => {
    return getSuggestedUsers(5)
      .filter((u) => u.userId !== profile.userId)
      .map((u) => ({
        userId: u.userId,
        username: u.username,
        userAvatarUri: null,
        mutualCount: getMutualConnections(u.userId),
      }));
  }, [profile.userId]);

  const SuggestedFooter = useCallback(
    () =>
      profileSuggested.length === 0 ? null : (
        <View style={[styles.suggestedSection, { borderTopColor: T.border }]}>
          <Text style={[styles.suggestedTitle, { color: T.textColor }]}>
            {t("social.suggestedPeople")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedList}
          >
            {profileSuggested.map((user) => (
              <View key={user.userId} style={styles.suggestedCardWrap}>
                <SocialSuggestedUserCard
                  user={user}
                  isFollowing={isFollowing(user.userId)}
                  onFollow={() => toggleFollow(user.userId)}
                  onPress={() =>
                    navigation.navigate("SocialProfileContainer", {
                      userId: user.userId,
                    })
                  }
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ),
    [T, profileSuggested, navigation]
  );

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      {isEventsTab ? (
        <FlatList
          data={userEvents}
          keyExtractor={keyExtractorEvent}
          numColumns={3}
          ListHeaderComponent={Header}
          ListFooterComponent={SuggestedFooter}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={postData}
          keyExtractor={keyExtractorPost}
          numColumns={3}
          ListHeaderComponent={Header}
          ListFooterComponent={SuggestedFooter}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

function TabBtn({
  label,
  active,
  onPress,
  T,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, active && { borderBottomWidth: 2, borderBottomColor: T.accent }]}
    >
      <Text
        style={[
          styles.tabLabel,
          { color: active ? T.textColor : T.mutedText },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  headerWrap: { paddingBottom: 8 },

  coverContainer: { height: 140 },
  cover: { width: "100%", height: "100%" },
  coverSettings: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 8,
    borderRadius: 20,
  },

  profileCard: {
    paddingHorizontal: 16,
    marginTop: -56,
    alignItems: "center",
  },

  avatarWrap: { marginBottom: 8 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100 * 0.25,
    borderWidth: 3,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 100 * 0.25 },

  displayName: { fontSize: 20, fontWeight: "800" },
  usernameSub: { fontSize: 13, marginTop: 2 },
  bio: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 8,
    lineHeight: 20,
  },

  metaBlock: {
    width: "100%",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 4,
  },
  meta: { fontSize: 13 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },

  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionBtnText: { fontSize: 13, fontWeight: "700" },

  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    marginTop: 16,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabLabel: { fontSize: 11, fontWeight: "700" },

  listContent: { paddingBottom: 40 },

  gridItem: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 2,
  },
  gridImg: { width: "100%", height: "100%", borderRadius: 4 },
  gridPlaceholder: {
    flex: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  eventCard: { overflow: "hidden" },
  eventCover: { width: "100%", height: "80%", borderRadius: 4 },
  eventCoverPlaceholder: {
    width: "100%",
    height: "80%",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitleWrap: { flex: 1, padding: 4, justifyContent: "center" },
  eventTitle: { fontSize: 10, fontWeight: "700" },

  suggestedSection: {
    borderTopWidth: 1,
    marginTop: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  suggestedTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  suggestedList: { paddingHorizontal: 12, gap: 12 },
  suggestedCardWrap: { marginRight: 12 },
});
