// src/domains/store/screens/StoreProductDetailScreen.tsx
// 🔒 STORE PRODUCT DETAIL (B-14 / C-32 / D / E) – STABLE + EMOJI ICON UX

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

/* UI */
import ProductCampaignInfoCard from "../components/ProductCampaignInfoCard";

/* State / Services */
import { useStoreState } from "../hooks/useStoreState";
import type { StoreStackParamList } from "../navigation/StoreNavigator";
import { matchCampaignForProduct } from "../services/storeCampaignProductMatcher";
import { storeCampaignService } from "../services/storeCampaignService";
import { storeCatalogService } from "../services/storeCatalogService";

/* Types */
import type { StoreProduct } from "../types/store.types";
import type { StoreCampaign } from "../types/storeCampaign.types";

type RouteProps = RouteProp<
  StoreStackParamList,
  "StoreProductDetail"
>;

export default function StoreProductDetailScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const { params } = useRoute<RouteProps>();

  const { addToCart } = useStoreState();

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [campaigns, setCampaigns] = useState<StoreCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [params.productId]);

  async function load() {
    try {
      setLoading(true);

      const [p, list] = await Promise.all([
        storeCatalogService.getProductById(params.productId),
        storeCampaignService.getCampaigns(),
      ]);

      setProduct(p ?? null);
      setCampaigns(list);
    } finally {
      setLoading(false);
    }
  }

  const matchedCampaign = useMemo(() => {
    if (!product) return null;
    return matchCampaignForProduct(campaigns, product);
  }, [campaigns, product]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.mutedText }}>Yükleniyor…</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.mutedText }}>Ürün bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: T.backgroundColor }}
      contentContainerStyle={styles.container}
    >
      {/* Campaign */}
      {matchedCampaign && (
        <ProductCampaignInfoCard
          campaign={matchedCampaign}
          onPressDetail={() =>
            navigation.navigate("StoreCampaignDetail", {
              campaignId: matchedCampaign.id,
            })
          }
        />
      )}

      {/* PRODUCT */}
      <View
        style={[
          styles.card,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <Text style={[styles.title, { color: T.textColor }]}>
          {product.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.price, { color: T.accent }]}>
            {product.price} {product.currency}
          </Text>

          <View style={styles.ratingWrap}>
            <Text style={{ fontSize: 14 }}>⭐</Text>
            <Text style={{ color: T.mutedText }}>
              {(product.rating ?? 0).toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.stockRow}>
          <Text style={{ fontSize: 14 }}>
            {product.inStock ? "✅" : "❌"}
          </Text>

          <Text style={{ color: T.mutedText, fontSize: 12 }}>
            {product.inStock ? "Stokta var" : "Tükendi"}
          </Text>
        </View>
      </View>

      {/* SELLER */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("StoreSellerProfile", {
            sellerId: product.sellerId,
          })
        }
        style={[
          styles.sellerCard,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <Text style={{ fontSize: 18 }}>🏪</Text>

        <View style={{ flex: 1 }}>
          <Text style={{ color: T.textColor, fontWeight: "900" }}>
            Mağazayı ziyaret et
          </Text>

          <Text style={{ color: T.mutedText, fontSize: 12 }}>
            Satıcının diğer ürünlerini görüntüle
          </Text>
        </View>

        <Text style={{ fontSize: 18 }}>›</Text>
      </TouchableOpacity>

      {/* ADD TO CART */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => addToCart(product.id, 1)}
        style={[styles.addBtn, { backgroundColor: T.accent }]}
      >
        <Text style={{ fontSize: 18 }}>🛒</Text>
        <Text style={styles.addBtnText}>Sepete Ekle</Text>
      </TouchableOpacity>

      {/* REVIEWS */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("StoreProductReviews", {
            productId: product.id,
            sellerId: product.sellerId,
          })
        }
        style={[
          styles.reviewBtn,
          { borderColor: T.border },
        ]}
      >
        <Text style={{ fontSize: 16 }}>💬</Text>

        <Text
          style={[
            styles.reviewText,
            { color: T.textColor },
          ]}
        >
          Yorumları Gör
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  price: {
    fontSize: 15,
    fontWeight: "900",
  },

  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  sellerCard: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  addBtn: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  reviewBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  reviewText: {
    fontWeight: "900",
    fontSize: 13,
  },
});