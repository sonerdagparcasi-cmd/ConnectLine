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

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialSuggestedUserCard, {
  type SuggestedUser,
} from "../components/SocialSuggestedUserCard";
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
import { addNotification } from "../services/socialNotificationService";
import {
  socialEventService,
  type SocialEvent,
} from "../services/socialEventService";
import type { SocialPost } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;
type ProfileRoute = RouteProp<SocialStackParamList, "SocialProfileContainer">;
type Tab = "posts" | "videos" | "events" | "saved";

export default function SocialProfileContainerScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ProfileRoute>();
  const profileUserId = route.params?.userId;

  const { isOwner, profile, stats } = useSocialProfile(profileUserId);

  const [tab, setTab] = useState<Tab>("posts");
  const [following, setFollowing] = useState(() => isFollowing(profile.userId));

  const [feedPosts, setFeedPosts] = useState<SocialPost[]>(() =>
    getPostsByUser(profile.userId)
  );
  const [savedList, setSavedList] = useState<SocialPost[]>(() => getSavedPosts());
  const [userEvents, setUserEvents] = useState<SocialEvent[]>([]);

  useEffect(() => {
    const unsub = subscribeFollow(() => setFollowing(isFollowing(profile.userId)));
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
    () => feedPosts.filter((p) => p.media?.some((m) => m.type === "video")),
    [feedPosts]
  );
  const savedPosts = isOwner ? savedList : [];
  const mutualConnections = isOwner ? 0 : getMutualConnections(profile.userId);
  const primaryText = T.isDark ? "#FFFFFF" : "#0f172a";
  const secondaryText = T.isDark
    ? "rgba(255,255,255,0.75)"
    : "rgba(15,23,42,0.75)";
  const mutedTextColor = T.isDark
    ? "rgba(255,255,255,0.55)"
    : "rgba(15,23,42,0.55)";
  const dangerText = T.isDark ? "#ff6b6b" : "#e11d48";
  const headerGradient = useMemo(
    () =>
      T.isDark
        ? (["#000000", "#1834ae"] as const)
        : (["#f1f0f0", "#00bfff"] as const),
    [T.isDark]
  );

  const handleOwnerAction = useCallback(
    (id: string) => {
      if (id === "editProfile") navigation.navigate("SocialHome");
      else if (id === "addStory") navigation.navigate("SocialCreateStory");
      else if (id === "createEvent") navigation.navigate("SocialCreateEvent", undefined);
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

  const Header = (
    <View style={styles.headerWrap}>
      <LinearGradient colors={headerGradient} style={styles.headerContainer}>
        <View style={styles.profileCard}>
          <View style={styles.headerContentRow}>
            <View style={styles.leftColumn}>
              <View style={[styles.avatar, { borderColor: T.border, backgroundColor: T.cardBg }]}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={32} color={T.mutedText} />
                )}
              </View>

              <View style={styles.identityBlock}>
                <Text style={[styles.displayName, { color: primaryText }]}>{profile.username}</Text>
                {!!profile.bio && <Text style={[styles.bio, { color: secondaryText }]}>{profile.bio}</Text>}
                {!!profile.website && (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => profile.website && Linking.openURL(profile.website)}
                  >
                    <Text style={[styles.website, { color: secondaryText }]}>🌐 {profile.website}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.profileFacts}>
                <View style={styles.factRow}>
                  <Text style={[styles.factText, { color: secondaryText }]}>
                    👤 {stats.followers} Takipçi
                  </Text>
                </View>
                <View style={styles.factRow}>
                  <Text style={[styles.factText, { color: secondaryText }]}>
                    👥 {mutualConnections} Ortak Arkadaşlar
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.factRow}
                  onPress={() =>
                    isOwner
                      ? handleOwnerAction("createEvent")
                      : navigation.navigate("SocialCreateEvent", undefined)
                  }
                >
                  <Text style={[styles.factText, { color: secondaryText }]}>
                    📅 Etkinlik Oluştur
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.textAction}
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
                  <Text style={[styles.textActionLabel, { color: primaryText }]}>Takip Et</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.textAction}
                  onPress={() => toggleFollow(profile.userId)}
                >
                  <Text style={[styles.textActionLabel, { color: mutedTextColor }]}>Takibi Bırak</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.textAction}
                  onPress={() => handleVisitorAction("blockUser")}
                >
                  <Text style={[styles.textActionLabel, { color: dangerText }]}>Engelle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <LinearGradient colors={headerGradient} style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          <TabBtn
            label={`Gönderi ${gridPosts.length}`}
            active={tab === "posts"}
            onPress={() => setTab("posts")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
          />
          <TabBtn
            label={`Videolar ${videoPosts.length}`}
            active={tab === "videos"}
            onPress={() => setTab("videos")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
          />
          <TabBtn
            label={`Etkinlikler ${userEvents.length}`}
            active={tab === "events"}
            onPress={() => setTab("events")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
          />
          <TabBtn
            label={`Kaydedilenler ${savedPosts.length}`}
            active={tab === "saved"}
            onPress={() => setTab("saved")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
          />
          <TabBtn
            label="Paylaşım Yap"
            active={false}
            onPress={() =>
              isOwner ? handleOwnerAction("addStory") : handleVisitorAction("shareProfile")
            }
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
          />
          <TabBtn
            label="Profili Düzenle"
            active={false}
            onPress={() => (isOwner ? handleOwnerAction("editProfile") : undefined)}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );

  const isEventsTab = tab === "events";
  const postData = tab === "posts" ? gridPosts : tab === "videos" ? videoPosts : savedPosts;

  const renderPostItem = useCallback(
    ({ item }: { item: SocialPost }) => {
      const media = item.media?.[0];
      return (
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: T.cardBg }]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("SocialPostDetail", { postId: item.id })}
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
        onPress={() => navigation.navigate("SocialEventDetail", { eventId: item.id })}
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
  activeColor,
  inactiveColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
}) {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} style={styles.tabBtn}>
      <Text
        style={[
          styles.tabLabel,
          { color: active ? activeColor : inactiveColor },
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
  headerWrap: { paddingBottom: 0 },
  headerContainer: {
    paddingBottom: 10,
  },
  tabContainer: {
    paddingBottom: 8,
  },
  profileCard: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  headerContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },
  leftColumn: {
    width: 130,
    alignItems: "flex-start",
    flexShrink: 0,
  },
  rightColumn: {
    flex: 0,
    width: "58%",
    minWidth: 0,
    paddingTop: 2,
    alignItems: "flex-end",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 16 },
  profileFacts: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
  },
  factRow: {
    minHeight: 26,
    justifyContent: "center",
  },
  factText: {
    fontSize: 13.5,
    fontWeight: "400",
    letterSpacing: 0.24,
    opacity: 0.85,
  },
  identityBlock: {
    marginTop: 12,
    gap: 4,
    width: "100%",
  },
  displayName: {
    fontSize: 16.5,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  bio: {
    fontSize: 13,
    fontWeight: "300",
    lineHeight: 17,
    letterSpacing: 0.24,
    opacity: 0.72,
  },
  website: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.22,
    opacity: 0.84,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "nowrap",
    width: "100%",
  },
  textAction: {
    marginRight: 18,
  },
  textActionLabel: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.24,
    opacity: 0.88,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
    flexWrap: "nowrap",
    alignItems: "center",
  },
  tabBtn: {
    paddingVertical: 6,
    marginRight: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  tabLabel: {
    fontSize: 13.5,
    fontWeight: "400",
    letterSpacing: 0.22,
  },
  listContent: { paddingBottom: 40, flexGrow: 1 },
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
