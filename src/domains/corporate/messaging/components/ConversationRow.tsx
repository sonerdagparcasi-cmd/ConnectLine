import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { CorporateConversation } from "../types/messaging.types";

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function formatTime(ts: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

type Props = {
  item: CorporateConversation;
  onPress: () => void;
};

export default function ConversationRow({ item, onPress }: Props) {
  const T = useAppTheme();

  const hasUnread = item.unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.row,
        {
          borderBottomColor: T.border,
          backgroundColor: T.backgroundColor,
        },
      ]}
    >
      {/* Left / Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: T.textColor },
          ]}
          numberOfLines={1}
        >
          {item.candidateName}
        </Text>

        <Text
          style={[
            styles.preview,
            { color: T.mutedText },
          ]}
          numberOfLines={1}
        >
          {item.lastMessageText ?? "—"}
        </Text>
      </View>

      {/* Right / Meta */}
      <View style={styles.meta}>
        <Text style={[styles.time, { color: T.mutedText }]}>
          {formatTime(item.lastMessageAt)}
        </Text>

        {hasUnread && (
          <View
            style={[
              styles.badge,
              { backgroundColor: T.accent },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
  },
  preview: {
    fontSize: 13,
  },
  meta: {
    alignItems: "flex-end",
    gap: 6,
  },
  time: {
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
});