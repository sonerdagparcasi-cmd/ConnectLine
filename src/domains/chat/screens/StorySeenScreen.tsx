// src/domains/chat/screens/StorySeenScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { storySeenService } from "../story/storySeenService";

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / (1000 * 60));
  if (m < 1) return t("chat.story.timeAgo.justNow");
  if (m < 60) return t("chat.story.timeAgo.minAgo").replace("{{count}}", String(m));
  const h = Math.floor(m / 60);
  if (h === 1) return t("chat.story.timeAgo.hourAgo");
  return t("chat.story.timeAgo.hoursAgo").replace("{{count}}", String(h));
}

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function StorySeenScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const storyId: string = route.params?.storyId;
  const seen = storySeenService.getSeen(storyId);

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="eye" size={18} color={T.textColor} />
        <Text style={[styles.title, { color: T.textColor }]}>
          {t("chat.story.viewersTitle")}
        </Text>

        <View style={[styles.countPill, { borderColor: T.border }]}>
          <Text style={[styles.countText, { color: T.textColor }]}>
            {seen.length}
          </Text>
        </View>
      </View>

      {/* LIST / EMPTY */}
      {seen.length === 0 ? (
        <View style={[styles.emptyWrap, { borderColor: T.border }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: T.cardBg }]}>
            <Ionicons name="eye-outline" size={56} color={T.mutedText} />
          </View>
          <Text style={[styles.emptyText, { color: T.mutedText }]}>
            {t("chat.story.viewersEmpty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={seen}
          keyExtractor={(i) => i.userId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              navigation.navigate("ChatProfile", { userId: item.userId });
            }}
            style={[styles.row, { borderColor: T.border }]}
          >
            {/* AVATAR CIRCLE: image or first letter */}
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: item.avatarUri ? T.cardBg : T.accent,
                  borderColor: T.border,
                },
              ]}
            >
              {item.avatarUri ? (
                <Image source={{ uri: item.avatarUri }} style={styles.avatarImg} />
              ) : (
                <Text
                  style={[styles.avatarLetter, { color: T.cardBg }]}
                  numberOfLines={1}
                >
                  {(item.userName || "?").charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            {/* USERNAME + SEEN TIME */}
            <View style={styles.info}>
              <Text
                style={[styles.name, { color: T.textColor }]}
                numberOfLines={1}
              >
                {item.userName}
              </Text>
              <Text style={[styles.meta, { color: T.mutedText }]}>
                {timeAgo(item.seenAt)}
              </Text>
            </View>

            <Ionicons name="checkmark-done" size={18} color={T.accent} />
          </TouchableOpacity>
        )}
        />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
  },

  title: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },

  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },

  countText: {
    fontSize: 12,
    fontWeight: "900",
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },

  /* ROW */

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: "800",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});