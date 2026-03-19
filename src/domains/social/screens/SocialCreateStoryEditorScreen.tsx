// src/domains/social/screens/SocialCreateStoryEditorScreen.tsx
// FAZ 3 – Editor paylaşımı tek kaynağa (addStory) bağlı

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { addStory } from "../services/socialStoryStateService";
import type { SocialStory } from "../types/social.types";

/**
 * 🔒 KURALLAR (KİLİTLİ)
 * - UI-only (servis yok)
 * - Metin ekleme (story text note)
 * - Gizli / Açık görünürlük
 * - Müzik ekli ise preview gösterilir (min 20sn kuralı B adımında kilitli)
 * - Paylaşım öncesi SON adım
 * - Avatarlar kare + yumuşak köşe (editor preview)
 */

type Visibility = "public" | "hidden";

type SelectedMusic = {
  title: string;
  artist?: string;
  durationSec: number;
} | null;

/* ------------------------------------------------------------------ */
/* MOCK INPUT (ÜST ADIMLARDAN GELMİŞ GİBİ)                             */
/* ------------------------------------------------------------------ */

const MOCK_SELECTED_MUSIC: SelectedMusic = {
  title: "Lo-Fi Chill",
  artist: "Various",
  durationSec: 25,
};

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

const CURRENT_USER = { userId: "u1", username: "Sosyal Kullanıcı" };

export default function SocialCreateStoryEditorScreen() {
  const T = useAppTheme();
  const navigation = useNavigation();

  const [textNote, setTextNote] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [music] = useState<SelectedMusic>(MOCK_SELECTED_MUSIC);

  const visibilityLabel = useMemo(
    () =>
      visibility === "public"
        ? t("social.story.visibilityPublic")
        : t("social.story.visibilityPrivate"),
    [visibility]
  );

  function toggleVisibility() {
    setVisibility((v) => (v === "public" ? "hidden" : "public"));
  }

  function onShare() {
    const story: SocialStory = {
      id: `story_${Date.now()}`,
      userId: CURRENT_USER.userId,
      username: CURRENT_USER.username,
      userAvatarUri: null,
      media: null,
      textNote: textNote || undefined,
      music: music
        ? {
            id: "music_1",
            title: music.title,
            artist: music.artist,
            durationSec: music.durationSec,
          }
        : undefined,
      visibility: visibility as "public" | "hidden",
      createdAt: new Date().toISOString(),
    };
    addStory(story);
    navigation.goBack();
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: T.backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ================= HEADER ================= */}
      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <Text style={{ color: T.textColor, fontWeight: "900", fontSize: 18 }}>
          {t("social.story.editTitle")}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleVisibility}
          style={[
            styles.visibilityBtn,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
            },
          ]}
        >
          <Ionicons
            name={visibility === "public" ? "globe-outline" : "lock-closed-outline"}
            size={16}
            color={T.textColor}
          />
          <Text style={{ color: T.textColor, fontWeight: "900" }}>
            {visibilityLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= PREVIEW ================= */}
      <View
        style={[
          styles.previewBox,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        {/* kare + yumuşak avatar */}
        <View
          style={[
            styles.previewAvatar,
            { backgroundColor: T.backgroundColor, borderColor: T.border },
          ]}
        >
          <Ionicons name="person" size={18} color={T.textColor} />
        </View>

        {!!textNote ? (
          <Text
            style={{
              color: T.textColor,
              fontWeight: "900",
              fontSize: 18,
              textAlign: "center",
              marginTop: 12,
            }}
            numberOfLines={4}
          >
            {textNote}
          </Text>
        ) : (
          <Text
            style={{
              color: T.mutedText,
              fontWeight: "800",
              marginTop: 12,
            }}
          >
            {t("social.story.addNote")}
          </Text>
        )}

        {!!music && (
          <View style={styles.musicRow}>
            <Ionicons name="musical-notes" size={16} color={T.textColor} />
            <Text style={{ color: T.textColor, fontWeight: "800" }}>
              {music.title}
              {music.artist ? ` • ${music.artist}` : ""}
            </Text>
          </View>
        )}
      </View>

      {/* ================= TEXT INPUT ================= */}
      <View style={styles.inputWrap}>
        <TextInput
          placeholder={t("social.story.addNote")}
          placeholderTextColor={T.mutedText}
          value={textNote}
          onChangeText={setTextNote}
          multiline
          maxLength={140}
          style={[
            styles.input,
            {
              color: T.textColor,
              backgroundColor: T.cardBg,
              borderColor: T.border,
            },
          ]}
        />
        <Text style={{ color: T.mutedText, alignSelf: "flex-end", marginTop: 6 }}>
          {textNote.length}/140
        </Text>
      </View>

      {/* ================= SHARE ================= */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onShare}
        style={[styles.shareBtn, { backgroundColor: T.accent }]}
      >
        <Ionicons name="send" size={18} color={T.cardBg} />
        <Text style={{ color: T.cardBg, fontWeight: "900" }}>
          {t("social.story.shareStoryBtn")}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  visibilityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },

  previewBox: {
    margin: 16,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },

  previewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14, // 🔒 kare + yumuşak
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  musicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },

  inputWrap: {
    paddingHorizontal: 16,
  },

  input: {
    minHeight: 90,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 18,
  },

  shareBtn: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
});