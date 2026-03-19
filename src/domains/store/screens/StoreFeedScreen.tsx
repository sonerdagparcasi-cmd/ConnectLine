// src/domains/store/screens/StoreFeedScreen.tsx
// 🔒 STORE FEED — GLOBAL PRODUCT FLOW (STABLE)

import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

import ProductCard from "../components/ProductCard";
import { useStoreState } from "../hooks/useStoreState";
import { storeCatalogService } from "../services/storeCatalogService";
import type { StoreProduct } from "../types/store.types";

export default function StoreFeedScreen() {
  const navigation = useNavigation<any>();

  const { favorites, toggleFavorite, addToCart } = useStoreState();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setError(null);

      const list = await storeCatalogService.getProducts({
        sort: "popular",
      });

      setProducts(list);
    } catch {
      setError("Ürünler yüklenemedi.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Yükleniyor…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      contentContainerStyle={
        products.length === 0
          ? { flex: 1, justifyContent: "center", alignItems: "center" }
          : { padding: 12 }
      }
      ListEmptyComponent={<Text>Henüz ürün yok.</Text>}
      renderItem={({ item }) => (
        <ProductCard
          item={item}
          isFavorite={!!favorites[item.id]}
          onToggleFavorite={() => toggleFavorite(item.id)}
          onAddToCart={() => addToCart(item.id, 1)}
          onPress={() =>
            navigation.navigate("StoreProductDetail", {
              productId: item.id,
            })
          }
        />
      )}
    />
  );
}