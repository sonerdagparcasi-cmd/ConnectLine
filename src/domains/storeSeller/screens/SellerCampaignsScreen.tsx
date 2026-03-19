// src/domains/storeSeller/screens/SellerCampaignsScreen.tsx
// 🔒 SATİCI YÖNETİMİ – KAMPANYALAR (UI ONLY)

import { FlatList, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES (UI ONLY)                                                     */
/* ------------------------------------------------------------------ */

type SellerCampaign = {
  id: string;
  title: string;
  status: "active" | "upcoming" | "ended";
};

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI ONLY)                                                 */
/* ------------------------------------------------------------------ */

const MOCK_CAMPAIGNS: SellerCampaign[] = [
  {
    id: "c1",
    title: "Yaz İndirimi",
    status: "active",
  },
  {
    id: "c2",
    title: "Yeni Sezon Lansmanı",
    status: "upcoming",
  },
  {
    id: "c3",
    title: "Kış Kampanyası",
    status: "ended",
  },
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function getStatusLabel(status: SellerCampaign["status"]) {
  switch (status) {
    case "active":
      return "Aktif";
    case "upcoming":
      return "Yaklaşan";
    case "ended":
      return "Geçmiş";
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SellerCampaignsScreen() {
  const T = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Kampanyalar
      </Text>

      <Text style={[styles.subtitle, { color: T.mutedText }]}>
        Aktif ve geçmiş kampanyalarınız
      </Text>

      <FlatList
        data={MOCK_CAMPAIGNS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Text style={[styles.campaignTitle, { color: T.textColor }]}>
              {item.title}
            </Text>

            <Text style={{ color: T.mutedText, marginTop: 6 }}>
              Durum: {getStatusLabel(item.status)}
            </Text>
          </View>
        )}
      />

      <View style={[styles.placeholder, { borderColor: T.border }]}>
        <Text style={[styles.placeholderText, { color: T.mutedText }]}>
          Kampanya oluşturma ve performans{"\n"}
          detayları ilerleyen adımlarda eklenecek
        </Text>
      </View>
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
  campaignTitle: {
    fontSize: 15,
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