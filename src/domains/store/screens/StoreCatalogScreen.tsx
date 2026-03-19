// 🔒 STORE CATALOG (B-13) – STABLE / UX CONNECTED
// UPDATE:
// - Sticky filter bar
// - Header küçültüldü
// - Global cart StoreNavigator'a taşındı
// - Product → Cart fly animation eklendi
// - Mimari korunur

import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";

/* UI */
import CategoryChips from "../components/CategoryChips";
import ProductCard from "../components/ProductCard";
import SortPills from "../components/SortPills";
import StoreErrorState from "../components/StoreErrorState";
import StoreListEmpty from "../components/StoreListEmpty";
import StoreListLoading from "../components/StoreListLoading";
import StoreMusicMiniPlayer from "../components/StoreMusicMiniPlayer";
import StoreSearchBar from "../components/StoreSearchBar";

/* ✨ Animasyon */
import StoreFlyToCartAnimation from "../components/StoreFlyToCartAnimation";

/* State / Services */
import { useStoreState } from "../hooks/useStoreState";
import {
  storeCatalogService,
  type StoreSortMode,
} from "../services/storeCatalogService";

/* Types */
import type { StoreCategory, StoreProduct } from "../types/store.types";

/* Campaign */
import {
  getCampaignStatus,
  storeCampaignService,
} from "../services/storeCampaignService";
import type { StoreCampaign } from "../types/storeCampaign.types";

export default function StoreCatalogScreen() {

  const T = useAppTheme();
  const nav = useNavigation<any>();

  const { favorites, toggleFavorite, addToCart, cart } = useStoreState();

  const cartCount = useMemo(
    () => cart.reduce((s, c) => s + c.qty, 0),
    [cart]
  );

  /* ✨ uçuş animasyonu */
  const [fly, setFly] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<StoreSortMode>("popular");

  const [items, setItems] = useState<StoreProduct[]>([]);

  const [campaignBadgeByProductId, setCampaignBadgeByProductId] =
    useState<Record<string, string>>({});

  const emptyTitle = useMemo(() => {
    if (search.trim()) return t("store.catalog.emptySearch");
    if (selectedCategoryId) return t("store.catalog.emptyCategory");
    return t("store.catalog.empty");
  }, [search, selectedCategoryId]);

  /* LOAD */

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    loadProducts(false);
  }, [selectedCategoryId, sort]);

  useEffect(() => {
    const h = setTimeout(() => {
      loadProducts(false);
    }, 250);

    return () => clearTimeout(h);
  }, [search]);

  async function bootstrap() {

    try {

      setLoading(true);
      setError(null);

      const cats = await storeCatalogService.getCategories();
      setCategories(cats);

      await loadProducts(true);

    } catch {

      setError(t("store.catalog.error"));
      setItems([]);
      setCampaignBadgeByProductId({});

    } finally {

      setLoading(false);

    }

  }

  async function loadProducts(forceLoading: boolean) {

    try {

      if (forceLoading) setLoading(true);

      setError(null);

      const [list, campaigns] = await Promise.all([
        storeCatalogService.getProducts({
          categoryId: selectedCategoryId ?? undefined,
          search: search.trim() || undefined,
          sort,
        }),
        storeCampaignService.getCampaigns(),
      ]);

      setItems(list);

      setCampaignBadgeByProductId(
        buildCampaignBadgeMap(list, campaigns)
      );

    } catch {

      setError(t("store.catalog.error"));
      setItems([]);
      setCampaignBadgeByProductId({});

    } finally {

      if (forceLoading) setLoading(false);

    }

  }

  async function onRefresh() {

    try {

      setRefreshing(true);
      await loadProducts(false);

    } finally {

      setRefreshing(false);

    }

  }

  function handleAddToCart(productId: string) {
    addToCart(productId, 1);
  }

  /* ✨ uçuş animasyonu başlat */

  function handleAnimateToCart(product: StoreProduct) {

    setFly({
      startX: 180,
      startY: 520,
      endX: 340,
      endY: 740,
      emoji: "🧴",
    });

  }

  /* HEADER */

  const renderHeader = () => (

    <View style={styles.header}>

      <View style={styles.leftHeader}>

        <Text style={styles.headerIcon}>🛍</Text>

        <Text style={[styles.title, { color: T.textColor }]}>
          Store
        </Text>

      </View>

      <TouchableOpacity
        onPress={() => nav.navigate("StoreCart")}
        hitSlop={12}
        style={[
          styles.cartButton,
          { borderColor: T.border },
        ]}
      >

        <View style={styles.cartIconWrap}>

          <Text style={styles.headerIcon}>🛒</Text>

          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}

        </View>

      </TouchableOpacity>

    </View>

  );

  /* FILTER BAR */

  const renderFilters = () => (

    <View style={[styles.filters, { backgroundColor: T.backgroundColor }]}>

      <StoreSearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("store.common.search")}
      />

      <StoreMusicMiniPlayer />

      <CategoryChips
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      <SortPills
        value={sort}
        onChange={setSort}
      />

    </View>

  );

  return (

    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>

      {loading ? (
        <StoreListLoading title={t("store.catalog.loading")} />
      ) : error ? (
        <StoreErrorState
          title={error}
          onRetry={() => loadProducts(true)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderFilters()}
            </>
          }
          stickyHeaderIndices={[1]}
          contentContainerStyle={[
            items.length === 0 ? { flex: 1 } : styles.listPadding,
          ]}
          ListEmptyComponent={
            <StoreListEmpty title={emptyTitle} />
          }
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              isFavorite={!!favorites[item.id]}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onAddToCart={() => handleAddToCart(item.id)}
              onAnimateToCart={handleAnimateToCart}
              campaignBadgeText={
                campaignBadgeByProductId[item.id] ?? null
              }
              onPress={() =>
                nav.navigate("StoreProductDetail", {
                  productId: item.id,
                })
              }
            />
          )}
        />
      )}

      {/* ✨ ANIMATION LAYER */}

      {fly && (
        <StoreFlyToCartAnimation
          startX={fly.startX}
          startY={fly.startY}
          endX={fly.endX}
          endY={fly.endY}
          emoji={fly.emoji}
          onEnd={() => setFly(null)}
        />
      )}

    </View>

  );

}

/* CAMPAIGN BADGE */

function buildCampaignBadgeMap(
  products: StoreProduct[],
  campaigns: StoreCampaign[]
) {

  const active = campaigns
    .filter((c) => getCampaignStatus(c) === "active")
    .sort(
      (a, b) =>
        (b.discount?.percent ?? 0) -
        (a.discount?.percent ?? 0)
    );

  const map: Record<string, string> = {};

  for (const p of products) {

    const matched = active.find((c) => {

      const targetCats = c.target?.categoryIds;

      if (!targetCats || targetCats.length === 0)
        return true;

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

/* STYLES */

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  headerIcon: {
    fontSize: 18,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
  },

  filters: {
    paddingBottom: 6,
  },

  cartButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
  },

  cartIconWrap: {
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },

  listPadding: {
    paddingBottom: 80,
  },

});