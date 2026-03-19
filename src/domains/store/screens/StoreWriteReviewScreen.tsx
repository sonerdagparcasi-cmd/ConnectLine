// src/domains/store/screens/StoreWriteReviewScreen.tsx
// 🔒 STORE WRITE REVIEW – STABLE

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreStackParamList } from "../navigation/StoreNavigator";
import { storeReviewService } from "../services/storeReviewService";

type R = RouteProp<StoreStackParamList, "StoreWriteReview">;

export default function StoreWriteReviewScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<R>();

  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("Kullanıcı");
  const [sending, setSending] = useState(false);

  const canSubmit = useMemo(
    () => comment.trim().length >= 8,
    [comment]
  );

  async function submit() {
    if (!canSubmit || sending) return;

    try {
      setSending(true);

      await storeReviewService.addReview({
        productId: params.productId,
        sellerId: params.sellerId,
        rating,
        title,
        comment,
        authorName,
      });

      nav.goBack();
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.titleText, { color: T.textColor }]}>
        Yorum Yaz
      </Text>

      {/* RATING */}

      <Text style={[styles.label, { color: T.mutedText }]}>Puan</Text>

      <View style={styles.pills}>
        {[1, 2, 3, 4, 5].map((n) => {
          const v = n as 1 | 2 | 3 | 4 | 5;
          const active = v === rating;

          return (
            <TouchableOpacity
              key={n}
              activeOpacity={0.9}
              onPress={() => setRating(v)}
              style={[
                styles.pill,
                {
                  borderColor: T.border,
                  backgroundColor: active ? T.cardBg : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: active ? T.textColor : T.mutedText,
                  fontWeight: "900",
                }}
              >
                ⭐ {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* AUTHOR */}

      <Text style={[styles.label, { color: T.mutedText }]}>Ad</Text>

      <TextInput
        value={authorName}
        onChangeText={setAuthorName}
        placeholder="Adın"
        placeholderTextColor={T.mutedText}
        autoCapitalize="words"
        style={[
          styles.input,
          { color: T.textColor, borderColor: T.border },
        ]}
      />

      {/* TITLE */}

      <Text style={[styles.label, { color: T.mutedText }]}>
        Başlık (opsiyonel)
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Kısa başlık"
        placeholderTextColor={T.mutedText}
        autoCapitalize="sentences"
        style={[
          styles.input,
          { color: T.textColor, borderColor: T.border },
        ]}
      />

      {/* COMMENT */}

      <Text style={[styles.label, { color: T.mutedText }]}>Yorum</Text>

      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="En az 8 karakter"
        placeholderTextColor={T.mutedText}
        multiline
        textAlignVertical="top"
        style={[
          styles.textarea,
          { color: T.textColor, borderColor: T.border },
        ]}
      />

      {/* CTA */}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={submit}
        disabled={!canSubmit || sending}
        style={[
          styles.cta,
          {
            backgroundColor: canSubmit ? T.accent : T.border,
            opacity: canSubmit ? 1 : 0.6,
          },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "900" }}>
          {sending ? "Gönderiliyor..." : "Gönder"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },

  titleText: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: "900",
  },

  pills: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "800",
  },

  textarea: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 120,
    fontWeight: "800",
  },

  cta: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
});