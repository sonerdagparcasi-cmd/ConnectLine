// src/domains/social/screens/SocialEditPostScreen.tsx
// Paylaşım düzenleme — tek kaynak: socialFeedStateService

import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { StackActions, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialScreenLayout from "../components/SocialScreenLayout";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import {
  archiveFeedPost,
  getPostById,
  removeFeedPost,
  subscribeFeed,
  unarchiveFeedPost,
  updateFeedPost,
} from "../services/socialFeedStateService";
import { MOCK_TRACKS } from "../services/socialMockData";
import type { SocialPost, SocialVisibility } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;
type R = RouteProp<SocialStackParamList, "SocialEditPost">;

const VIS_OPTIONS: { value: SocialVisibility; label: string }[] = [
  { value: "public", label: "Herkese açık" },
  { value: "followers", label: "Takipçiler" },
  { value: "private", label: "Özel" },
  { value: "hidden", label: "Gizli" },
];

function extractMentions(text: string): string[] {
  const re = /@([a-zA-Z0-9ğüşıöçĞÜŞİÖÇ._]+)/g;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    seen.add(m[1]);
  }
  return [...seen];
}

function extractHashtags(text: string): string[] {
  const re = /#([\wğüşıöçĞÜŞİÖÇ]+)/g;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    seen.add(m[1].toLowerCase());
  }
  return [...seen];
}

function commentsEnabledFromPost(p: SocialPost | undefined): boolean {
  if (!p?.settings) return true;
  const v = p.settings.commentsEnabled ?? p.settings.comments;
  return v !== false;
}

export default function SocialEditPostScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { postId } = useRoute<R>().params;

  const [post, setPost] = useState<SocialPost | undefined>(() => getPostById(postId));
  const [caption, setCaption] = useState(() => getPostById(postId)?.caption ?? "");
  const [visibility, setVisibility] = useState<SocialVisibility>(
    () => getPostById(postId)?.visibility ?? "public"
  );
  const [commentsOn, setCommentsOn] = useState(() =>
    commentsEnabledFromPost(getPostById(postId))
  );
  const [likesVisible, setLikesVisible] = useState(
    () => getPostById(postId)?.settings?.likesVisible !== false
  );
  const [coverIndex, setCoverIndex] = useState(() => {
    const p = getPostById(postId);
    const n = p?.media?.length ?? 0;
    const c = p?.coverIndex ?? 0;
    return n === 0 ? 0 : Math.min(Math.max(0, c), n - 1);
  });
  const [musicTrackId, setMusicTrackId] = useState<string | null>(
    () => getPostById(postId)?.music?.id ?? null
  );

  useEffect(() => {
    const sync = () => {
      const p = getPostById(postId);
      setPost(p);
      if (!p) return;
      setCaption(p.caption);
      setVisibility(p.visibility);
      setCommentsOn(commentsEnabledFromPost(p));
      setLikesVisible(p.settings?.likesVisible !== false);
      const n = p.media?.length ?? 0;
      const c = p.coverIndex ?? 0;
      setCoverIndex(n === 0 ? 0 : Math.min(Math.max(0, c), n - 1));
      setMusicTrackId(p.music?.id ?? null);
    };
    sync();
    return subscribeFeed(sync);
  }, [postId]);

  const track = useMemo(
    () => MOCK_TRACKS.find((x) => x.id === musicTrackId) ?? null,
    [musicTrackId]
  );

  const bumpCover = useCallback(
    (delta: number) => {
      const n = post?.media?.length ?? 0;
      if (n === 0) return;
      setCoverIndex((i) => Math.min(Math.max(0, i + delta), n - 1));
    },
    [post?.media?.length]
  );

  const cycleMusic = useCallback(() => {
    if (!MOCK_TRACKS.length) return;
    const idx = musicTrackId
      ? MOCK_TRACKS.findIndex((x) => x.id === musicTrackId)
      : -1;
    const next = MOCK_TRACKS[(idx + 1) % MOCK_TRACKS.length];
    setMusicTrackId(next.id);
  }, [musicTrackId]);

  function save() {
    if (!post) return;
    if (post.event) {
      Alert.alert("Bilgi", "Etkinlik kartları bu ekrandan düzenlenemez.");
      return;
    }
    const trimmed = caption.trim();
    const mentions = extractMentions(trimmed);
    const hashtags = extractHashtags(trimmed);

    updateFeedPost(postId, {
      caption: trimmed,
      mentions,
      hashtags,
      visibility,
      coverIndex: post.media?.length ? coverIndex : 0,
      settings: {
        comments: commentsOn,
        commentsEnabled: commentsOn,
        likesVisible,
      },
      music: track
        ? {
            id: track.id,
            title: track.title,
            artist: track.artist,
            durationSec: track.durationSec,
          }
        : null,
    });
    navigation.goBack();
  }

  function confirmArchive() {
    Alert.alert(
      "Arşivle",
      "Gönderi akış ve profilden kaldırılır; istediğiniz zaman düzenleyerek geri alabilirsiniz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Arşivle",
          style: "default",
          onPress: () => {
            archiveFeedPost(postId);
            navigation.goBack();
          },
        },
      ],
      { cancelable: true }
    );
  }

  function confirmUnarchive() {
    Alert.alert(
      "Arşivden çıkar",
      "Gönderi tekrar akış ve profilde görünecek.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Tamam",
          onPress: () => unarchiveFeedPost(postId),
        },
      ],
      { cancelable: true }
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Paylaşımı sil",
      "Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            removeFeedPost(postId);
            navigation.dispatch(StackActions.pop(2));
          },
        },
      ],
      { cancelable: true }
    );
  }

  if (!post) {
    return (
      <SocialScreenLayout title="Düzenle">
        <View style={{ padding: 20 }}>
          <Text style={{ color: T.mutedText }}>Gönderi bulunamadı.</Text>
        </View>
      </SocialScreenLayout>
    );
  }

  if (post.event) {
    return (
      <SocialScreenLayout title="Düzenle">
        <View style={{ padding: 20 }}>
          <Text style={{ color: T.textColor }}>
            Etkinlik gönderileri buradan düzenlenmez.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: T.primary, fontWeight: "700" }}>Geri</Text>
          </TouchableOpacity>
        </View>
      </SocialScreenLayout>
    );
  }

  const media = post.media ?? [];
  const archived = !!post.archived;

  return (
    <SocialScreenLayout title="Gönderiyi düzenle" scroll>
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: T.backgroundColor }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.statusLine, { color: T.mutedText }]}>
          Durum: {archived ? "Arşivde" : "Yayında"}
        </Text>

        <Text style={[styles.label, { color: T.mutedText }]}>Açıklama</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          multiline
          placeholder="Açıklama..."
          placeholderTextColor={T.mutedText}
          style={[
            styles.caption,
            {
              color: T.textColor,
              borderColor: T.border,
              backgroundColor: T.cardBg,
            },
          ]}
        />
        <Text style={[styles.hint, { color: T.mutedText }]}>
          @kullanıcı ve #etiketler kaydederken açıklamadan otomatik çıkarılır.
        </Text>

        <Text style={[styles.label, { color: T.mutedText, marginTop: 16 }]}>Medya</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
          {media.map((m, i) => (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.85}
              onPress={() => setCoverIndex(i)}
              style={[
                styles.thumb,
                {
                  borderColor: i === coverIndex ? T.primary : T.border,
                  borderWidth: i === coverIndex ? 2 : 1,
                },
              ]}
            >
              <Image source={{ uri: m.uri }} style={styles.thumbImg} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.rowBetween}>
          <Text style={{ color: T.textColor, fontWeight: "600" }}>Kapak sırası</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => bumpCover(-1)}
              style={[styles.stepBtn, { borderColor: T.border }]}
            >
              <Ionicons name="remove" size={18} color={T.textColor} />
            </TouchableOpacity>
            <Text style={{ color: T.textColor, fontWeight: "700", minWidth: 28, textAlign: "center" }}>
              {media.length ? coverIndex + 1 : 0}
            </Text>
            <TouchableOpacity
              onPress={() => bumpCover(1)}
              style={[styles.stepBtn, { borderColor: T.border }]}
            >
              <Ionicons name="add" size={18} color={T.textColor} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.hint, { color: T.mutedText }]}>
          Küçük önizlemeye dokunarak kapak görselini seçin. Video kare süreleri oluşturma akışında
          ayarlanır; mevcut değerler korunur.
        </Text>

        <Text style={[styles.label, { color: T.mutedText, marginTop: 16 }]}>Görünürlük</Text>
        <View style={styles.chipWrap}>
          {VIS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setVisibility(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: visibility === opt.value ? T.primary : T.cardBg,
                  borderColor: T.border,
                },
              ]}
            >
              <Text
                style={{
                  color: visibility === opt.value ? "#fff" : T.textColor,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, { borderColor: T.border, backgroundColor: T.cardBg }]}>
          <View style={styles.switchRow}>
            <Text style={{ color: T.textColor, flex: 1 }}>Yorumlar</Text>
            <Switch value={commentsOn} onValueChange={setCommentsOn} />
          </View>
          <View style={[styles.hr, { backgroundColor: T.border }]} />
          <View style={styles.switchRow}>
            <Text style={{ color: T.textColor, flex: 1 }}>Beğeni sayısı görünsün</Text>
            <Switch value={likesVisible} onValueChange={setLikesVisible} />
          </View>
        </View>

        <Text style={[styles.label, { color: T.mutedText, marginTop: 16 }]}>Müzik</Text>
        <View style={[styles.musicRow, { borderColor: T.border, backgroundColor: T.cardBg }]}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            onPress={cycleMusic}
            activeOpacity={0.85}
          >
            <Ionicons name="musical-notes" size={18} color={T.textColor} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              {track ? (
                <>
                  <Text style={{ color: T.textColor, fontWeight: "600" }} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={{ color: T.mutedText, fontSize: 12 }} numberOfLines={1}>
                    {track.artist ?? "—"}
                  </Text>
                </>
              ) : (
                <Text style={{ color: T.mutedText }}>Müzik yok — dokunarak seç</Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMusicTrackId(null)} hitSlop={8}>
            <Text style={{ color: T.mutedText, fontSize: 12 }}>Kaldır</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: T.primary }]}
          onPress={save}
        >
          <Text style={styles.saveBtnText}>Kaydet</Text>
        </TouchableOpacity>

        {archived ? (
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: T.border }]}
            onPress={confirmUnarchive}
          >
            <Text style={[styles.secondaryBtnText, { color: T.textColor }]}>Arşivden çıkar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: T.border }]}
            onPress={confirmArchive}
          >
            <Text style={[styles.secondaryBtnText, { color: T.textColor }]}>Arşivle</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteBtnText}>Paylaşımı Sil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SocialScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  statusLine: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  caption: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  strip: {
    marginBottom: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 8,
    overflow: "hidden",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 11,
    marginTop: 8,
    lineHeight: 15,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  card: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  hr: {
    height: StyleSheet.hairlineWidth,
  },
  musicRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontWeight: "700",
    fontSize: 14,
  },
  deleteBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14,
  },
});
