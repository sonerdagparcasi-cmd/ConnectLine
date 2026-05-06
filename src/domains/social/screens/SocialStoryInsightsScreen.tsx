// src/domains/social/screens/SocialStoryInsightsScreen.tsx
// FAZ 3 – Who viewed, who reacted, who replied (owner only)

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import {
  getStories,
  getStoryViewers,
} from "../services/socialStoryStateService";
import { getStoryReplies } from "../services/socialStoryReplyService";
import { getCurrentSocialUserId } from "../services/socialFollowService";

type Route = RouteProp<SocialStackParamList, "SocialStoryInsights">;

export default function SocialStoryInsightsScreen() {
  const T = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { storyId } = route.params;

  const story = useMemo(
    () => getStories().find((s) => s.id === storyId),
    [storyId]
  );
  const currentUserId = getCurrentSocialUserId();
  const isOwner = story?.userId === currentUserId;

  const viewers = useMemo(() => getStoryViewers(storyId), [storyId]);
  const replies = useMemo(() => getStoryReplies(storyId), [storyId]);
  const reactions = useMemo(
    () => replies.filter((r) => r.type === "reaction"),
    [replies]
  );
  const messages = useMemo(
    () => replies.filter((r) => r.type === "message"),
    [replies]
  );

  if (!isOwner) {
    return (
      <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
        <AppGradientHeader
          title={t("social.storyInsights")}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.centered}>
          <Text style={{ color: T.mutedText }}>
            {t("social.storyInsights")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title={t("social.story.viewersTitle")}
        onBack={() => navigation.goBack()}
      />

      {/* WHO VIEWED */}
      <View style={[styles.section, { borderBottomColor: T.border }]}>
        <Text style={[styles.sectionTitle, { color: T.textColor }]}>
          {t("social.viewers")} ({viewers.length})
        </Text>
        {viewers.length === 0 ? (
          <Text style={[styles.empty, { color: T.mutedText }]}>
            —
          </Text>
        ) : (
          <FlatList
            data={viewers}
            keyExtractor={(v) => v.userId}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.viewerRow, { borderBottomColor: T.border }]}>
                <Ionicons name="person-circle" size={36} color={T.textColor} />
                <Text style={[styles.viewerName, { color: T.textColor }]}>
                  {item.username}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* WHO REACTED */}
      <View style={[styles.section, { borderBottomColor: T.border }]}>
        <Text style={[styles.sectionTitle, { color: T.textColor }]}>
          {t("social.react")} ({reactions.length})
        </Text>
        {reactions.length === 0 ? (
          <Text style={[styles.empty, { color: T.mutedText }]}>—</Text>
        ) : (
          <FlatList
            data={reactions}
            keyExtractor={(r) => r.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.viewerRow, { borderBottomColor: T.border }]}>
                <Text style={styles.emoji}>{item.reaction ?? "❤️"}</Text>
                <Text style={[styles.viewerName, { color: T.textColor }]}>
                  {item.senderUsername}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* WHO REPLIED */}
      <View style={[styles.section, { borderBottomColor: T.border }]}>
        <Text style={[styles.sectionTitle, { color: T.textColor }]}>
          {t("social.reply")} ({messages.length})
        </Text>
        {messages.length === 0 ? (
          <Text style={[styles.empty, { color: T.mutedText }]}>—</Text>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(r) => r.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.viewerRow, { borderBottomColor: T.border }]}>
                <Ionicons name="chatbubble" size={20} color={T.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.viewerName, { color: T.textColor }]}>
                    {item.senderUsername}
                  </Text>
                  <Text style={[styles.replyText, { color: T.mutedText }]}>
                    {item.message}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  empty: { fontSize: 13, marginTop: 4 },
  viewerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  viewerName: { fontSize: 14, fontWeight: "600" },
  replyText: { fontSize: 13, marginTop: 2 },
  emoji: { fontSize: 24 },
});
