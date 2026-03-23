// src/domains/corporate/screens/CorporateNotificationsPlaceholderScreen.tsx
// Faz 3 — bildirim merkezi için yer tutucu; veri corporateNotificationService’ten

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import {
  getCorporateNotifications,
  markAllCorporateNotificationsRead,
  subscribeCorporateNotifications,
} from "../services/corporateNotificationService";
import type { CorporateStackParamList } from "../navigation/CorporateNavigator";

type Nav = NativeStackNavigationProp<CorporateStackParamList>;

export default function CorporateNotificationsPlaceholderScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [, bump] = useState(0);

  useEffect(() => {
    return subscribeCorporateNotifications(() => bump((n) => n + 1));
  }, []);

  const items = getCorporateNotifications();

  const onMarkAll = useCallback(() => {
    markAllCorporateNotificationsRead();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title={t("corporate.notifications.title")}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={onMarkAll} accessibilityRole="button">
          <Text style={{ color: T.accent, fontWeight: "800" }}>
            {t("corporate.notifications.markAllRead")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {items.length === 0 ? (
          <Text style={[styles.empty, { color: T.mutedText }]}>
            {t("corporate.notifications.empty")}
          </Text>
        ) : (
          items.map((n) => (
            <View
              key={n.id}
              style={[
                styles.row,
                {
                  borderColor: T.border,
                  backgroundColor: T.cardBg,
                  opacity: n.read ? 0.65 : 1,
                },
              ]}
            >
              <Text style={{ color: T.textColor, fontWeight: "800" }}>{n.title}</Text>
              <Text style={{ color: T.mutedText, marginTop: 4 }}>{n.body}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "flex-end",
  },
  empty: {
    textAlign: "center",
    marginTop: 32,
    fontWeight: "600",
  },
  row: {
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
});
