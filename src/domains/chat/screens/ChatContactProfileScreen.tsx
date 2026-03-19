// src/domains/chat/screens/ChatContactProfileScreen.tsx
// Contact profile: avatar, name, about, shared media, mute, block, report

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { chatSettingsService } from "../services/chatSettingsService";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";

type Params = { userId: string; displayName?: string; avatarUri?: string };

const MOCK_ABOUT = "Hey there! I am using ConnectLine.";
const MOCK_MEDIA = [
  { id: "1", uri: "https://picsum.photos/200", type: "image" as const },
  { id: "2", uri: "https://picsum.photos/201", type: "image" as const },
];

export default function ChatContactProfileScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId, displayName, avatarUri } = (route.params ?? {}) as Params;
  const isOwnProfile = userId === "me";

  const [muted, setMuted] = useState(() =>
    userId ? chatSettingsService.isMuted(userId) : false
  );
  const [blocked, setBlocked] = useState(() =>
    userId ? chatSettingsService.isBlocked(userId) : false
  );

  useEffect(() => {
    if (userId) setBlocked(chatSettingsService.isBlocked(userId));
  }, [userId]);

  useEffect(() => {
    if (userId) setMuted(chatSettingsService.isMuted(userId));
  }, [userId]);

  const name = displayName ?? "Contact";

  function handleBlockToggle() {
    if (!userId) return;
    if (blocked) {
      chatSettingsService.unblockUser(userId);
      setBlocked(false);
    } else {
      Alert.alert(
        t("chat.profile.block"),
        t("chat.profile.blockConfirm"),
        [
          { text: t("chat.profile.cancel"), style: "cancel" },
          {
            text: t("chat.profile.block"),
            style: "destructive",
            onPress: () => {
              chatSettingsService.blockUser(userId);
              setBlocked(true);
            },
          },
        ]
      );
    }
  }

  function handleMuteToggle(value: boolean) {
    if (!userId) return;
    setMuted(value);
    if (value) chatSettingsService.muteUser(userId);
    else chatSettingsService.unmuteUser(userId);
  }

  function handleReport() {
    Alert.alert(
      t("chat.profile.report"),
      t("chat.profile.reportConfirm"),
      [
        { text: t("chat.profile.cancel"), style: "cancel" },
        {
          text: t("chat.profile.report"),
          style: "destructive",
          onPress: () => {
            Alert.alert(t("chat.profile.report"), t("chat.profile.reportSent"));
          },
        },
      ]
    );
  }

  const gradientColors = T.isDark ? T.darkGradient.colors : T.lightGradient.colors;

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader title={name} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={gradientColors} style={styles.avatarSection}>
          <View style={[styles.avatarWrap, { backgroundColor: T.cardBg }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={64} color={T.mutedText} />
            )}
          </View>
          <Text style={[styles.name, { color: T.textColor }]}>{name}</Text>
          <Text style={[styles.about, { color: T.mutedText }]}>
            {t("chat.profile.about")}: {MOCK_ABOUT}
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: T.mutedText }]}>
            {t("chat.profile.sharedMedia")}
          </Text>
          {MOCK_MEDIA.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaRow}>
              {MOCK_MEDIA.map((m) => (
                <TouchableOpacity key={m.id} style={[styles.mediaThumb, { backgroundColor: T.cardBg, borderColor: T.border }]}>
                  <Image source={{ uri: m.uri }} style={styles.mediaImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.mediaPlaceholder, { color: T.mutedText }]}>
              {t("chat.profile.noMediaShared")}
            </Text>
          )}
        </View>

        {!isOwnProfile && (
          <>
            <View style={[styles.row, { borderColor: T.border }]}>
              <Text style={[styles.rowLabel, { color: T.textColor }]}>
                {muted ? t("chat.profile.unmute") : t("chat.profile.mute")}
              </Text>
              <Switch
                value={muted}
                onValueChange={handleMuteToggle}
                trackColor={{ false: T.border, true: T.accent }}
                thumbColor={C.buttonText}
              />
            </View>
            <TouchableOpacity
              style={[styles.row, { borderColor: T.border }]}
              onPress={handleBlockToggle}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: blocked ? T.accent : T.textColor }]}>
                {blocked ? t("chat.profile.unblock") : t("chat.profile.block")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.row, { borderColor: T.border }]}
              onPress={handleReport}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: C.danger }]}>
                {t("chat.profile.report")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  scroll: { paddingBottom: 40 },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  name: { fontSize: 20, fontWeight: "800", marginTop: 12 },
  about: { fontSize: 14, marginTop: 8, paddingHorizontal: 24, textAlign: "center" },
  section: { padding: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 10 },
  mediaRow: { flexDirection: "row", gap: 8 },
  mediaPlaceholder: { fontSize: 14, fontStyle: "italic" },
  mediaThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  mediaImg: { width: "100%", height: "100%" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 56,
    borderBottomWidth: 1,
  },
  rowLabel: { fontSize: 15, fontWeight: "600" },
});
