// src/domains/social/components/SocialEventFeedCard.tsx
// 🔒 SOCIAL EVENT FEED CARD – STABLE
// FEATURES:
// - event null guard
// - cover image support
// - joined badge
// - participant count
// - theme safe
// - navigation safe

import { useNavigation } from "@react-navigation/native";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

export default function SocialEventFeedCard({ post }: any) {

  const T = useAppTheme();
  const navigation = useNavigation<any>();

  const e = post?.event;

  if (!e) return null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: T.cardBg,
          borderColor: T.border,
        },
      ]}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("SocialEventDetail", {
          eventId: e.id,
        })
      }
    >

      {/* COVER */}

      {e.coverImage && (
        <Image
          source={{ uri: e.coverImage }}
          style={styles.cover}
        />
      )}

      {/* CONTENT */}

      <View style={styles.content}>

        <Text
          style={[styles.title, { color: T.textColor }]}
          numberOfLines={2}
        >
          📅 {e.title}
        </Text>

        <Text style={[styles.meta, { color: T.mutedText }]}>
          {e.date} · {e.location}
        </Text>

        <Text style={{ fontSize: 10, color: "#00bfff" }}>🔥 Trend</Text>

        {/* PARTICIPANTS */}

        <View style={styles.bottomRow}>
          <Text style={{ fontSize: 12, opacity: 0.6, color: T.mutedText }}>
            {(e.participants?.length ?? e.participantCount ?? 0)} kişi katıldı
          </Text>

          {e.joinedByMe && (
            <View
              style={[
                styles.joinedBadge,
                { backgroundColor: T.accent },
              ]}
            >
              <Text style={styles.joinedText}>
                Katılıyorum
              </Text>
            </View>
          )}

        </View>

      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  card: {
    margin: 12,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },

  cover: {
    width: "100%",
    height: 200,
  },

  content: {
    padding: 12,
  },

  title: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 6,
  },

  meta: {
    fontSize: 13,
    marginBottom: 8,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  joinedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  joinedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

});