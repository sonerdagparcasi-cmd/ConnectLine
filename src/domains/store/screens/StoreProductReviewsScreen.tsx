// src/domains/store/screens/StoreProductReviewsScreen.tsx
// 🔒 STORE PRODUCT REVIEWS – STABLE

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

import RatingBreakdown from "../components/RatingBreakdown";
import ReviewCard from "../components/ReviewCard";

import type { StoreStackParamList } from "../navigation/StoreNavigator";
import { storeReviewService } from "../services/storeReviewService";
import type { RatingSummary, StoreReview } from "../types/storeReview.types";

type R = RouteProp<StoreStackParamList, "StoreProductReviews">;

export default function StoreProductReviewsScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<R>();

  const [items, setItems] = useState<StoreReview[]>([]);
  const [summary, setSummary] = useState<RatingSummary>({
    average: 0,
    count: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [params.productId]);

  async function load() {
    try {
      setLoading(true);

      const [list, sum] = await Promise.all([
        storeReviewService.getReviewsByProduct(params.productId),
        storeReviewService.getProductRatingSummary(params.productId),
      ]);

      setItems(list);
      setSummary(sum);
    } catch {
      setItems([]);
      setSummary({
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.textColor }]}>
          Yorumlar
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            nav.navigate("StoreWriteReview", {
              productId: params.productId,
              sellerId: params.sellerId,
            })
          }
          style={[styles.btn, { backgroundColor: T.accent }]}
        >
          <Text style={styles.btnText}>Yorum Yaz</Text>
        </TouchableOpacity>
      </View>

      {/* MODERATION NOTICE */}

      <View style={[styles.notice, { borderColor: T.border }]}>
        <Text style={{ color: T.mutedText, fontSize: 12, fontWeight: "800" }}>
          Moderasyon: Hakaret, kişisel veri ve yanıltıcı içerikler kaldırılabilir.
        </Text>
      </View>

      {/* RATING SUMMARY */}

      <RatingBreakdown summary={summary} />

      {/* LIST */}

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: T.mutedText }}>Yorumlar yükleniyor…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: T.mutedText }}>
                Henüz yorum yok.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View>
              <ReviewCard item={item} />

              {!item.sellerReply?.text && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    nav.navigate("StoreSellerReply", {
                      reviewId: item.id,
                      productId: params.productId,
                    })
                  }
                  style={[styles.replyBtn, { borderColor: T.border }]}
                >
                  <Text
                    style={{
                      color: T.textColor,
                      fontWeight: "900",
                      fontSize: 12,
                    }}
                  >
                    Satıcı Yanıtla
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
  },

  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },

  btnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },

  notice: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
  },

  center: {
    paddingVertical: 40,
    alignItems: "center",
  },

  replyBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 12,
    marginTop: -4,
  },
});