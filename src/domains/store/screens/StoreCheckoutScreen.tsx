// src/domains/store/screens/StoreCheckoutScreen.tsx
// 🔒 STORE CHECKOUT SCREEN (D-35..46) – STABLE

import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import ThreeDSecureModal from "../components/ThreeDSecureModal";
import { useStoreState } from "../hooks/useStoreState";
import { storeCatalogService } from "../services/storeCatalogService";
import { createOrder } from "../services/storeOrderService";
import type { StoreProduct } from "../types/store.types";

export default function StoreCheckoutScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();

  const { cart, completeCheckout } = useStoreState();

  const [productMap, setProductMap] =
    useState<Record<string, StoreProduct>>({});

  const [resolving, setResolving] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [show3ds, setShow3ds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------ */
  /* PRODUCT RESOLVE                                  */
  /* ------------------------------------------------ */

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
          missing.map((id) => storeCatalogService.getProductById(id))
        );

        if (cancelled) return;

        const next: Record<string, StoreProduct> = {};

        missing.forEach((id, i) => {
          const p = results[i];
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
  }, [cart]);

  /* ------------------------------------------------ */
  /* TOTAL                                            */
  /* ------------------------------------------------ */

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = productMap[item.productId];
      return sum + (p?.price ?? 0) * item.qty;
    }, 0);
  }, [cart, productMap]);

  const currency = useMemo(() => {
    const first = cart[0];
    if (!first) return "";
    return productMap[first.productId]?.currency ?? "";
  }, [cart, productMap]);

  const canPay = cart.length > 0 && !isPaying;

  /* ------------------------------------------------ */
  /* PAYMENT FLOW                                     */
  /* ------------------------------------------------ */

  const startPayment = () => {
    if (!canPay) return;

    setError(null);
    setShow3ds(true);
  };

  const confirmPayment = async () => {
    if (isPaying) return;

    try {
      setIsPaying(true);
      setError(null);

      const order = await createOrder({
        items: cart,
        total,
      });

      completeCheckout();

      setShow3ds(false);

      navigation.navigate("StoreOrderSuccess", {
        orderId: order.id,
      });
    } catch {
      setError("Ödeme sırasında bir hata oluştu. Lütfen tekrar dene.");
      setShow3ds(false);
    } finally {
      setIsPaying(false);
    }
  };

  const cancelPayment = () => {
    if (isPaying) return;
    setShow3ds(false);
  };

  /* ------------------------------------------------ */
  /* RENDER                                           */
  /* ------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>💳</Text>

          <Text style={[styles.title, { color: T.textColor }]}>
            Ödeme
          </Text>
        </View>

        {resolving && (
          <Text style={[styles.subtle, { color: T.mutedText }]}>
            Yükleniyor…
          </Text>
        )}
      </View>

      {/* ADDRESS */}

      <View
        style={[
          styles.box,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <View style={styles.row}>
          <Text style={styles.icon}>📦</Text>

          <Text style={[styles.label, { color: T.mutedText }]}>
            Adres
          </Text>
        </View>

        <Text style={[styles.value, { color: T.textColor }]}>
          Kayıtlı adres (mock)
        </Text>
      </View>

      {/* PAYMENT METHOD */}

      <View
        style={[
          styles.box,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <View style={styles.row}>
          <Text style={styles.icon}>💳</Text>

          <Text style={[styles.label, { color: T.mutedText }]}>
            Ödeme Yöntemi
          </Text>
        </View>

        <Text style={[styles.value, { color: T.textColor }]}>
          Kart •••• 4242 (mock)
        </Text>
      </View>

      {/* TOTAL */}

      <View
        style={[
          styles.box,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <View style={styles.row}>
          <Text style={styles.icon}>🧾</Text>

          <Text style={[styles.label, { color: T.mutedText }]}>
            Toplam
          </Text>
        </View>

        <Text style={[styles.total, { color: T.textColor }]}>
          {total.toFixed(2)} {currency}
        </Text>
      </View>

      {/* CTA */}

      <TouchableOpacity
        activeOpacity={0.9}
        disabled={!canPay}
        onPress={startPayment}
        style={[
          styles.cta,
          { backgroundColor: canPay ? T.accent : T.border },
        ]}
      >
        <Text style={{ fontSize: 18 }}>🛒</Text>

        <Text style={styles.ctaText}>
          {isPaying ? "İşleniyor…" : "Satın Al"}
        </Text>
      </TouchableOpacity>

      {cart.length === 0 && (
        <Text style={[styles.helper, { color: T.mutedText }]}>
          Sepet boş. Satın almak için ürünü sepete ekle.
        </Text>
      )}

      {!!error && (
        <Text style={[styles.error, { color: T.accent }]}>
          {error}
        </Text>
      )}

      <ThreeDSecureModal
        visible={show3ds}
        onConfirm={confirmPayment}
        onCancel={cancelPayment}
      />
    </View>
  );
}

/* ------------------------------------------------ */
/* STYLES                                           */
/* ------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  icon: {
    fontSize: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
  },

  subtle: {
    fontSize: 12,
    fontWeight: "800",
  },

  box: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: "900",
  },

  value: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },

  total: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },

  cta: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  ctaText: {
    color: "#fff",
    fontWeight: "900",
  },

  helper: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
  },

  error: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "900",
  },
});