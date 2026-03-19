// src/domains/storeSeller/SellerProductsScreen.tsx
// 🔒 SATİCI YÖNETİMİ – ÜRÜNLER (UI ONLY)

import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES (UI ONLY)                                                    */
/* ------------------------------------------------------------------ */

type SellerProduct = {
  id: string;
  title: string;
  price: string;
  stock: number;
};

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI ONLY)                                                */
/* ------------------------------------------------------------------ */

const MOCK_PRODUCTS: SellerProduct[] = [
  {
    id: "p1",
    title: "Ürün A",
    price: "₺1.250",
    stock: 42,
  },
  {
    id: "p2",
    title: "Ürün B",
    price: "₺890",
    stock: 0,
  },
  {
    id: "p3",
    title: "Ürün C",
    price: "₺2.100",
    stock: 18,
  },
];

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SellerProductsScreen() {
  const T = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: T.textColor }]}>
            Ürünlerim
          </Text>

          <Text style={[styles.subtitle, { color: T.mutedText }]}>
            Satıştaki ürünleriniz
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addBtn,
            { backgroundColor: T.accent },
          ]}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addText}>Ürün Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCT LIST */}

      <FlatList
        data={MOCK_PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.productTitle, { color: T.textColor }]}>
                {item.title}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity>
                  <Ionicons name="create-outline" size={18} color={T.textColor} />
                </TouchableOpacity>

                <TouchableOpacity>
                  <Ionicons name="trash-outline" size={18} color={T.mutedText} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.price, { color: T.accent }]}>
              {item.price}
            </Text>

            <Text style={{ color: T.mutedText, marginTop: 4 }}>
              Stok: {item.stock > 0 ? item.stock : "Tükendi"}
            </Text>
          </View>
        )}
      />

      {/* EMPTY HINT */}

      {MOCK_PRODUCTS.length === 0 && (
        <View style={[styles.placeholder, { borderColor: T.border }]}>
          <Text style={[styles.placeholderText, { color: T.mutedText }]}>
            Henüz ürün eklemediniz
          </Text>
        </View>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  addText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  listContent: {
    paddingBottom: 16,
  },

  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "900",
  },

  placeholder: {
    marginTop: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});