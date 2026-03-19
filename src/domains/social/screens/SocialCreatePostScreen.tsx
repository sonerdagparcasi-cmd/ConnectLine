// src/domains/social/screens/SocialCreatePostScreen.tsx
// 🔒 SOCIAL CREATE POST – FINAL
// UPDATED:
// - Global Header
// - SafeArea
// - Scroll uyumu
// - Feed payload değişmedi

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

import SocialScreenLayout from "../components/SocialScreenLayout";

import {
  addFeedPost,
  canCreatePost,
  recordPostCreated,
} from "../services/socialFeedStateService";
import { MOCK_TRACKS } from "../services/socialMockData";
import { socialMusicService } from "../services/socialMusicService";

import type {
  SocialMediaItem,
  SocialPost,
  SocialVisibility,
} from "../types/social.types";

/* ------------------------------------------------------------------ */

type PickedMedia = {
  id: string;
  uri: string;
  type: "image" | "video";
};

/* ------------------------------------------------------------------ */

export default function SocialCreatePostScreen() {
  const T = useAppTheme();
  const navigation = useNavigation();

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const track = useMemo(
    () => MOCK_TRACKS.find((t) => t.id === selectedTrackId) ?? null,
    [selectedTrackId]
  );

  /* ------------------------------------------------------------------ */
  /* MEDIA PICK                                                         */
  /* ------------------------------------------------------------------ */

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert("İzin gerekli");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (res.canceled) return;

    const picked: PickedMedia[] = res.assets.map((a, i) => ({
      id: `${Date.now()}_${i}`,
      uri: a.uri,
      type: a.type === "video" ? "video" : "image",
    }));

    setMedia((prev) => [...prev, ...picked]);
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();

    if (!perm.granted) {
      Alert.alert("Kamera izni gerekli");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.9,
    });

    if (res.canceled) return;

    const a = res.assets[0];

    setMedia((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        uri: a.uri,
        type: a.type === "video" ? "video" : "image",
      },
    ]);
  }

  function removeMedia(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  /* ------------------------------------------------------------------ */
  /* MUSIC                                                              */
  /* ------------------------------------------------------------------ */

  function pickMusic() {
    const t = MOCK_TRACKS[0];

    try {
      socialMusicService.ensureMinDuration(t);
      setSelectedTrackId(t.id);
    } catch (e: any) {
      Alert.alert("Kural", e?.message ?? "Müzik seçilemedi.");
    }
  }

  function clearMusic() {
    setSelectedTrackId(null);
  }

  /* ------------------------------------------------------------------ */
  /* SHARE                                                              */
  /* ------------------------------------------------------------------ */

  function submit() {
    if (!media.length) {
      Alert.alert("En az 1 foto veya video ekleyin");
      return;
    }

    const mediaItems: SocialMediaItem[] = media.map((m) => ({
      id: m.id,
      uri: m.uri,
      type: m.type,
    }));

    const payload: SocialPost = {
      id: `sp_${Date.now()}`,
      userId: "u1",
      username: "Sosyal Kullanıcı",

      createdAt: new Date().toISOString(),

      caption: caption.trim(),

      media: mediaItems,

      visibility: "public" as SocialVisibility,

      likeCount: 0,
      commentCount: 0,
      likedByMe: false,

      music: track
        ? {
            id: track.id,
            title: track.title,
            artist: track.artist,
            durationSec: track.durationSec,
          }
        : null,
    };

    if (!canCreatePost()) {
      Alert.alert(t("social.notifications"), t("social.restricted"));
      return;
    }
    addFeedPost(payload);
    recordPostCreated();

    navigation.goBack();
  }

  /* ------------------------------------------------------------------ */

  return (
    <SocialScreenLayout title="Paylaşım Oluştur">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Bir şeyler yaz..."
          placeholderTextColor={T.mutedText}
          multiline
          style={[
            styles.caption,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
              color: T.textColor,
            },
          ]}
        />

        {/* MEDIA ACTIONS */}

        <View style={styles.row}>
          <TouchableOpacity onPress={pickFromCamera} style={styles.actionBtn}>
            <Ionicons name="camera" size={20} />
            <Text>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickFromGallery} style={styles.actionBtn}>
            <Ionicons name="images" size={20} />
            <Text>Galeri</Text>
          </TouchableOpacity>
        </View>

        {/* MEDIA PREVIEW */}

        {!!media.length && (
          <View style={styles.mediaGrid}>
            {media.map((m) => (
              <View key={m.id} style={styles.thumb}>
                <Image source={{ uri: m.uri }} style={styles.thumbImg} />

                <TouchableOpacity
                  onPress={() => removeMedia(m.id)}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* MUSIC */}

        <TouchableOpacity onPress={pickMusic} style={styles.btn}>
          <Text>🎵 Müzik Ekle</Text>
        </TouchableOpacity>

        {track && (
          <TouchableOpacity onPress={clearMusic} style={styles.btnGhost}>
            <Text>Müzüğü kaldır</Text>
          </TouchableOpacity>
        )}

        {/* SHARE */}

        <TouchableOpacity
          onPress={submit}
          style={[styles.btnPrimary, { backgroundColor: T.accent }]}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>Paylaş</Text>
        </TouchableOpacity>
      </ScrollView>
    </SocialScreenLayout>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  caption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    minHeight: 90,
  },

  row: { flexDirection: "row", gap: 10, marginTop: 16 },

  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },

  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  thumb: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },

  thumbImg: { width: "100%", height: "100%" },

  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },

  btn: { marginTop: 16, padding: 14, borderWidth: 1, borderRadius: 12 },

  btnGhost: {
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },

  btnPrimary: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
});