// src/domains/social/screens/SocialNotificationsScreen.tsx
// FAZ 5 – read/unread, avatar, time ago, navigation by type, theme, mark all read

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

import type { SocialStackParamList } from "../navigation/SocialNavigator";

import SocialScreenLayout from "../components/SocialScreenLayout";

import { getPostById } from "../services/socialFeedStateService";
import {
  applySocialNotificationNavigation,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from "../services/socialNotificationService";

import type { SocialNotification, SocialNotificationType } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

function getNotificationIcon(type: SocialNotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "like":
      return "heart";
    case "follow":
      return "person-add";
    case "follow_request":
      return "mail-unread-outline";
    case "comment":
      return "chatbubble";
    case "share":
      return "share-social";
    case "story_reply":
    case "story_reaction":
      return "chatbubble-ellipses";
    case "event_invite":
      return "calendar";
    default:
      return "notifications";
  }
}

function timeAgo(createdAt: string): string {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return t("social.time.now");
  const min = Math.floor(diffSec / 60);
  if (min < 60) return t("social.time.minAgo").replace("{{m}}", String(min));
  const hour = Math.floor(min / 60);
  if (hour < 24) return t("social.time.hourAgo").replace("{{h}}", String(hour));
  const day = Math.floor(hour / 24);
  return t("social.time.dayAgo").replace("{{d}}", String(day));
}

type RowProps = {
  item: SocialNotification;
  T: ReturnType<typeof useAppTheme>;
  onPress: () => void;
};

const NotificationRow = React.memo(function NotificationRow({
  item,
  T,
  onPress,
}: RowProps) {
  const iconName = getNotificationIcon(item.type);
  const post = item.postId ? getPostById(item.postId) : null;
  const captionPreview = post?.caption?.slice(0, 40);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.item,
        {
          backgroundColor: item.read ? "transparent" : T.accent + "18",
        },
      ]}
    >
      <View style={[styles.avatarWrap, { backgroundColor: T.cardBg, borderColor: T.border }]}>
        {item.actorAvatarUri ? (
          <Image source={{ uri: item.actorAvatarUri }} style={styles.avatarImg} />
        ) : (
          <Ionicons name="person" size={18} color={T.mutedText} />
        )}
      </View>

      <View style={styles.textWrap}>
        <Text style={[styles.username, { color: T.textColor }]} numberOfLines={1}>
          {item.actorUsername || item.actorUserId}
        </Text>
        <Text style={[styles.text, { color: T.mutedText }]} numberOfLines={2}>
          {item.text}
        </Text>
        {captionPreview != null && captionPreview.length > 0 && (
          <Text style={[styles.preview, { color: T.mutedText }]} numberOfLines={1}>
            {captionPreview}…
          </Text>
        )}
        <Text style={[styles.time, { color: T.mutedText }]}>
          {timeAgo(item.createdAt)}
        </Text>
      </View>

      <View style={[styles.iconWrap, { backgroundColor: T.cardBg }]}>
        <Ionicons name={iconName} size={18} color={T.accent} />
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: T.accent }]} />}
    </TouchableOpacity>
  );
});

export default function SocialNotificationsScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
    const unsub = subscribeNotifications(() => setNotifications(getNotifications()));
    return unsub;
  }, []);

  const unreadCount = useMemo(() => getUnreadNotificationCount(), [notifications]);

  const openNotification = useCallback(
    (n: SocialNotification) => {
      markNotificationRead(n.id);

      if (
        applySocialNotificationNavigation(n, (screen, params) => {
          (navigation as { navigate: (s: string, p?: object) => void }).navigate(
            screen,
            params
          );
        })
      ) {
        return;
      }

      if (n.postId) {
        navigation.navigate("SocialPostDetail", { postId: n.postId });
        return;
      }
      if (n.storyId) {
        navigation.navigate("SocialStoryViewer", { initialUserId: n.targetUserId });
        return;
      }
      if (n.eventId) {
        navigation.navigate("SocialEventDetail", { eventId: n.eventId });
        return;
      }
      const profileUserId = n.actorUserId || n.targetUserId;
      if (profileUserId) {
        navigation.navigate("SocialProfileContainer", { userId: profileUserId });
      }
    },
    [navigation]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SocialNotification }) => (
      <NotificationRow item={item} T={T} onPress={() => openNotification(item)} />
    ),
    [T, openNotification]
  );

  const ListHeader = useCallback(
    () =>
      unreadCount > 0 ? (
        <TouchableOpacity
          onPress={handleMarkAllRead}
          style={[styles.markAllBtn, { borderBottomColor: T.border }]}
        >
          <Text style={[styles.markAllText, { color: T.accent }]}>
            {t("social.markAsRead")}
          </Text>
        </TouchableOpacity>
      ) : null,
    [unreadCount, handleMarkAllRead, T]
  );

  if (notifications.length === 0) {
    return (
      <SocialScreenLayout title={t("social.notifications")}>
        <View style={[styles.emptyRoot, { backgroundColor: T.backgroundColor }]}>
          <Ionicons name="notifications-outline" size={48} color={T.mutedText} />
          <Text style={[styles.emptyTitle, { color: T.textColor }]}>
            {t("social.notifications")}
          </Text>
          <Text style={[styles.emptyText, { color: T.mutedText }]}>
            {t("social.empty.notifications")}
          </Text>
        </View>
      </SocialScreenLayout>
    );
  }

  return (
    <SocialScreenLayout title={t("social.notifications")} scroll={false}>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={6}
      />
    </SocialScreenLayout>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  textWrap: { flex: 1, minWidth: 0 },
  username: { fontWeight: "700", fontSize: 14 },
  text: { fontSize: 13, marginTop: 2 },
  preview: { fontSize: 12, marginTop: 2, fontStyle: "italic" },
  time: { fontSize: 11, marginTop: 4 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  markAllBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: "flex-end",
  },
  markAllText: { fontSize: 13, fontWeight: "700" },
  emptyRoot: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginTop: 12 },
  emptyText: { fontSize: 14, marginTop: 6, textAlign: "center" },
});
