// src/domains/store/screens/StoreCartScreen.tsx
// 🔒 STORE CART SCREEN (D-35..46) – STABLE
// UPDATE:
// - Checkout CTA artık ListFooterComponent içinde
// - Buton scroll ile birlikte hareket eder
// - Mimari / state akışı korunur

import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { useStoreState } from "../hooks/useStoreState";
import { storeCatalogService } from "../services/storeCatalogService";
import type { StoreProduct } from "../types/store.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type ResolvedCartRow = {
  productId: string;
  qty: number;
  product: StoreProduct | null;
};

export default function StoreCartScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();

  const { cart, removeFromCart, setQty } = useStoreState();

  const [productMap, setProductMap] =
    useState<Record<string, StoreProduct>>({});
  const [resolving, setResolving] = useState(false);

  /* ------------------------------------------------------------------ */
  /* RESOLVE PRODUCTS (LAZY)                                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    async function resolveProducts() {
      const ids = Array.from(new Set(cart.map((c) => c.productId)));

      if (ids.length === 0) {
        setProductMap({});
        return;
      }

      const missing = ids.filter((id) => !productMap[id]);
      if (missing.length === 0) return;

      try {
        setResolving(true);

        const results = await Promise.all(
          missing.map(async (id) => {
            const p = await storeCatalogService.getProductById(id);
            return p ?? null;
          })
        );

        if (cancelled) return;

        const next: Record<string, StoreProduct> = {};
        missing.forEach((id, idx) => {
          const p = results[idx];
          if (p) next[id] = p;
        });

        setProductMap((prev) => ({ ...prev, ...next }));
      } finally {
        if (!cancelled) setResolving(false);
      }
    }

    resolveProducts();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  /* ------------------------------------------------------------------ */
  /* DERIVED DATA                                                       */
  /* ------------------------------------------------------------------ */

  const rows: ResolvedCartRow[] = useMemo(() => {
    return cart.map((i) => ({
      productId: i.productId,
      qty: i.qty,
      product: productMap[i.productId] ?? null,
    }));
  }, [cart, productMap]);

  const total = useMemo(() => {
    return rows.reduce((sum, r) => {
      const price = r.product?.price ?? 0;
      return sum + r.qty * price;
    }, 0);
  }, [rows]);

  const canCheckout = rows.length > 0;

  /* ------------------------------------------------------------------ */
  /* RENDER                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: T.textColor }]}>Sepetim</Text>
        {resolving && (
          <Text style={[styles.subtle, { color: T.mutedText }]}>
            Yükleniyor…
          </Text>
        )}
      </View>

      {/* LIST */}
      <FlatList
        data={rows}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={{
          paddingBottom: 30,
          flexGrow: rows.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: T.mutedText, fontWeight: "800" }}>
              Sepet boş.
            </Text>
            <Text style={{ color: T.mutedText, marginTop: 6 }}>
              Kataloğa dönüp ürün ekleyebilirsin.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const title = item.product?.title ?? "Ürün yükleniyor…";
          const currency = item.product?.currency ?? "";
          const lineTotal =
            item.product?.price != null
              ? item.product.price * item.qty
              : null;

          return (
            <View
              style={[
                styles.card,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <Text
                style={[styles.name, { color: T.textColor }]}
                numberOfLines={2}
              >
                {title}
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setQty(item.productId, item.qty - 1)}
                  style={[styles.iconBtn, { borderColor: T.border }]}
                >
                  <Text style={[styles.qtyBtn, { color: T.textColor }]}>−</Text>
                </TouchableOpacity>

                <Text style={[styles.qtyText, { color: T.textColor }]}>
                  {item.qty}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setQty(item.productId, item.qty + 1)}
                  style={[styles.iconBtn, { borderColor: T.border }]}
                >
                  <Text style={[styles.qtyBtn, { color: T.textColor }]}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => removeFromCart(item.productId)}
                  style={styles.removeBtn}
                >
                  <Text style={[styles.remove, { color: T.accent }]}>
                    Kaldır
                  </Text>
                </TouchableOpacity>

                {lineTotal != null && (
                  <Text style={[styles.price, { color: T.mutedText }]}>
                    {lineTotal.toFixed(2)} {currency}
                  </Text>
                )}
              </View>
            </View>
          );
        }}

        /* 🔒 CHECKOUT – artık scroll ile hareket eder */
        ListFooterComponent={
          canCheckout ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("StoreCheckout")}
              style={[styles.cta, { backgroundColor: T.accent }]}
            >
              <Text style={styles.ctaText}>
                Devam Et • {total.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
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
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
  },

  subtle: {
    fontSize: 12,
    fontWeight: "800",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },

  name: {
    fontSize: 14,
    fontWeight: "900",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  iconBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  qtyBtn: {
    fontSize: 18,
    fontWeight: "900",
    minWidth: 14,
    textAlign: "center",
  },

  qtyText: {
    fontWeight: "900",
    minWidth: 24,
    textAlign: "center",
  },

  removeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  remove: {
    fontSize: 12,
    fontWeight: "900",
  },

  price: {
    marginLeft: "auto",
    fontSize: 12,
    fontWeight: "800",
  },

  cta: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  ctaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});