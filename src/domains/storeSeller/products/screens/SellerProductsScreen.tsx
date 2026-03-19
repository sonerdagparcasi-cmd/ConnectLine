// src/domains/storeSeller/products/screens/SellerProductsScreen.tsx
// 🔒 SELLER PRODUCTS SCREEN – STABLE / UI ONLY

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import type { StoreSellerStackParamList } from "../../navigation/StoreSellerNavigator";
import { sellerProductService } from "../services/sellerProductService";
import type { SellerManagedProduct } from "../types/sellerProduct.types";

type Nav = NativeStackNavigationProp<StoreSellerStackParamList>;

export default function SellerProductsScreen() {
  const T = useAppTheme();
  const nav = useNavigation<Nav>();

  const [products, setProducts] = useState<SellerManagedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const sellerId = "mockSeller"; // UI-only

  /* --------------------------------------------------------------- */
  /* LOAD PRODUCTS                                                   */
  /* --------------------------------------------------------------- */

  const loadProducts = useCallback(async () => {
    setLoading(true);

    const list = await sellerProductService.getSellerProducts(sellerId);

    setProducts(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* --------------------------------------------------------------- */
  /* DELETE PRODUCT                                                  */
  /* --------------------------------------------------------------- */

  async function deleteProduct(id: string) {
    await sellerProductService.deleteProduct(id);
    loadProducts();
  }

  /* --------------------------------------------------------------- */
  /* RENDER                                                          */
  /* --------------------------------------------------------------- */

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.textColor }]}>Ürünler</Text>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: T.accent }]}
          onPress={() => nav.navigate("SellerCreateProduct")}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addText}>Ürün Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: T.mutedText }}>Yükleniyor…</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={40} color={T.mutedText} />
          <Text style={{ color: T.mutedText, marginTop: 10 }}>
            Henüz ürün eklenmemiş
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <ProductRow
              product={item}
              onEdit={() =>
                nav.navigate("SellerEditProduct", { productId: item.id })
              }
              onDelete={() => deleteProduct(item.id)}
            />
          )}
        />
      )}
    </View>
  );

  /* --------------------------------------------------------------- */
  /* PRODUCT ROW                                                     */
  /* --------------------------------------------------------------- */

  function ProductRow({
    product,
    onEdit,
    onDelete,
  }: {
    product: SellerManagedProduct;
    onEdit: () => void;
    onDelete: () => void;
  }) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.productTitle, { color: T.textColor }]}>
            {product.title}
          </Text>

          <Text style={{ color: T.mutedText, marginTop: 4 }}>
            {product.price} {product.currency}
          </Text>

          <Text style={{ color: T.mutedText, fontSize: 12 }}>
            Stok: {product.stock}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color={T.textColor} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={T.accent} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  addText: {
    color: "#fff",
    fontWeight: "900",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  productTitle: {
    fontWeight: "900",
    fontSize: 14,
  },

  actions: {
    flexDirection: "row",
    gap: 14,
  },
});