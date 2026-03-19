// 🔒 STORE SAVED (B-15 / C-31) – STABLE

import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

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

/* Types */
import type { StoreProduct } from "../types/store.types";
import type { StoreCampaign } from "../types/storeCampaign.types";

/**
 * 🔒 StoreSavedScreen (STABLE)
 *
 * Amaç:
 * - Kullanıcının kaydettiği ürünler
 * - Kampanya badge’leri (C-31)
 *
 * Kurallar:
 * - Herkes görür
 * - Satıcı / owner ayrımı YOK
 * - Favori state StoreState’ten gelir
 * - Badge hesabı tek yerde
 */

export default function StoreSavedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();

  const { favorites, toggleFavorite, addToCart } = useStoreState();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allProducts, setAllProducts] = useState<StoreProduct[]>([]);
  const [campaignBadgeByProductId, setCampaignBadgeByProductId] =
    useState<Record<string, string>>({});

  /* ------------------------------------------------------------------ */
  /* DERIVED                                                           */
  /* ------------------------------------------------------------------ */

  const favoriteIds = useMemo(
    () => Object.keys(favorites),
    [favorites]
  );

  const savedProducts = useMemo(() => {
    if (favoriteIds.length === 0) return [];
    const set = new Set(favoriteIds);
    return allProducts.filter((p) => set.has(p.id));
  }, [allProducts, favoriteIds]);

  /* ------------------------------------------------------------------ */
  /* LOAD                                                              */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const [products, campaigns] = await Promise.all([
        storeCatalogService.getProducts(),
        storeCampaignService.getCampaigns(),
      ]);

      setAllProducts(products);
      setCampaignBadgeByProductId(
        buildCampaignBadgeMap(products, campaigns)
      );
    } catch {
      setError("Kaydedilenler yüklenemedi.");
      setAllProducts([]);
      setCampaignBadgeByProductId({});
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Kaydedilenler
      </Text>

      {loading && <StoreListLoading />}

      {!loading && error && (
        <StoreErrorState title={error} onRetry={load} />
      )}

      {!loading && !error && (
        <FlatList
          data={savedProducts}
          keyExtractor={(it) => it.id}
          contentContainerStyle={
            savedProducts.length === 0 ? { flex: 1 } : undefined
          }
          ListEmptyComponent={
            <StoreListEmpty title="Henüz kaydedilen ürün yok." />
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
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function buildCampaignBadgeMap(
  products: StoreProduct[],
  campaigns: StoreCampaign[]
) {
  const active = campaigns.filter(
    (c) => getCampaignStatus(c) === "active"
  );

  // daha yüksek indirim öncelikli
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
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
});