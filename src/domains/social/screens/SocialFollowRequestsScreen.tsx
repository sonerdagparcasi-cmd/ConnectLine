// src/domains/social/screens/SocialFollowRequestsScreen.tsx
// Gelen takip istekleri — Kabul / Yok Say

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialScreenLayout from "../components/SocialScreenLayout";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import type { FollowRequest } from "../services/socialFollowService";
import {
  acceptFollowRequest,
  getFollowRequests,
  rejectFollowRequest,
  subscribeFollow,
} from "../services/socialFollowService";
import { getUserDisplay } from "../story/services/socialStoryStateService";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

function loadRequests() {
  return getFollowRequests("me");
}

export default function SocialFollowRequestsScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [requests, setRequests] = useState<FollowRequest[]>(() => loadRequests());

  useEffect(() => {
    setRequests(loadRequests());
  }, []);

  useEffect(() => {
    const unsub = subscribeFollow(() => {
      setRequests(loadRequests());
    });
    return unsub;
  }, []);

  const openProfile = useCallback(
    (userId: string) => {
      navigation.navigate("SocialProfileContainer", { userId });
    },
    [navigation]
  );

  const onAccept = useCallback((id: string) => {
    acceptFollowRequest(id);
    setRequests(loadRequests());
  }, []);

  const onReject = useCallback((id: string) => {
    rejectFollowRequest(id);
    setRequests(loadRequests());
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FollowRequest }) => {
      const display = getUserDisplay(item.fromUserId);
      const username = display.username || item.fromUserId;

      return (
        <View style={[styles.row, { borderBottomColor: T.border }]}>
          <TouchableOpacity
            style={styles.rowMain}
            activeOpacity={0.7}
            onPress={() => openProfile(item.fromUserId)}
          >
            {display.avatarUri ? (
              <Image source={{ uri: display.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: T.cardBg }]}>
                <Text style={{ color: T.mutedText }}>👤</Text>
              </View>
            )}
            <Text style={[styles.username, { color: T.textColor }]} numberOfLines={1}>
              {username}
            </Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.65}
              style={[styles.btn, styles.btnPrimary, { backgroundColor: T.accent }]}
              onPress={() => onAccept(item.id)}
            >
              <Text style={styles.btnPrimaryText}>{t("social.followRequestAccept")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.65}
              style={[styles.btn, styles.btnGhost, { borderColor: T.border }]}
              onPress={() => onReject(item.id)}
            >
              <Text style={[styles.btnGhostText, { color: T.mutedText }]}>
                {t("social.followRequestDismiss")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [T, onAccept, onReject, openProfile]
  );

  const keyExtractor = useCallback((item: FollowRequest) => item.id, []);

  if (requests.length === 0) {
    return (
      <SocialScreenLayout title={t("social.followRequests")}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: T.mutedText }]}>
            {t("social.empty.followRequests")}
          </Text>
        </View>
      </SocialScreenLayout>
    );
  }

  return (
    <SocialScreenLayout title={t("social.followRequests")} scroll={false}>
      <FlatList
        data={requests}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={12}
      />
    </SocialScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {},
  btnPrimaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  btnGhost: {
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "transparent",
  },
  btnGhostText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyWrap: {
    paddingTop: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
