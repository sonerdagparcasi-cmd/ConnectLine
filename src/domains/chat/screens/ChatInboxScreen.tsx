// src/domains/chat/screens/ChatInboxScreen.tsx
// Optimized chat list: avatar, last message, unread badge, typing, pinned, archived

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
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
import { getColors } from "../../../shared/theme/colors";
import ChatEmptyState from "../components/ChatEmptyState";
import { InboxRowSkeleton } from "../components/InboxRowSkeleton";
import IncomingCallBanner from "../components/IncomingCallBanner";
import { INBOX_FLATLIST } from "../config/flatListConfig";
import { useChatList } from "../hooks/useChatList";
import { useChatPresence } from "../hooks/useChatPresence";
import { useChatSettings } from "../hooks/useChatSettings";
import { useInboxTypingSimulation } from "../hooks/useInboxTypingSimulation";
import { ChatStackParamList } from "../navigation/ChatNavigator";
import { useChatProfile } from "../profile/useChatProfile";
import StoryRail from "../story/ui/StoryRail";
import { useChatStories } from "../story/useChatStories";
import type { Chat } from "../types/chat.types";
import { formatLastSeen, formatLastSeenLabel } from "../utils/formatLastSeen";

type NavProp = NativeStackNavigationProp<ChatStackParamList, "ChatList">;

type InboxChat = Chat & {
  isPinned?: boolean;
  isArchived?: boolean;
  isTyping?: boolean;
  avatarUri?: string;
};

const MOCK_PINNED_IDS = new Set<string>(["1"]);
const MOCK_ARCHIVED: InboxChat[] = [];

function ChatInboxRow({
  item,
  isTyping,
  onPress,
  T,
}: {
  item: InboxChat;
  isTyping: boolean;
  onPress: () => void;
  T: ReturnType<typeof useAppTheme>;
}) {
  const C = getColors(T.isDark);
  const peerId =
    item.type === "direct"
      ? item.participantIds?.find((id) => id !== "me")
      : undefined;

  const presence = useChatPresence(peerId);
  const { settings } = useChatSettings();

  const presenceLabel =
    !peerId || item.type !== "direct"
      ? ""
      : settings.showOnline && presence.isOnline
      ? t("chat.presence.online")
      : settings.showLastSeen && presence.lastSeenAt > 0
      ? formatLastSeenLabel(formatLastSeen(presence.lastSeenAt), t)
      : "";

  const title = item.title ?? (item.type === "group" ? "Group" : "Chat");
  const previewFontSize = settings.fontSize === "small" ? 13 : settings.fontSize === "large" ? 15 : 14;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.row, { backgroundColor: T.cardBg, borderColor: T.border }]}
    >
      <View style={styles.left}>
        <View style={[styles.avatarWrap, { borderColor: T.border }]}>
          {item.avatarUri ? (
            <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
          ) : (
            <Ionicons
              name={item.type === "group" ? "people" : "person"}
              size={20}
              color={T.textColor}
            />
          )}

          {item.type === "direct" &&
            peerId &&
            settings.showOnline &&
            presence.isOnline && (
              <View
                style={[
                  styles.onlineDot,
                  { backgroundColor: T.accent, borderColor: T.cardBg },
                ]}
              />
            )}
        </View>

        <View style={styles.textWrap}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: T.textColor }]} numberOfLines={1}>
              {title}
            </Text>

            {presenceLabel ? (
              <Text
                style={[styles.presenceLabel, { color: T.mutedText }]}
                numberOfLines={1}
              >
                {" · " + presenceLabel}
              </Text>
            ) : null}
          </View>

          {isTyping ? (
            <Text style={[styles.preview, { color: T.accent, fontSize: previewFontSize }]} numberOfLines={1}>
              {t("chat.inbox.typing")}
            </Text>
          ) : (
            <Text style={[styles.preview, { color: T.mutedText, fontSize: previewFontSize }]} numberOfLines={1}>
              {getLastMessagePreview(item)}
            </Text>
          )}
        </View>
      </View>

      {item.unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: T.accent }]}>
          <Text style={[styles.badgeText, { color: C.buttonText }]}>
            {item.unreadCount > 99 ? "99+" : item.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function getLastMessagePreview(chat: Chat): string {
  if (chat.lastMessage?.content) return chat.lastMessage.content;
  return "—";
}

const INBOX_SKELETON_COUNT = 5;
const LOADING_DELAY_MS = 350;

export default function ChatInboxScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();
  const { chats } = useChatList();
  const { profile } = useChatProfile();
  const { others, isSeenGroup } = useChatStories();

  const currentUserId = "me";

  const avatarUri =
    profile?.avatarUri || "https://i.pravatar.cc/200?img=12";
  const userName = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n: string, i: number) => (i === 0 ? n : n[0]))
        .join(" ")
    : "User";

  const storyUsers = useMemo(() => {
    const me = {
      id: "me",
      userId: "me",
      ownerId: "me",
      name: userName,
      image: avatarUri,
      seen: true,
    };

    const items = others.map((g) => ({
      id: g.ownerId,
      userId: g.ownerId,
      ownerId: g.ownerId,
      name: g.ownerName,
      image: `https://i.pravatar.cc/200?u=${encodeURIComponent(g.ownerId)}`,
      seen: isSeenGroup(g),
    }));

    const withoutMe = items.filter((i) => i.ownerId !== "me");
    return [me, ...withoutMe];
  }, [avatarUri, isSeenGroup, others, userName]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), LOADING_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const inboxChats: InboxChat[] = useMemo(() => {
    return chats.map((c) => ({
      ...c,
      isPinned: MOCK_PINNED_IDS.has(c.id),
      isArchived: false,
      avatarUri: undefined,
    }));
  }, [chats]);

  const pinnedChats = useMemo(
    () => inboxChats.filter((c) => c.isPinned),
    [inboxChats]
  );

  const normalChats = useMemo(
    () => inboxChats.filter((c) => !c.isPinned && !c.isArchived),
    [inboxChats]
  );

  const archivedChats = useMemo(
    () => [...inboxChats.filter((c) => c.isArchived), ...MOCK_ARCHIVED],
    [inboxChats]
  );

  const typingChatId = useInboxTypingSimulation(normalChats.map((c) => c.id));

  const gradientColors = useMemo<[string, string]>(
    () => (T.isDark ? [...T.darkGradient.colors] : [...T.lightGradient.colors]),
    [T.isDark, T.darkGradient.colors, T.lightGradient.colors]
  );

  const renderChatItem = useCallback(
    ({ item }: { item: InboxChat }) => (
      <ChatInboxRow
        item={item}
        isTyping={typingChatId === item.id}
        onPress={() => navigation.navigate("ChatRoom", { chatId: item.id })}
        T={T}
      />
    ),
    [T, navigation, typingChatId]
  );

  const keyExtractor = useCallback((item: InboxChat) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <IncomingCallBanner />

      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <View style={styles.topRow}>
          <StoryRail stories={storyUsers} currentUserId={currentUserId} />

          <TouchableOpacity
            onPress={() => setMenuOpen((p) => !p)}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={18} color={T.textColor} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={loading ? [] : [...pinnedChats, ...normalChats]}
        keyExtractor={keyExtractor}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        windowSize={INBOX_FLATLIST.windowSize}
        maxToRenderPerBatch={INBOX_FLATLIST.maxToRenderPerBatch}
        initialNumToRender={INBOX_FLATLIST.initialNumToRender}
        removeClippedSubviews={INBOX_FLATLIST.removeClippedSubviews}
        ListHeaderComponent={
          !loading && pinnedChats.length > 0 ? (
            <View style={styles.chatHeaderRow}>
              <Text style={[styles.chatLabel, { color: T.textColor }]}>
                Sohbetler
              </Text>
              <Text style={[styles.pinnedLabel, { color: T.mutedText }]}>
                📌 Sabitlenenler
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonWrap}>
              {Array.from({ length: INBOX_SKELETON_COUNT }).map((_, i) => (
                <InboxRowSkeleton key={`sk-${i}`} />
              ))}
              <Text style={[styles.loadingLabel, { color: T.mutedText }]}>
                {t("chat.loading.chats")}
              </Text>
            </View>
          ) : (
            <ChatEmptyState
              icon="chatbubbles-outline"
              title={t("chat.inbox.noChats")}
              description={t("chat.inbox.emptyDesc")}
              actionLabel={t("chat.empty.startChat")}
              onAction={() =>
                navigation.navigate("ChatContacts", { mode: "single" })
              }
            />
          )
        }
      />

      {archivedChats.length > 0 && (
        <TouchableOpacity
          style={[styles.archivedRow, { borderColor: T.border }]}
          onPress={() => {}}
        >
          <Ionicons name="archive" size={20} color={T.mutedText} />
          <Text style={[styles.archivedText, { color: T.mutedText }]}>
            {t("chat.inbox.archived")} ({archivedChats.length})
          </Text>
        </TouchableOpacity>
      )}

      {menuOpen && (
  <LinearGradient
    colors={T.isDark ? T.darkGradient.colors : T.lightGradient.colors}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={[
      styles.menu,
      {
        borderColor: T.border,
        shadowColor: T.border,
      },
    ]}
    
  >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate("ChatContacts", { mode: "single" });
            }}
          >
            <Ionicons name="person" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>Yeni Sohbet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate("CreateGroup");
            }}
          >
            <Ionicons name="people" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>Grup Sohbet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate("ChatCalls");
            }}
          >
            <Ionicons name="call" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>{t("chat.call.title")}</Text>
          </TouchableOpacity>
       </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

 gradient: {
  paddingTop: 0,
  paddingBottom: 6,
},


  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: { fontSize: 22, fontWeight: "800" },

  addBtn: {
    position: "absolute",
    right: -14,
    bottom: -20,
    padding: 14,
  },

  chatHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },

  chatLabel: {
    fontSize: 18,
    fontWeight: "800",
  },

  pinnedLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  listContent: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 10,
  },

  skeletonWrap: { paddingTop: 8 },

  loadingLabel: { fontSize: 13, textAlign: "center", marginTop: 16 },

  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  sectionTitle: { fontSize: 12, fontWeight: "600" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },

  left: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },

  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },

  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },

  avatar: { width: "100%", height: "100%", borderRadius: 12 },

  textWrap: { flex: 1, minWidth: 0 },

  nameRow: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },

  name: { fontSize: 16, fontWeight: "700", marginBottom: 2, flexShrink: 0 },

  presenceLabel: { fontSize: 14, fontWeight: "500", flexShrink: 1 },

  preview: { fontSize: 14, fontWeight: "500" },

  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },

  badgeText: { fontSize: 12, fontWeight: "800" },

  empty: { paddingVertical: 32, alignItems: "center" },

  emptyText: { fontSize: 14 },

  archivedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },

  archivedText: { fontSize: 14, fontWeight: "600" },

  menu: {
    position: "absolute",
    right: 8,
    top: 95,
    borderRadius: 12,
    borderWidth: 2,
    width: 180,
    shadowColor: undefined,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
});