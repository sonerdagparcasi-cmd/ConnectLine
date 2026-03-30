// src/domains/social/screens/SocialProfileContainerScreen.tsx
// FAZ 1 – Profil üst kartı, sekmeler, sahip/ziyaretçi aksiyonları, gerçek veri

import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  socialEventService,
  type SocialEvent,
} from "../services/socialEventService";
import {
  getProfilePostsVisibleToCurrentUser,
  getSavedPosts,
  subscribeFeed,
} from "../services/socialFeedStateService";
import {
  blockUser,
  getCurrentSocialUserId,
  getMutualConnections,
  getSuggestedUsers,
  isUserBlocked,
  socialFollowService,
  sendFollowRequest,
  subscribeFollow,
  unblockUser,
} from "../services/socialFollowService";
import { socialMessageService } from "../services/socialMessageService";
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
  const [followTick, setFollowTick] = useState(0);
  const currentUserId = getCurrentSocialUserId();
  const [following, setFollowing] = useState(() =>
    socialFollowService.isFollowing(currentUserId, profile.userId)
  );
  const [blocked, setBlocked] = useState(() => isUserBlocked(profile.userId));

  const [feedPosts, setFeedPosts] = useState<SocialPost[]>(() =>
    getProfilePostsVisibleToCurrentUser(profile.userId)
  );
  const [savedList, setSavedList] = useState<SocialPost[]>(() => getSavedPosts());
  const [userEvents, setUserEvents] = useState<SocialEvent[]>([]);
  const itemRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    const sync = () => {
      setFollowing(
        socialFollowService.isFollowing(currentUserId, profile.userId)
      );
      setBlocked(isUserBlocked(profile.userId));
      setFeedPosts(getProfilePostsVisibleToCurrentUser(profile.userId));
      setSavedList(getSavedPosts());
    };
    sync();
    const unsubFeed = subscribeFeed(sync);
    const unsubFollow = subscribeFollow(sync);
    return () => {
      unsubFeed();
      unsubFollow();
    };
  }, [profile.userId, currentUserId]);

  const handleFollow = useCallback(() => {
    if (socialFollowService.isFollowing(currentUserId, profile.userId)) {
      socialFollowService.unfollow(currentUserId, profile.userId);
    } else {
      socialFollowService.follow(currentUserId, profile.userId);
    }
    setFollowTick((prev) => prev + 1);
  }, [currentUserId, profile.userId]);

  useEffect(() => {
    if (!isOwner && blocked) {
      setUserEvents([]);
      return;
    }
    let cancelled = false;
    socialEventService.getEventsByUser(profile.userId).then((events) => {
      if (!cancelled) setUserEvents(events);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.userId, isOwner, blocked]);

  const gridPosts = feedPosts;
  const videoPosts = useMemo(
    () => feedPosts.filter((p) => p.media?.some((m) => m.type === "video")),
    [feedPosts]
  );
  const savedPosts = isOwner ? savedList : [];
  const mutualConnections =
    isOwner ? 0 : blocked ? 0 : getMutualConnections(profile.userId);
  const primaryText = T.isDark ? "#FFFFFF" : "#000000";
  const secondaryText = T.isDark
    ? "rgba(255,255,255,0.75)"
    : "rgba(15,23,42,0.75)";
  const mutedTextColor = T.isDark
    ? "rgba(255,255,255,0.55)"
    : "rgba(15,23,42,0.55)";
  const dangerText = T.isDark ? "#ff6b6b" : "#e11d48";
  const tabUnderlineColor = T.isDark ? "#00bfff" : "#1834ae";
  const websiteColor = T.isDark ? "#00bfff" : "#1834ae";
  const totalUnread = socialMessageService
    .getConversations()
    .reduce((acc, c) => acc + c.unreadCount, 0);
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
      if (id === "follow") {
        sendFollowRequest("me", profile.userId);
      } else if (id === "message") Alert.alert("", t("message"));
      else if (id === "shareProfile") Alert.alert("", t("social.shareProfile"));
      else if (id === "blockUser") Alert.alert("", t("social.block"));
      else if (id === "reportUser") Alert.alert("", t("social.report"));
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
                {!!profile.bio && (
                  <Text style={[styles.baseText, { color: secondaryText }]}>{profile.bio}</Text>
                )}
                {!!profile.website && (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => profile.website && Linking.openURL(profile.website)}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons
                        name="globe-outline"
                        size={14}
                        color={websiteColor}
                      />
                      <Text style={[styles.baseText, { color: websiteColor }]}>
                        {profile.website}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.profileFacts}>
                {/* KONUM */}
                <View style={[styles.factRow, { marginLeft: "auto", marginRight: 0 }]}>
                  <Text style={[styles.baseText, { color: primaryText }]}>
                    📍 {profile.location || "Konum eklenmedi"}
                  </Text>
                </View>

                {/* EĞİTİM */}
                <View style={[styles.factRow, { marginLeft: "auto", marginRight: 0 }]}>
                  <Text style={[styles.baseText, { color: primaryText }]}>
                    🎓 {profile.education || "Eğitim eklenmedi"}
                  </Text>
                </View>

                {/* MESLEK */}
                <View style={[styles.factRow, { marginLeft: "auto", marginRight: 0 }]}>
                  <Text style={[styles.baseText, { color: primaryText }]}>
                    💼 {profile.job || "Meslek eklenmedi"}
                  </Text>
                </View>

                {/* TAKİPÇİ */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.factRow, { marginLeft: "auto", marginRight: 0 }]}
                  onPress={() =>
                    navigation.navigate("SocialFollowList", {
                      userId: profile.userId,
                      type: "followers",
                    })
                  }
                >
                  <Text style={[styles.baseText, { color: primaryText }]}>
                    👤 Takipçi {stats.followers}
                  </Text>
                </TouchableOpacity>

                {/* ORTAK ARKADAŞ */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.factRow, { marginLeft: "auto", marginRight: 0 }]}
                  onPress={() =>
                    navigation.navigate("SocialFollowList", {
                      userId: profile.userId,
                      type: "mutual",
                    })
                  }
                >
                  <Text style={[styles.baseText, { color: primaryText }]}>
                    👥 Ortak Arkadaşlar {mutualConnections}
                  </Text>
                </TouchableOpacity>
              </View>

              {!isOwner && (
                <View style={[styles.actionsRow, { marginLeft: "auto", marginRight: -16 }]}>
                  {!following && !blocked && (
                    <TouchableOpacity
                      activeOpacity={0.6}
                      style={styles.textAction}
                      onPress={handleFollow}
                    >
                      <Text style={[styles.baseText, { color: primaryText }]}>{t("follow")}</Text>
                    </TouchableOpacity>
                  )}

                  {following && !blocked && (
                    <TouchableOpacity
                      activeOpacity={0.6}
                      style={styles.textAction}
                      onPress={handleFollow}
                    >
                      <Text style={[styles.baseText, { color: primaryText }]}>{t("following")}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.textAction}
                    onPress={() => {
                      blockUser(profile.userId);
                      Alert.alert("", t("social.userBlocked"));
                    }}
                  >
                    <Text style={[styles.baseText, { color: dangerText }]}>{t("social.block")}</Text>
                  </TouchableOpacity>
                </View>
              )}

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
            tabUnderlineColor={tabUnderlineColor}
          />
          <TabBtn
            label={`Videolar ${videoPosts.length}`}
            active={tab === "videos"}
            onPress={() => setTab("videos")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
            tabUnderlineColor={tabUnderlineColor}
          />
          <TabBtn
            label={`Etkinlikler ${userEvents.length}`}
            active={tab === "events"}
            onPress={() => setTab("events")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
            tabUnderlineColor={tabUnderlineColor}
          />
          <TabBtn
            label={`Kaydedilenler ${savedPosts.length}`}
            active={tab === "saved"}
            onPress={() => setTab("saved")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
            tabUnderlineColor={tabUnderlineColor}
          />
          <TabBtn
            label="Paylaşım Yap"
            active={false}
            onPress={() =>
              isOwner
                ? navigation.navigate("SocialCreatePost")
                : handleVisitorAction("shareProfile")
            }
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
            tabUnderlineColor={tabUnderlineColor}
          />
          <TabBtn
            label="Etkinlik Oluştur"
            active={false}
            onPress={() => navigation.navigate("SocialCreateEvent")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
            tabUnderlineColor={tabUnderlineColor}
          />
          <TabBtn
            label={
              totalUnread > 0
                ? `${t("messages")} (${totalUnread > 99 ? "99+" : totalUnread})`
                : t("messages")
            }
            active={false}
            onPress={() => navigation.navigate("SocialInboxScreen")}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
            tabUnderlineColor={tabUnderlineColor}
          />
          <TabBtn
            label="Profili Düzenle"
            active={false}
            onPress={() => (isOwner ? handleOwnerAction("editProfile") : undefined)}
            activeColor={primaryText}
            inactiveColor={mutedTextColor}
            tabUnderlineColor={tabUnderlineColor}
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
      const handleOpenPost = () => {
        const ref = itemRefs.current[item.id];
        if (!ref || typeof ref.measureInWindow !== "function") {
          navigation.navigate("SocialPostDetail", { postId: item.id });
          return;
        }
        ref.measureInWindow((x: number, y: number, width: number, height: number) => {
          navigation.navigate("SocialPostDetail", {
            postId: item.id,
            origin: { x, y, width, height },
          });
        });
      };
      return (
        <TouchableOpacity
          ref={(ref) => {
            if (ref) itemRefs.current[item.id] = ref;
          }}
          style={[styles.gridItem, { backgroundColor: T.cardBg }]}
          activeOpacity={0.9}
          onPress={handleOpenPost}
          onLongPress={() => Alert.alert(t("social.postOptions"))}
        >
          {media?.uri ? (
            <>
              <Image source={{ uri: media.uri }} style={styles.gridImg} />
              {media.type === "video" && (
                <View style={styles.videoBadge}>
                  <Ionicons name="videocam" size={12} color="#fff" />
                </View>
              )}
            </>
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
                  isFollowing={socialFollowService.isFollowing(currentUserId, user.userId)}
                  onFollow={() => {
                    if (socialFollowService.isFollowing(currentUserId, user.userId)) {
                      socialFollowService.unfollow(currentUserId, user.userId);
                    } else {
                      socialFollowService.follow(currentUserId, user.userId);
                    }
                    setFollowTick((prev) => prev + 1);
                  }}
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
    [T, profileSuggested, navigation, currentUserId, followTick]
  );

  const EmptyGrid = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={40} color={T.mutedText} />
        <Text style={[styles.emptyStateText, { color: T.mutedText }]}>{t("no_posts")}</Text>
      </View>
    ),
    [T.mutedText]
  );

  if (!isOwner && blocked) {
    return (
      <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
        <View style={styles.blockedStateRoot}>
          {navigation.canGoBack() ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={styles.blockedBackBtn}
            >
              <Ionicons name="chevron-back" size={26} color={T.textColor} />
            </TouchableOpacity>
          ) : null}
          <Ionicons name="ban-outline" size={52} color={mutedTextColor} />
          <Text style={[styles.blockedStateTitle, { color: T.textColor }]}>
            Bu kullanıcı engellendi
          </Text>
          <Text style={[styles.blockedStateSub, { color: mutedTextColor }]}>
            @{profile.username}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.blockedPrimaryBtn, { borderColor: T.border }]}
            onPress={() => {
              unblockUser(profile.userId);
              setBlocked(false);
              Alert.alert("", t("social.unblockSuccess"));
            }}
          >
            <Text style={[styles.blockedPrimaryBtnText, { color: primaryText }]}>
              Engeli Kaldır
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      {isEventsTab ? (
        <FlatList
          data={userEvents}
          keyExtractor={keyExtractorEvent}
          numColumns={3}
          ListHeaderComponent={Header}
          ListFooterComponent={SuggestedFooter}
          ListEmptyComponent={EmptyGrid}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
        />
      ) : (
        <FlatList
          data={postData}
          keyExtractor={keyExtractorPost}
          numColumns={3}
          ListHeaderComponent={Header}
          ListFooterComponent={SuggestedFooter}
          ListEmptyComponent={EmptyGrid}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
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
  tabUnderlineColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  tabUnderlineColor: string;
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
      {active && (
        <View
          style={[
            styles.tabUnderline,
            { backgroundColor: tabUnderlineColor },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { paddingBottom: -6 },
  blockedStateRoot: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  blockedBackBtn: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 2,
  },
  blockedStateTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 20,
    textAlign: "center",
  },
  blockedStateSub: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  blockedPrimaryBtn: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
  },
  blockedPrimaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  headerContainer: {
    paddingBottom: 8,
  },
  tabContainer: {
    paddingBottom: 8,
  },
  profileCard: {
    paddingHorizontal: 18,
    paddingTop: 10,
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
     alignItems: "flex-start",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 16 },
  profileFacts: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    width: "100%",
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 26,
  },
  identityBlock: {
    marginTop: 10,
    gap: 4,
    width: "100%",
  },
  baseText: {
    fontSize: 12.8,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.24,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 43,
    flexWrap: "nowrap",
    justifyContent: "flex-end",
  },
  textAction: {
    marginRight: 8,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 2,
    paddingBottom: 0,
    flexWrap: "nowrap",
    alignItems: "center",
  },
  tabBtn: {
    paddingVertical: 6,
    marginRight: 18,
    alignItems: "flex-start",
    justifyContent: "center",
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  tabUnderline: {
    marginTop: 2,
    height: 1.5,
    borderRadius: 2,
    alignSelf: "flex-start",
    width: "100%",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.22,
  },
  listContent: { paddingBottom: 60, flexGrow: 1 },
  gridItem: {
    width: "33.3333%",
    aspectRatio: 1,
    padding: 1,
  },
  gridImg: { width: "100%", height: "100%" },
  gridPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyStateText: {
    marginTop: 10,
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
