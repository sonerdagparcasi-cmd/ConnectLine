// src/domains/store/screens/StoreSellerProfileScreen.tsx
// 🔒 STORE SELLER PROFILE (B-16 / C-31 / TRUST SYSTEM) – STABLE

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";

/* UI */
import ProductCard from "../components/ProductCard";
import StoreErrorState from "../components/StoreErrorState";
import StoreListEmpty from "../components/StoreListEmpty";
import StoreListLoading from "../components/StoreListLoading";

/* State / Services */
import { useStoreState } from "../hooks/useStoreState";
import { getCampaignStatus, storeCampaignService } from "../services/storeCampaignService";
import { storeCatalogService } from "../services/storeCatalogService";

/* TRUST */
import { storeTrustService } from "../services/storeTrustService";

/* Types */
import type { StoreStackParamList } from "../navigation/StoreNavigator";
import type { StoreProduct, StoreSeller } from "../types/store.types";
import type { StoreCampaign } from "../types/storeCampaign.types";

/* ------------------------------------------------------------------ */

type RouteProps = RouteProp<StoreStackParamList, "StoreSellerProfile">;

export default function StoreSellerProfileScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();

  const { favorites, toggleFavorite, addToCart } = useStoreState();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seller, setSeller] = useState<StoreSeller | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [trust, setTrust] = useState<any>(null);

  const [campaignBadgeByProductId, setCampaignBadgeByProductId] =
    useState<Record<string, string>>({});

  const title = useMemo(() => seller?.name ?? "Satıcı", [seller]);

  /* ------------------------------------------------------------------ */

  useEffect(() => {
    load();
  }, [route.params.sellerId]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const [sellerData, list, campaigns, trustData] = await Promise.all([
        storeCatalogService.getSellerById(route.params.sellerId),
        storeCatalogService.getProductsBySeller(route.params.sellerId),
        storeCampaignService.getCampaigns(),
        storeTrustService.getSellerTrust(route.params.sellerId),
      ]);

      if (!sellerData) {
        setError("Satıcı bulunamadı.");
        setSeller(null);
        setProducts([]);
        setTrust(null);
        setCampaignBadgeByProductId({});
        return;
      }

      setSeller(sellerData);
      setProducts(list);
      setTrust(trustData);

      setCampaignBadgeByProductId(
        buildCampaignBadgeMap(list, campaigns)
      );
    } catch {
      setError("Bir şeyler ters gitti.");
      setSeller(null);
      setProducts([]);
      setTrust(null);
      setCampaignBadgeByProductId({});
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>

      {/* TITLE */}

      <AppGradientHeader
        title={title}
        onBack={() => navigation.goBack()}
        right={
          <View style={[styles.countPill, { borderColor: T.border }]}>
            <Text style={[styles.countText, { color: T.mutedText }]}>
              {products.length}
            </Text>
          </View>
        }
      />

      {/* META */}

      {!!seller && (
        <View
          style={[
            styles.metaCard,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <Text style={[styles.metaText, { color: T.mutedText }]}>
            {seller.city ?? "—"} • ⭐ {(seller.rating ?? 0).toFixed(1)}
          </Text>

          {/* TRUST ROW */}

          {!!trust && (
            <View style={styles.trustRow}>
              <TrustItem label="Satış" value={String(trust.sales)} T={T} />
              <TrustItem label="Takipçi" value={String(trust.followers)} T={T} />
              <TrustItem label="Yorum" value={String(trust.reviews)} T={T} />
            </View>
          )}

          {/* BADGE */}

          {!!trust?.badge && (
            <View style={styles.badgeRow}>
              <Text style={{ fontSize: 16 }}>🛡</Text>
              <Text style={{ color: T.mutedText, fontWeight: "800" }}>
                {trust.badge}
              </Text>
            </View>
          )}

          <Text style={[styles.metaHint, { color: T.mutedText }]}>
            Satıcının ürünleri aşağıda listelenir.
          </Text>
        </View>
      )}

      {/* STATES */}

      {loading && <StoreListLoading />}

      {!loading && error && (
        <StoreErrorState title={error} onRetry={load} />
      )}

      {!loading && !error && (
        <FlatList
          data={products}
          keyExtractor={(it) => it.id}
          contentContainerStyle={
            products.length === 0 ? { flex: 1 } : undefined
          }
          ListEmptyComponent={
            <StoreListEmpty title="Bu satıcıda ürün yok." />
          }
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              isFavorite={!!favorites[item.id]}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onAddToCart={() => addToCart(item.id, 1)}
              campaignBadgeText={
                campaignBadgeByProductId[item.id] ?? null
              }
              onPress={() =>
                navigation.navigate("StoreProductDetail", {
                  productId: item.id,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */

function TrustItem({
  label,
  value,
  T,
}: {
  label: string;
  value: string;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: T.textColor, fontWeight: "900" }}>
        {value}
      </Text>
      <Text style={{ color: T.mutedText, fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */

function buildCampaignBadgeMap(
  products: StoreProduct[],
  campaigns: StoreCampaign[]
) {
  const active = campaigns.filter(
    (c) => getCampaignStatus(c) === "active"
  );

  active.sort(
    (a, b) => (b.discount?.percent ?? 0) - (a.discount?.percent ?? 0)
  );

  const map: Record<string, string> = {};

  for (const p of products) {
    const matched = active.find((c) => {
      const targetCats = c.target?.categoryIds;
      if (!targetCats || targetCats.length === 0) return true;
      return targetCats.includes(p.categoryId);
    });

    if (!matched) continue;

    map[p.id] =
      matched.badgeText?.trim() ||
      (matched.discount?.percent != null
        ? `%${matched.discount.percent}`
        : "Kampanya");
  }

  return map;
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 14,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 10,
  },

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },

  countPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  countText: {
    fontSize: 11,
    fontWeight: "800",
  },

  metaCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "900",
  },

  metaHint: {
    fontSize: 12,
    fontWeight: "700",
  },

  trustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
});