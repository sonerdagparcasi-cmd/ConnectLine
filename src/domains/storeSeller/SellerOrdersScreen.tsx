// src/domains/storeSeller/SellerOrdersScreen.tsx
// 🔒 SATİCI YÖNETİMİ – SİPARİŞLER (UI ONLY)

import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES (UI ONLY)                                                     */
/* ------------------------------------------------------------------ */

type SellerOrder = {
  id: string;
  customer: string;
  total: string;
  status: "new" | "processing" | "completed";
};

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI ONLY)                                                 */
/* ------------------------------------------------------------------ */

const MOCK_ORDERS: SellerOrder[] = [
  {
    id: "o1",
    customer: "Müşteri A",
    total: "₺2.450",
    status: "new",
  },
  {
    id: "o2",
    customer: "Müşteri B",
    total: "₺1.120",
    status: "processing",
  },
  {
    id: "o3",
    customer: "Müşteri C",
    total: "₺890",
    status: "completed",
  },
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function getStatusLabel(status: SellerOrder["status"]) {
  switch (status) {
    case "new":
      return "Yeni Sipariş";
    case "processing":
      return "Hazırlanıyor";
    case "completed":
      return "Tamamlandı";
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SellerOrdersScreen() {
  const T = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Siparişler
      </Text>

      <Text style={[styles.subtitle, { color: T.mutedText }]}>
        Gelen siparişler ve durumları
      </Text>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <View style={styles.row}>
              <Text style={[styles.orderId, { color: T.textColor }]}>
                #{item.id}
              </Text>

              <Text style={[styles.status, { color: T.accent }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>

            <Text style={{ color: T.textColor, marginTop: 6 }}>
              {item.customer}
            </Text>

            <Text
              style={[
                styles.total,
                { color: T.accent },
              ]}
            >
              {item.total}
            </Text>

            {/* ACTIONS */}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: T.border }]}
              >
                <Ionicons name="eye-outline" size={16} color={T.textColor} />
                <Text style={{ color: T.textColor }}>Detay</Text>
              </TouchableOpacity>

              {item.status !== "completed" && (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: T.accent },
                  ]}
                >
                  <Text style={styles.actionPrimary}>
                    Tamamla
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      {/* EMPTY HINT */}

      {MOCK_ORDERS.length === 0 && (
        <View style={[styles.placeholder, { borderColor: T.border }]}>
          <Text style={[styles.placeholderText, { color: T.mutedText }]}>
            Henüz sipariş yok
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

  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    marginBottom: 16,
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  orderId: {
    fontSize: 14,
    fontWeight: "800",
  },

  status: {
    fontWeight: "800",
  },

  total: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  actionPrimary: {
    color: "#fff",
    fontWeight: "800",
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