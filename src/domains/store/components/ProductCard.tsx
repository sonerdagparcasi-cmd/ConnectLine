// src/domains/store/components/ProductCard.tsx
// 🔒 PRODUCT CARD – FAVORITE COLOR FIX (LIGHT/DARK SAFE)
// UPDATE:
// - Sepete ekle popup kaldırıldı
// - Floating cart sistemi ile uyumlu hale getirildi
// - Mimari korunur

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { storeIcons } from "../constants/storeIcons";
import type { StoreProduct } from "../types/store.types";

export default function ProductCard({
  item,
  isFavorite,
  onPress,
  onToggleFavorite,
  onAddToCart,
  onAnimateToCart,
  campaignBadgeText,
}: {
  item: StoreProduct;
  isFavorite: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onAddToCart?: () => void;
  onAnimateToCart?: (product: StoreProduct) => void;
  campaignBadgeText?: string | null;
}) {
  const T = useAppTheme();

  const showCampaign = !!campaignBadgeText?.trim();

  const favoriteColor = T.isDark ? "#1834ae" : "#00bfff";
  const likeColor = isFavorite ? favoriteColor : T.mutedText;

  const stockColor = item.inStock ? T.mutedText : "#ff3b30";

  function handleAdd() {
    if (!item.inStock) return;

    onAddToCart?.();
    onAnimateToCart?.(item);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {/* TITLE + FAVORITE */}
      <View style={styles.row}>
        <Text
          style={[styles.title, { color: T.textColor }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <TouchableOpacity onPress={onToggleFavorite} hitSlop={10}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={likeColor}
          />
        </TouchableOpacity>
      </View>

      {/* DESC */}
      {!!item.shortDesc && (
        <Text
          style={[styles.desc, { color: T.mutedText }]}
          numberOfLines={2}
        >
          {item.shortDesc}
        </Text>
      )}

      <View style={styles.bottomRow}>
        {/* BADGES */}
        <View style={styles.badges}>

          {/* CAMPAIGN */}
          {showCampaign && (
            <View
              style={[
                styles.badge,
                styles.campaignBadge,
                {
                  borderColor: T.border,
                  backgroundColor: T.backgroundColor,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                },
              ]}
            >
              <Ionicons
                name={storeIcons.discount}
                size={11}
                color={T.accent}
              />

              <Text
                style={[
                  styles.badgeText,
                  styles.campaignText,
                  { color: T.accent },
                ]}
                numberOfLines={1}
              >
                {campaignBadgeText}
              </Text>
            </View>
          )}

          {/* STOCK */}
          <View style={[styles.badge, { borderColor: T.border }]}>
            <Text style={[styles.badgeText, { color: stockColor }]}>
              {item.inStock ? "Stokta" : "Tükendi"}
            </Text>
          </View>

          {/* RATING */}
          <View
            style={[
              styles.badge,
              {
                borderColor: T.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              },
            ]}
          >
            <Ionicons
              name={storeIcons.sales}
              size={12}
              color="#f5b50a"
            />

            <Text style={[styles.badgeText, { color: T.mutedText }]}>
              {(item.rating ?? 0).toFixed(1)}
            </Text>
          </View>

        </View>

        {/* PRICE + CART */}
        <View style={styles.priceWrap}>
          <Text style={[styles.price, { color: T.textColor }]}>
            {item.price} {item.currency}
          </Text>

          <TouchableOpacity
            onPress={handleAdd}
            disabled={!item.inStock}
            style={[
              styles.cartBtn,
              {
                borderColor: T.border,
                opacity: item.inStock ? 1 : 0.45,
              },
            ]}
          >
            <Text style={styles.cartEmoji}>🛒</Text>

            <Text
              style={[
                styles.cartBtnText,
                { color: T.textColor },
              ]}
            >
              Sepete ekle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },

  desc: {
    fontSize: 12,
    lineHeight: 16,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },

  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  campaignBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  campaignText: {
    fontWeight: "900",
  },

  priceWrap: {
    alignItems: "flex-end",
    gap: 8,
  },

  price: {
    fontSize: 14,
    fontWeight: "900",
  },

  cartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  cartEmoji: {
    fontSize: 16,
  },

  cartBtnText: {
    fontSize: 12,
    fontWeight: "900",
  },
});