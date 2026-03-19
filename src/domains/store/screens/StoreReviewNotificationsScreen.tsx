// src/domains/store/screens/StoreReviewNotificationsScreen.tsx
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import {
  StoreReviewNotification,
  storeReviewNotificationService,
} from "../services/storeReviewNotificationService";

export default function StoreReviewNotificationsScreen() {
  const T = useAppTheme();
  const [items, setItems] = useState<StoreReviewNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const list = await storeReviewNotificationService.getNotifications();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <Text style={[styles.title, { color: T.textColor }]}>
        Yorum Bildirimleri
      </Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.center}>
              <Text style={{ color: T.mutedText }}>Bildirim yok.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Text style={{ color: T.textColor, fontWeight: "900" }}>
              {item.title}
            </Text>

            <Text style={{ color: T.mutedText, fontWeight: "800" }}>
              {item.body}
            </Text>

            <Text
              style={{
                color: T.mutedText,
                fontWeight: "800",
                fontSize: 11,
              }}
            >
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "900", marginBottom: 10 },
  center: { paddingVertical: 40, alignItems: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
});