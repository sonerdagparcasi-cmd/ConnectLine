// src/domains/store/screens/StoreOrderDetailScreen.tsx
// 🔒 STORE ORDER DETAIL SCREEN (D-35..46 + SHIPPING) – FINAL / STABLE

import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { StoreStackParamList } from "../navigation/StoreNavigator";

import { storeCatalogService } from "../services/storeCatalogService";
import { getOrderById } from "../services/storeOrderService";

import type { StoreCartItem, StoreProduct } from "../types/store.types";
import type { StoreOrder } from "../types/storeOrder.types";

type R = RouteProp<StoreStackParamList, "StoreOrderDetail">;

export default function StoreOrderDetailScreen() {

  const T = useAppTheme();
  const route = useRoute<R>();
  const orderId = route.params.orderId;

  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [products, setProducts] = useState<Record<string, StoreProduct>>({});
  const [isLoading, setIsLoading] = useState(false);

  /* ------------------------------------------------------------------ */
  /* LOAD                                                               */
  /* ------------------------------------------------------------------ */

  useEffect(() => {

    let cancelled = false;

    async function load() {

      try {

        setIsLoading(true);

        const o = await getOrderById(orderId);

        if (cancelled) return;

        if (!o) {
          setOrder(null);
          return;
        }

        setOrder(o);
        setProducts({});

        /* UNIQUE PRODUCT IDS */

        const ids = Array.from(
          new Set((o.items ?? []).map((i: StoreCartItem) => i.productId))
        );

        const list = await Promise.all(
          ids.map((id) => storeCatalogService.getProductById(id))
        );

        if (cancelled) return;

        const map: Record<string, StoreProduct> = {};

        list.forEach((p) => {
          if (p) map[p.id] = p;
        });

        setProducts(map);

      } finally {

        if (!cancelled) setIsLoading(false);

      }

    }

    load();

    return () => {
      cancelled = true;
    };

  }, [orderId]);

  /* ------------------------------------------------------------------ */
  /* CURRENCY                                                           */
  /* ------------------------------------------------------------------ */

  const currency = useMemo(() => {

    if (!order || !order.items || order.items.length === 0) return "";

    const first = order.items[0];

    return products[first.productId]?.currency ?? "";

  }, [order, products]);

  /* ------------------------------------------------------------------ */
  /* STATES                                                             */
  /* ------------------------------------------------------------------ */

  if (isLoading && !order) {

    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.mutedText, fontWeight: "800" }}>
          Yükleniyor…
        </Text>
      </View>
    );

  }

  if (!order) {

    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.mutedText, fontWeight: "800" }}>
          Sipariş bulunamadı.
        </Text>
      </View>
    );

  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (

    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>

      <Text style={[styles.title, { color: T.textColor }]}>
        Sipariş #{order.id}
      </Text>

      {/* META */}

      <View
        style={[
          styles.metaBox,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >

        <Text style={[styles.metaText, { color: T.mutedText }]}>
          Tarih: {new Date(order.createdAt).toLocaleString()}
        </Text>

        <Text style={[styles.metaText, { color: T.mutedText }]}>
          Durum: {order.status.toUpperCase()}
        </Text>

      </View>

      {/* ITEMS */}

      <View
        style={[
          styles.itemsBox,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >

        {(order.items ?? []).map((i: StoreCartItem) => {

          const product = products[i.productId];

          return (

            <View key={`${order.id}:${i.productId}`} style={styles.row}>

              <Text
                style={[styles.itemText, { color: T.textColor }]}
                numberOfLines={2}
              >
                {product?.title ?? "Ürün"}
              </Text>

              <Text style={[styles.qtyText, { color: T.mutedText }]}>
                × {i.qty}
              </Text>

            </View>

          );

        })}

      </View>

      {/* TOTAL */}

      <Text style={[styles.total, { color: T.accent }]}>
        Toplam: {order.total.toFixed(2)} {currency}
      </Text>

    </View>

  );

}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
  },

  metaBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "800",
  },

  itemsBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  itemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },

  qtyText: {
    fontSize: 12,
    fontWeight: "900",
  },

  total: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "900",
  },

});