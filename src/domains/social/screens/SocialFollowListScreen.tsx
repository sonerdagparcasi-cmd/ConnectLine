// src/domains/social/screens/SocialFollowListScreen.tsx
// Takipçi / ortak arkadaş listesi (FlatList + follow)

import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialScreenLayout from "../components/SocialScreenLayout";
import { useSocialProfile } from "../hooks/useSocialProfile";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import {
  getFollowers,
  getMutualConnectionUsers,
  isFollowing,
  subscribeFollow,
  toggleFollow,
} from "../services/socialFollowService";
import { getUserDisplay } from "../story/services/socialStoryStateService";

type Nav = NativeStackNavigationProp<SocialStackParamList>;
type FollowListRoute = RouteProp<SocialStackParamList, "SocialFollowList">;

type RowUser = { userId: string; username: string };

function loadUsers(userId: string, type: "followers" | "mutual"): RowUser[] {
  if (type === "mutual") {
    return getMutualConnectionUsers(userId);
  }
  return getFollowers(userId);
}

export default function SocialFollowListScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<FollowListRoute>();
  const { profile: meProfile } = useSocialProfile();

  const userId = route.params?.userId ?? meProfile.userId;
  const type = route.params?.type ?? "followers";

  const [users, setUsers] = useState<RowUser[]>(() => loadUsers(userId, type));

  useEffect(() => {
    setUsers(loadUsers(userId, type));
  }, [userId, type]);

  useEffect(() => {
    const unsub = subscribeFollow(() => {
      setUsers(loadUsers(userId, type));
    });
    return unsub;
  }, [userId, type]);

  const title = useMemo(
    () => (type === "mutual" ? t("social.mutualConnections") : t("social.followers")),
    [type]
  );

  const openProfile = useCallback(
    (uid: string) => {
      navigation.navigate("SocialProfileContainer", { userId: uid });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: RowUser }) => {
      const display = getUserDisplay(item.userId);
      const username = display.username || item.username;
      const following = isFollowing(item.userId);
      const isSelf = item.userId === meProfile.userId;

      return (
        <View style={[styles.row, { borderBottomColor: T.border }]}>
          <TouchableOpacity
            style={styles.rowMain}
            activeOpacity={0.7}
            onPress={() => openProfile(item.userId)}
          >
            {display.avatarUri ? (
              <Image source={{ uri: display.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: T.cardBg }]}>
                <Text style={{ color: T.mutedText }}>👤</Text>
              </View>
            )}
            <Text style={[styles.username, { color: T.textColor }]} numberOfLines={1}>
              {username}
            </Text>
          </TouchableOpacity>

          {!isSelf ? (
            <TouchableOpacity
              activeOpacity={0.65}
              style={[styles.followBtn, { borderColor: T.border }]}
              onPress={() => toggleFollow(item.userId)}
            >
              <Text style={[styles.followBtnText, { color: T.accent }]}>
                {following ? t("social.following") : t("social.follow")}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.followBtnPlaceholder} />
          )}
        </View>
      );
    },
    [T, meProfile.userId, openProfile]
  );

  const keyExtractor = useCallback((item: RowUser) => item.userId, []);

  const empty = users.length === 0;

  if (empty) {
    return (
      <SocialScreenLayout title={title}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: T.mutedText }]}>
            {type === "mutual" ? t("social.empty.mutualConnections") : t("social.empty.followers")}
          </Text>
        </View>
      </SocialScreenLayout>
    );
  }

  return (
    <SocialScreenLayout title={title} scroll={false}>
      <FlatList
        data={users}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={16}
      />
    </SocialScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  followBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  followBtnPlaceholder: {
    minWidth: 88,
  },
  emptyWrap: {
    paddingTop: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
