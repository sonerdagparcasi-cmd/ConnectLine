// src/domains/social/screens/SocialNotificationsScreen.tsx
// FAZ 5 / ADIM 4 — bildirim listesi, odakta okundu işaretleme, tema

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

import SocialScreenLayout from "../components/SocialScreenLayout";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import {
  applySocialNotificationNavigation,
  socialNotificationService,
} from "../services/socialNotificationService";
import type { SocialNotification } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

export default function SocialNotificationsScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [list, setList] = useState(() => socialNotificationService.getAll());

  useEffect(() => {
    const interval = setInterval(() => {
      setList([...socialNotificationService.getAll()]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      socialNotificationService.markAllAsRead();
    }, [])
  );

  const openRow = useCallback(
    (n: SocialNotification) => {
      socialNotificationService.markAsRead(n.id);
      if (
        applySocialNotificationNavigation(n, (screen, params) => {
          (navigation as { navigate: (s: string, p?: object) => void }).navigate(
            screen,
            params
          );
        })
      ) {
        return;
      }
      const pid = n.targetPostId ?? n.postId;
      if (pid) {
        navigation.navigate("SocialPostDetail", { postId: pid });
        return;
      }
      if (n.actorUserId) {
        navigation.navigate("SocialProfileContainer", { userId: n.actorUserId });
      }
    },
    [navigation]
  );

  if (list.length === 0) {
    return (
      <SocialScreenLayout
        title={t("social.notifications")}
        showNotificationBell={false}
      >
        <View style={styles.emptyRoot}>
          <Text style={[styles.emptyTitle, { color: T.textColor }]}>
            {t("social.notifications")}
          </Text>
          <Text style={[styles.emptySub, { color: T.mutedText }]}>
            {t("social.empty.notifications")}
          </Text>
        </View>
      </SocialScreenLayout>
    );
  }

  return (
    <SocialScreenLayout
      title={t("social.notifications")}
      showNotificationBell={false}
    >
      {list.map((n) => (
        <TouchableOpacity
          key={n.id}
          activeOpacity={0.75}
          onPress={() => openRow(n)}
          style={[
            styles.row,
            {
              borderBottomColor: T.border,
              backgroundColor: n.read ? "transparent" : T.accent + "12",
            },
          ]}
        >
          <Text style={[styles.line, { color: T.textColor }]}>
            <Text style={styles.name}>{n.actorUsername}</Text>
            {" "}
            {t(n.text)}
          </Text>
          <Text style={[styles.time, { color: T.mutedText }]}>
            {new Date(n.createdAt).toLocaleString()}
          </Text>
        </TouchableOpacity>
      ))}
    </SocialScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  line: {
    fontSize: 15,
    fontWeight: "500",
  },
  name: {
    fontWeight: "700",
  },
  time: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.85,
  },
  emptyRoot: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptySub: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
