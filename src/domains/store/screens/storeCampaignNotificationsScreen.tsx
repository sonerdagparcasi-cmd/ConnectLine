// src/domains/store/screens/storeCampaignNotificationsScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { storeCampaignService } from "../services/storeCampaignService";

type Notif = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export default function StoreCampaignNotificationsScreen() {
  const T = useAppTheme();
  const nav = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const list = await storeCampaignService.getNotifications();
      setItems(list as unknown as Notif[]);
    } catch {
      setError("Bildirimler yüklenemedi.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title="Kampanya Bildirimleri"
        onBack={() => nav.goBack()}
        right={
          <TouchableOpacity onPress={load} style={{ padding: 8 }} activeOpacity={0.9}>
            <Ionicons name="refresh" size={18} color={T.isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        }
      />

      {loading && (
        <View style={styles.center}>
          <Text style={[styles.muted, { color: T.mutedText }]}>Yükleniyor…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={[styles.error, { color: T.textColor }]}>{error}</Text>
          <TouchableOpacity
            onPress={load}
            style={[styles.retry, { borderColor: T.border }]}
            activeOpacity={0.9}
          >
            <Text style={[styles.retryText, { color: T.textColor }]}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={items.length === 0 ? { flex: 1 } : undefined}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.muted, { color: T.mutedText }]}>Bildirim yok.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}>
              <Text style={[styles.cardTitle, { color: T.textColor }]}>{item.title}</Text>
              <Text style={[styles.cardBody, { color: T.mutedText }]}>{item.body}</Text>
              <Text style={[styles.date, { color: T.mutedText }]}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 14, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "900" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { fontSize: 12, fontWeight: "800" },
  error: { fontSize: 13, fontWeight: "900", textAlign: "center" },
  retry: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  retryText: { fontSize: 12, fontWeight: "900" },

  card: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10, gap: 6 },
  cardTitle: { fontSize: 13, fontWeight: "900" },
  cardBody: { fontSize: 12, fontWeight: "800", lineHeight: 16 },
  date: { fontSize: 11, fontWeight: "800" },
});