// src/domains/store/components/ReviewCard.tsx
// 🔒 REVIEW CARD – STABLE / ICON LANGUAGE

import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreReview } from "../types/storeReview.types";

export default function ReviewCard({ item }: { item: StoreReview }) {
  const T = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {/* HEADER */}
      <View style={styles.row}>
        <Text style={[styles.author, { color: T.textColor }]}>
          {item.authorName}
        </Text>

        <Text style={[styles.rating, { color: T.accent }]}>
          {renderStars(item.rating)}
        </Text>
      </View>

      {/* TITLE */}
      {!!item.title && (
        <Text style={[styles.title, { color: T.textColor }]}>
          {item.title}
        </Text>
      )}

      {/* COMMENT */}
      <Text style={[styles.comment, { color: T.mutedText }]}>
        {item.comment}
      </Text>

      {/* DATE */}
      <Text style={[styles.date, { color: T.mutedText }]}>
        🕒 {new Date(item.createdAt).toLocaleString()}
      </Text>

      {/* SELLER REPLY */}
      {!!item.sellerReply?.text && (
        <View
          style={[
            styles.replyBox,
            { borderColor: T.border },
          ]}
        >
          <Text
            style={[
              styles.replyTitle,
              { color: T.textColor },
            ]}
          >
            🛍 Satıcı Yanıtı
          </Text>

          <Text
            style={[
              styles.replyText,
              { color: T.mutedText },
            ]}
          >
            {item.sellerReply.text}
          </Text>

          <Text
            style={[
              styles.replyDate,
              { color: T.mutedText },
            ]}
          >
            🕒 {new Date(item.sellerReply.repliedAt).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
}

function renderStars(rating: number) {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));

  const full = "⭐".repeat(safe);
  const empty = "☆".repeat(5 - safe);

  return `${full}${empty}`;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  author: {
    fontSize: 13,
    fontWeight: "900",
  },

  rating: {
    fontSize: 13,
    fontWeight: "900",
  },

  title: {
    fontSize: 12,
    fontWeight: "900",
  },

  comment: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },

  date: {
    fontSize: 11,
    fontWeight: "800",
  },

  replyBox: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },

  replyTitle: {
    fontSize: 12,
    fontWeight: "900",
  },

  replyText: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },

  replyDate: {
    fontSize: 11,
    fontWeight: "800",
  },
});