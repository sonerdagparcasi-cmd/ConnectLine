// src/domains/social/screens/SocialCreatePostScreen.tsx
// 🔒 SOCIAL CREATE POST – FINAL
// UPDATED:
// - Global Header
// - SafeArea
// - Scroll uyumu
// - Feed payload değişmedi
// - FAZ 4: tam ekran medya editörü + Reanimated / Gesture Handler overlay metin

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  TouchableOpacity as GHTouchableOpacity,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";

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
  SocialPostShareSettings,
  SocialVisibility,
} from "../types/social.types";

/* ------------------------------------------------------------------ */

const OVERLAY_SCALE_MIN = 0.6;
const OVERLAY_SCALE_MAX = 3;

function clampScale(s: number) {
  return Math.min(OVERLAY_SCALE_MAX, Math.max(OVERLAY_SCALE_MIN, s));
}

function clampScaleWorklet(s: number) {
  "worklet";
  return Math.min(OVERLAY_SCALE_MAX, Math.max(OVERLAY_SCALE_MIN, s));
}

const OVERLAY_EDIT_COLORS = ["#ffffff", "#00bfff", "#ffd60a", "#ff6b6b"] as const;

function nextOverlayColor(current: string) {
  const n = current.trim().toLowerCase();
  const i = OVERLAY_EDIT_COLORS.findIndex((c) => c === n);
  const next = i >= 0 ? (i + 1) % OVERLAY_EDIT_COLORS.length : 0;
  return OVERLAY_EDIT_COLORS[next];
}

const OVERLAY_DEFAULT_FONT = 20;
const OVERLAY_HEADING_FONT = 26;

/** Caption: satır sonu / imleç öncesi aktif @ veya # token'ı (öneri paneli) */
const CAPTION_MENTION_TAIL_RE = /(^|\s)@([a-zA-Z0-9._çğıöşüÇĞİÖŞÜ]*)$/;
const CAPTION_HASHTAG_TAIL_RE = /(^|\s)#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]*)$/;

/* ------------------------------------------------------------------ */

/** Yatay komşu ile yer değiştirme eşiği (px) — snap hissi */
const REORDER_SNAP_DX = 36;
/** Satır atlayan dikey snap (wrap grid); tam 2D grid reorder için layout ölçümü eklenebilir */
const REORDER_SNAP_DY = 48;
const THUMB_SLOT_PX = 110;
const VIDEO_COVER_FRAME_COUNT = 8;

type PickedMedia = {
  id: string;
  uri: string;
  type: "image" | "video";
};

type DraggableMediaThumbProps = {
  item: PickedMedia;
  index: number;
  isGridCover: boolean;
  isSelected: boolean;
  accentColor: string;
  actionLabelColor: string;
  removeBtnOverlay: string;
  videoCoverDefined: boolean;
  videoCoverFrame: number;
  onThumbPress: () => void;
  onThumbLongPress: () => void;
  onOpenEditor: () => void;
  onRemove: () => void;
  onVideoCoverPress: () => void;
  moveLeft: (i: number) => void;
  moveRight: (i: number) => void;
  onReorderDrop: (i: number, dx: number, dy: number) => void;
  setDraggingIndex: Dispatch<SetStateAction<number | null>>;
};

function DraggableMediaThumb({
  item: m,
  index,
  isGridCover,
  isSelected,
  accentColor,
  actionLabelColor,
  removeBtnOverlay,
  videoCoverDefined,
  videoCoverFrame,
  onThumbPress,
  onThumbLongPress,
  onOpenEditor,
  onRemove,
  onVideoCoverPress,
  moveLeft,
  moveRight,
  onReorderDrop,
  setDraggingIndex,
}: DraggableMediaThumbProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const zBoost = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: zBoost.value,
    elevation: zBoost.value > 1 ? 8 : 0,
  }));

  const longPress = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(440)
        .onStart(() => {
          runOnJS(onThumbLongPress)();
        }),
    [onThumbLongPress]
  );

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        runOnJS(onThumbPress)();
      }),
    [onThumbPress]
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(14)
        .onStart(() => {
          zBoost.value = 24;
          runOnJS(setDraggingIndex)(index);
        })
        .onUpdate((e) => {
          translateX.value = e.translationX;
          translateY.value = e.translationY;
        })
        .onEnd((e) => {
          runOnJS(onReorderDrop)(index, e.translationX, e.translationY);
          translateX.value = withTiming(0, { duration: 200 });
          translateY.value = withTiming(0, { duration: 200 });
          zBoost.value = 1;
          runOnJS(setDraggingIndex)(null);
        }),
    [index, onReorderDrop, setDraggingIndex, translateX, translateY, zBoost]
  );

  /** Önce uzun basma; aksi halde sürükleme öncelikli, hızlı dokunuş = kapak / seçim */
  const thumbGestures = useMemo(
    () => Gesture.Exclusive(longPress, Gesture.Exclusive(pan, tap)),
    [longPress, pan, tap]
  );

  return (
    <View style={styles.thumbCell}>
      <GestureDetector gesture={thumbGestures}>
        <Animated.View
          style={[
            styles.thumb,
            animatedStyle,
            isSelected && { borderColor: accentColor, borderWidth: 1.5 },
          ]}
        >
          <View style={styles.thumbTapArea}>
            <Image source={{ uri: m.uri }} style={styles.thumbImg} />

            {isSelected && <View style={styles.thumbSelectedOverlay} pointerEvents="none" />}

            {isSelected && (
              <View style={[styles.thumbCheckBadge, { borderColor: accentColor }]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}

            {isGridCover && (
              <View style={styles.thumbPostCoverBadge}>
                <Text style={styles.thumbPostCoverBadgeText}>Kapak</Text>
              </View>
            )}
          </View>

          <View style={styles.thumbReorderPill}>
            <TouchableOpacity onPress={() => moveLeft(index)} hitSlop={6}>
              <Text style={styles.thumbReorderGlyph}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => moveRight(index)} hitSlop={6}>
              <Text style={styles.thumbReorderGlyph}>▶</Text>
            </TouchableOpacity>
          </View>

          {m.type === "video" && (
            <TouchableOpacity
              style={styles.thumbVideoCoverBtn}
              onPress={onVideoCoverPress}
              hitSlop={4}
            >
              <Text style={styles.thumbVideoCoverBtnText}>
                {videoCoverDefined ? `Kapak • ${videoCoverFrame + 1}` : "Kapak"}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </GestureDetector>

      <TouchableOpacity
        onPress={onOpenEditor}
        style={[styles.thumbEditBtn, { backgroundColor: removeBtnOverlay }]}
        accessibilityLabel="Düzenle"
        hitSlop={6}
      >
        <Ionicons name="create-outline" size={15} color={actionLabelColor} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRemove}
        style={[styles.removeBtn, { backgroundColor: removeBtnOverlay }]}
        accessibilityLabel="Sil"
        accessibilityRole="button"
      >
        <Ionicons name="trash-outline" size={16} color={actionLabelColor} />
      </TouchableOpacity>
    </View>
  );
}

/* ------------------------------------------------------------------ */

export type OverlayText = {
  id: string;
  mediaIndex: number;
  text: string;
  x: number;
  y: number;
  scale: number;
  color: string;
  /** Başlık aracı: 20 ↔ 26 */
  fontSize?: number;
};

/* ------------------------------------------------------------------ */

function EditorOverlayText({
  item,
  isActive,
  isEditing,
  onSelect,
  onCommit,
  onRequestEdit,
}: {
  item: OverlayText;
  isActive: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onCommit: (id: string, patch: Partial<OverlayText>) => void;
  onRequestEdit: (id: string) => void;
}) {
  const translateX = useSharedValue(item.x);
  const translateY = useSharedValue(item.y);
  const scale = useSharedValue(item.scale);

  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);
  const pinchBaseScale = useSharedValue(1);

  useEffect(() => {
    translateX.value = item.x;
    translateY.value = item.y;
    scale.value = item.scale;
  }, [item.x, item.y, item.scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: translateX.value,
    top: translateY.value,
    transform: [{ scale: scale.value }],
  }));

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isEditing)
        .onBegin(() => {
          runOnJS(onSelect)(item.id);
          panStartX.value = translateX.value;
          panStartY.value = translateY.value;
        })
        .onUpdate((e) => {
          translateX.value = panStartX.value + e.translationX;
          translateY.value = panStartY.value + e.translationY;
        })
        .onEnd(() => {
          runOnJS(onCommit)(item.id, {
            x: translateX.value,
            y: translateY.value,
          });
        }),
    [isEditing, item.id, onSelect, onCommit, panStartX, panStartY, translateX, translateY]
  );

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(!isEditing)
        .onBegin(() => {
          pinchBaseScale.value = scale.value;
        })
        .onUpdate((e) => {
          scale.value = clampScaleWorklet(pinchBaseScale.value * e.scale);
        })
        .onEnd(() => {
          runOnJS(onCommit)(item.id, { scale: scale.value });
        }),
    [isEditing, item.id, onCommit, pinchBaseScale, scale]
  );

  const composed = useMemo(() => Gesture.Simultaneous(pan, pinch), [pan, pinch]);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          animatedStyle,
          styles.editorOverlayTextWrap,
          isActive || isEditing ? styles.editorOverlayTextWrapActive : null,
        ]}
      >
        <GHTouchableOpacity
          activeOpacity={0.88}
          onPress={() => onRequestEdit(item.id)}
        >
          <Text
            style={[
              styles.editorOverlayTextLabel,
              {
                color: item.color,
                fontSize: item.fontSize ?? OVERLAY_DEFAULT_FONT,
              },
            ]}
          >
            {item.text}
          </Text>
        </GHTouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

/* ------------------------------------------------------------------ */

export default function SocialCreatePostScreen() {
  const T = useAppTheme();
  const navigation = useNavigation();

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [texts, setTexts] = useState<OverlayText[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [settings, setSettings] = useState<SocialPostShareSettings>({
    comments: true,
    likesVisible: true,
  });
  const [coverIndex, setCoverIndex] = useState(0);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [videoCovers, setVideoCovers] = useState<Record<string, number>>({});
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [videoCoverEditorIndex, setVideoCoverEditorIndex] = useState<number | null>(null);
  const [pendingCoverFrame, setPendingCoverFrame] = useState(0);

  const mediaRef = useRef<PickedMedia[]>([]);
  mediaRef.current = media;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    setCoverIndex((ci) => {
      if (media.length === 0) return 0;
      return Math.min(Math.max(0, ci), media.length - 1);
    });
  }, [media.length]);

  const [mentionQuery, setMentionQuery] = useState("");
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [tagMode, setTagMode] = useState<"mention" | "hashtag" | null>(null);

  const mentionCandidates = useMemo(
    () => [
      { id: "u1", username: "sosyal_kullanici" },
      { id: "u2", username: "ahmet" },
      { id: "u3", username: "ayse" },
      { id: "u4", username: "tasarimci" },
      { id: "u5", username: "videoedit" },
    ],
    []
  );

  const hashtagCandidates = useMemo(
    () => [
      "günlük",
      "tasarım",
      "video",
      "seyahat",
      "iş",
      "teknoloji",
      "moda",
      "keşfet",
    ],
    []
  );

  const track = useMemo(
    () => MOCK_TRACKS.find((t) => t.id === selectedTrackId) ?? null,
    [selectedTrackId]
  );

  const safeEditorIndex =
    media.length === 0 ? 0 : Math.min(activeMediaIndex, media.length - 1);
  const activeEditorMedia = media[safeEditorIndex];

  const commitOverlay = useCallback((id: string, patch: Partial<OverlayText>) => {
    setTexts((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        if (typeof next.scale === "number") next.scale = clampScale(next.scale);
        return next;
      })
    );
  }, []);

  const editorTextsForSlide = useMemo(
    () => texts.filter((x) => x.mediaIndex === safeEditorIndex),
    [texts, safeEditorIndex]
  );

  const filteredMentions = useMemo(() => {
    if (tagMode !== "mention") return [];
    const q = mentionQuery.trim().toLowerCase();
    return mentionCandidates.filter((u) => u.username.toLowerCase().includes(q)).slice(0, 6);
  }, [tagMode, mentionQuery, mentionCandidates]);

  const filteredHashtags = useMemo(() => {
    if (tagMode !== "hashtag") return [];
    const q = hashtagQuery.trim().toLowerCase();
    return hashtagCandidates.filter((h) => h.toLowerCase().includes(q)).slice(0, 8);
  }, [tagMode, hashtagQuery, hashtagCandidates]);

  function handleCaptionChange(value: string) {
    setCaption(value);

    const lastMentionMatch = value.match(CAPTION_MENTION_TAIL_RE);
    const lastHashtagMatch = value.match(CAPTION_HASHTAG_TAIL_RE);

    if (lastMentionMatch) {
      setTagMode("mention");
      setMentionQuery(lastMentionMatch[2] ?? "");
      setHashtagQuery("");
      return;
    }

    if (lastHashtagMatch) {
      setTagMode("hashtag");
      setHashtagQuery(lastHashtagMatch[2] ?? "");
      setMentionQuery("");
      return;
    }

    setTagMode(null);
    setMentionQuery("");
    setHashtagQuery("");
  }

  function insertMention(username: string) {
    setCaption((prev) => prev.replace(CAPTION_MENTION_TAIL_RE, `$1@${username} `));
    setTagMode(null);
    setMentionQuery("");
  }

  function insertHashtag(tag: string) {
    setCaption((prev) => prev.replace(CAPTION_HASHTAG_TAIL_RE, `$1#${tag} `));
    setTagMode(null);
    setHashtagQuery("");
  }

  function moveLeft(i: number) {
    if (i === 0) return;

    setMedia((prev) => {
      const arr = [...prev];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return arr;
    });

    setCoverIndex((ci) => {
      if (ci === i) return i - 1;
      if (ci === i - 1) return i;
      return ci;
    });
  }

  function moveRight(i: number) {
    setMedia((prev) => {
      if (i === prev.length - 1) return prev;

      const arr = [...prev];
      [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      return arr;
    });

    setCoverIndex((ci) => {
      if (ci === i) return i + 1;
      if (ci === i + 1) return i;
      return ci;
    });
  }

  function swapMediaByIndex(a: number, b: number) {
    setMedia((prev) => {
      if (a < 0 || b < 0 || a >= prev.length || b >= prev.length || a === b) return prev;
      const arr = [...prev];
      [arr[a], arr[b]] = [arr[b], arr[a]];
      return arr;
    });
    setCoverIndex((ci) => {
      if (ci === a) return b;
      if (ci === b) return a;
      return ci;
    });
  }

  function toggleMediaSelection(id: string) {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function clearMediaSelection() {
    setSelectedMediaIds([]);
  }

  function approxGridCols(): number {
    const w = Dimensions.get("window").width;
    return Math.max(1, Math.floor((w - 32) / THUMB_SLOT_PX));
  }

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

    setMedia((prev) => {
      const updated = [...prev, ...picked];
      setActiveMediaIndex(updated.length - 1);
      setEditorVisible(true);
      return updated;
    });
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

    setMedia((prev) => {
      const updated = [
        ...prev,
        {
          id: `${Date.now()}`,
          uri: a.uri,
          type: a.type === "video" ? ("video" as const) : ("image" as const),
        },
      ];
      setActiveMediaIndex(updated.length - 1);
      setEditorVisible(true);
      return updated;
    });
  }

  function removeMedia(removeId: string) {
    setMedia((prev) => {
      const idx = prev.findIndex((m) => m.id === removeId);
      if (idx < 0) return prev;

      setTexts((tp) =>
        tp
          .filter((x) => x.mediaIndex !== idx)
          .map((x) => (x.mediaIndex > idx ? { ...x, mediaIndex: x.mediaIndex - 1 } : x))
      );

      setActiveMediaIndex((i) => {
        const nextLen = prev.length - 1;
        if (nextLen <= 0) return 0;
        if (i === idx) return Math.max(0, Math.min(idx, nextLen - 1));
        if (i > idx) return i - 1;
        return i;
      });

      const newLen = prev.length - 1;
      setCoverIndex((ci) => {
        if (newLen <= 0) return 0;
        if (idx < ci) return ci - 1;
        if (idx === ci) return Math.min(ci, newLen - 1);
        return ci;
      });

      setVideoCovers((vc) => {
        if (!(removeId in vc)) return vc;
        const next = { ...vc };
        delete next[removeId];
        return next;
      });

      setSelectedMediaIds((s) => s.filter((id) => id !== removeId));

      return prev.filter((m) => m.id !== removeId);
    });
  }

  /* ------------------------------------------------------------------ */
  /* MUSIC                                                              */
  /* ------------------------------------------------------------------ */

  function pickMusic() {
    const t0 = MOCK_TRACKS[0];

    try {
      socialMusicService.ensureMinDuration(t0);
      setSelectedTrackId(t0.id);
    } catch (e: any) {
      Alert.alert("Kural", e?.message ?? "Müzik seçilemedi.");
    }
  }

  function clearMusic() {
    setSelectedTrackId(null);
  }

  /**
   * Medya ızgarası reorder: yatay snap + basit satır-atlama (wrap sütun sayısı tahmini).
   * İleride onLayout ile gerçek sütun genişliği ölçülerek 2D slot snap iyileştirilebilir.
   */
  const handleReorderDrop = useCallback((i: number, dx: number, dy: number) => {
    const list = mediaRef.current;
    const n = list.length;
    if (n <= 1) return;

    const cols = approxGridCols();
    const row = Math.floor(i / cols);
    const rows = Math.ceil(n / cols);

    const preferHorizontal = Math.abs(dx) >= Math.abs(dy);

    if (preferHorizontal) {
      if (dx > REORDER_SNAP_DX && i < n - 1) moveRight(i);
      else if (dx < -REORDER_SNAP_DX && i > 0) moveLeft(i);
      return;
    }

    if (dy > REORDER_SNAP_DY && row < rows - 1) {
      const j = i + cols;
      if (j < n) swapMediaByIndex(i, j);
    } else if (dy < -REORDER_SNAP_DY && row > 0) {
      const j = i - cols;
      if (j >= 0) swapMediaByIndex(i, j);
    }
  }, []);

  function openVideoCoverEditor(index: number) {
    const row = media[index];
    if (!row || row.type !== "video") return;
    setPendingCoverFrame(videoCovers[row.id] ?? 0);
    setVideoCoverEditorIndex(index);
  }

  function cancelVideoCoverEditor() {
    setVideoCoverEditorIndex(null);
  }

  function applyVideoCover() {
    if (videoCoverEditorIndex === null) return;
    const item = media[videoCoverEditorIndex];
    if (!item) return;
    setVideoCovers((prev) => ({
      ...prev,
      [item.id]: pendingCoverFrame,
    }));
    setVideoCoverEditorIndex(null);
  }

  /* ------------------------------------------------------------------ */
  /* SHARE                                                              */
  /* ------------------------------------------------------------------ */

  function submit() {
    if (!media.length) {
      Alert.alert("En az 1 foto veya video ekleyin");
      return;
    }

    const safeCover = Math.min(Math.max(0, coverIndex), media.length - 1);
    const mediaItems: SocialMediaItem[] = media.map((m) => ({
      id: m.id,
      uri: m.uri,
      type: m.type,
    }));

    const cap = caption.trim();

    const extractedMentions = Array.from(
      new Set(
        (cap.match(/@([a-zA-Z0-9._çğıöşüÇĞİÖŞÜ]+)/g) ?? []).map((m) => m.slice(1))
      )
    );
    const extractedHashtags = Array.from(
      new Set((cap.match(/#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]+)/g) ?? []).map((h) => h.slice(1)))
    );
    // extracted mentions / hashtags ready for future payload mapping (SocialPost tipine alan eklenince)
    void extractedMentions;
    void extractedHashtags;

    const payload: SocialPost = {
      id: `sp_${Date.now()}`,
      userId: "u1",
      username: "Sosyal Kullanıcı",

      createdAt: new Date().toISOString(),

      caption: cap,

      media: mediaItems,
      coverIndex: safeCover,

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

      settings,

      videoCovers,
    };

    if (!canCreatePost()) {
      Alert.alert(t("social.notifications"), t("social.restricted"));
      return;
    }
    /* Tek kaynak: socialFeedStateService — feed/profil/detail subscribeFeed ile güncellenir */
    addFeedPost(payload);
    recordPostCreated();

    navigation.goBack();
  }

  /* ------------------------------------------------------------------ */

  const removeBtnOverlay = T.isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)";
  const onPrimaryLabel = "#fff";
  const actionLabelColor = T.isDark ? "#FFFFFF" : "#0f172a";

  return (
    <View style={styles.screenRoot}>
      <SocialScreenLayout title="Paylaşım Oluştur" scroll>
        <View style={{ paddingBottom: 40, backgroundColor: T.backgroundColor }}>
          <TextInput
            value={caption}
            onChangeText={handleCaptionChange}
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

          {tagMode !== null && (
            <View
              style={[
                styles.suggestionPanel,
                styles.captionSuggestionWrap,
                {
                  backgroundColor: T.cardBg,
                  borderColor: T.border,
                },
              ]}
            >
              {tagMode === "mention" && (
                <View>
                  <Text style={[styles.suggestionSectionLabel, { color: T.mutedText }]}>
                    Kişiler
                  </Text>
                  {filteredMentions.length > 0 ? (
                    filteredMentions.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        activeOpacity={0.7}
                        style={styles.suggestionItem}
                        onPress={() => insertMention(user.username)}
                      >
                        <Ionicons
                          name="person-circle-outline"
                          size={16}
                          color={T.isDark ? "#FFFFFF" : "#000000"}
                        />
                        <Text
                          style={[
                            styles.suggestionText,
                            { color: T.isDark ? "#FFFFFF" : "#000000" },
                          ]}
                        >
                          @{user.username}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : mentionQuery.trim().length > 0 ? (
                    <Text style={[styles.suggestionEmptyText, { color: T.mutedText }]}>
                      Eşleşen kişi bulunamadı
                    </Text>
                  ) : null}
                </View>
              )}

              {tagMode === "hashtag" && (
                <View>
                  <Text style={[styles.suggestionSectionLabel, { color: T.mutedText }]}>
                    Etiketler
                  </Text>
                  {filteredHashtags.length > 0 ? (
                    filteredHashtags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        activeOpacity={0.7}
                        style={styles.suggestionItem}
                        onPress={() => insertHashtag(tag)}
                      >
                        <Ionicons
                          name="pricetag-outline"
                          size={16}
                          color={T.isDark ? "#FFFFFF" : "#000000"}
                        />
                        <Text
                          style={[
                            styles.suggestionText,
                            { color: T.isDark ? "#FFFFFF" : "#000000" },
                          ]}
                        >
                          #{tag}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : hashtagQuery.trim().length > 0 ? (
                    <Text style={[styles.suggestionEmptyText, { color: T.mutedText }]}>
                      Eşleşen etiket bulunamadı
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          )}

          {true && (
            <View
              style={[
                styles.actionsRow,
                {
                  backgroundColor: T.cardBg,
                  borderColor: T.border,
                  zIndex: 10,
                  elevation: 2,
                },
              ]}
            >
              <TouchableOpacity
                onPress={pickFromCamera}
                style={[
                  styles.actionBtn,
                  { borderColor: T.border, backgroundColor: T.backgroundColor },
                ]}
              >
                <Ionicons name="camera" size={20} color={actionLabelColor} />
                <Text style={{ color: actionLabelColor, fontSize: 13, fontWeight: "500" }}>
                  Kamera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickFromGallery}
                style={[
                  styles.actionBtn,
                  { borderColor: T.border, backgroundColor: T.backgroundColor },
                ]}
              >
                <Ionicons name="images" size={20} color={actionLabelColor} />
                <Text style={{ color: actionLabelColor, fontSize: 13, fontWeight: "500" }}>
                  Galeri
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!!media.length && (
            <View style={{ marginTop: 18 }}>
              <Text style={[styles.mediaSectionTitle, { color: T.textColor }]}>Medya</Text>
              <Text style={[styles.mediaHintText, { color: T.mutedText }]}>
                Sürükleyerek sıralayın (snap). Dokun: kapak + düzenleyici. Uzun bas: çoklu seçim. Video
                kapağı: sağ alttan.
              </Text>
              <View style={[styles.mediaGrid, draggingIndex != null && styles.mediaGridDragging]}>
                {media.map((m, index) => (
                  <DraggableMediaThumb
                    key={m.id}
                    item={m}
                    index={index}
                    isGridCover={index === coverIndex}
                    isSelected={selectedMediaIds.includes(m.id)}
                    accentColor={T.primary}
                    actionLabelColor={actionLabelColor}
                    removeBtnOverlay={removeBtnOverlay}
                    videoCoverDefined={Object.prototype.hasOwnProperty.call(videoCovers, m.id)}
                    videoCoverFrame={videoCovers[m.id] ?? 0}
                    onThumbPress={() => {
                      if (selectedMediaIds.length > 0) {
                        toggleMediaSelection(m.id);
                        return;
                      }
                      setCoverIndex(index);
                      setActiveMediaIndex(index);
                      setEditorVisible(true);
                    }}
                    onThumbLongPress={() => toggleMediaSelection(m.id)}
                    onOpenEditor={() => {
                      setActiveMediaIndex(index);
                      setEditorVisible(true);
                    }}
                    onRemove={() => removeMedia(m.id)}
                    onVideoCoverPress={() => openVideoCoverEditor(index)}
                    moveLeft={moveLeft}
                    moveRight={moveRight}
                    onReorderDrop={handleReorderDrop}
                    setDraggingIndex={setDraggingIndex}
                  />
                ))}
              </View>
            </View>
          )}

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: T.cardBg,
                borderColor: T.border,
              },
            ]}
          >
            <Text style={[styles.settingsCardTitle, { color: T.textColor }]}>
              Paylaşım ayarları
            </Text>

            <View style={styles.settingsRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingsLabel, { color: T.textColor }]}>Yorumlar</Text>
                <Text style={[styles.settingsSub, { color: T.mutedText }]}>
                  Kapalıyken gönderiye yorum yapılamaz
                </Text>
              </View>
              <Switch
                value={settings.comments}
                onValueChange={(v) => setSettings((s) => ({ ...s, comments: v }))}
                trackColor={{ false: T.border, true: T.primary + "99" }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingsDivider, { backgroundColor: T.border }]} />

            <View style={styles.settingsRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.settingsLabel, { color: T.textColor }]}>
                  Beğeni sayısı
                </Text>
                <Text style={[styles.settingsSub, { color: T.mutedText }]}>
                  Kapalıyken kalp sayısı gösterilmez
                </Text>
              </View>
              <Switch
                value={settings.likesVisible}
                onValueChange={(v) => setSettings((s) => ({ ...s, likesVisible: v }))}
                trackColor={{ false: T.border, true: T.primary + "99" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={pickMusic}
            style={[
              styles.btn,
              {
                borderColor: T.border,
                backgroundColor: T.cardBg,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              },
            ]}
          >
            <Ionicons name="musical-notes" size={16} color={actionLabelColor} />
            <Text style={{ color: actionLabelColor, fontWeight: "500" }}>Müzik Ekle</Text>
          </TouchableOpacity>

          {track && (
            <TouchableOpacity
              onPress={clearMusic}
              style={[styles.btnGhost, { borderColor: T.border, backgroundColor: T.cardBg }]}
            >
              <Text style={{ color: actionLabelColor, fontSize: 13, fontWeight: "500" }}>
                Müzüğü kaldır
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={submit}
            style={[styles.btnPrimary, { backgroundColor: T.primary }]}
          >
            <Text style={{ color: onPrimaryLabel, fontWeight: "600", fontSize: 14 }}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      </SocialScreenLayout>

      {editorVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            zIndex: 999,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setEditingTextId(null);
                setEditorVisible(false);
              }}
              hitSlop={12}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>Kapat</Text>
            </TouchableOpacity>

            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Düzenle</Text>

            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setEditingTextId(null);
                setEditorVisible(false);
              }}
              hitSlop={12}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Tamam</Text>
            </TouchableOpacity>
          </View>

          {selectedMediaIds.length > 0 && (
            <View style={styles.editorMultiSelectBar}>
              <Text style={styles.editorMultiSelectText}>
                {selectedMediaIds.length} seçildi
              </Text>
              <TouchableOpacity onPress={clearMediaSelection} hitSlop={8}>
                <Text style={styles.editorMultiSelectClear}>Temizle</Text>
              </TouchableOpacity>
            </View>
          )}

          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.editorPreviewArea}>
              {!!activeEditorMedia && activeEditorMedia.type === "image" && (
                <Image
                  source={{ uri: activeEditorMedia.uri }}
                  style={styles.editorPreviewMedia}
                />
              )}
              {!!activeEditorMedia && activeEditorMedia.type === "video" && (
                <View style={styles.editorVideoPlaceholder}>
                  <Ionicons name="videocam" size={48} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.editorVideoLabel}>Video önizleme (FAZ 4)</Text>
                </View>
              )}

              {editorTextsForSlide.map((tItem) => (
                <EditorOverlayText
                  key={tItem.id}
                  item={tItem}
                  isActive={activeTextId === tItem.id}
                  isEditing={editingTextId === tItem.id}
                  onSelect={setActiveTextId}
                  onCommit={commitOverlay}
                  onRequestEdit={(id) => {
                    setActiveTextId(id);
                    setEditingTextId(id);
                  }}
                />
              ))}
            </View>
          </GestureHandlerRootView>

          {editingTextId && (
            <>
              <View style={styles.editorMiniTools} pointerEvents="box-none">
                <TouchableOpacity
                  style={styles.editorMiniToolBtn}
                  activeOpacity={0.75}
                  onPress={() => {
                    setTexts((prev) =>
                      prev.map((t) =>
                        t.id === editingTextId ? { ...t, color: nextOverlayColor(t.color) } : t
                      )
                    );
                  }}
                >
                  <Text style={styles.editorMiniToolLabel}>Renk</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editorMiniToolBtn}
                  activeOpacity={0.75}
                  onPress={() => {
                    setTexts((prev) =>
                      prev.map((t) => {
                        if (t.id !== editingTextId) return t;
                        const s = t.text;
                        if (s.length === 0) return { ...t, text: "@" };
                        if (s.endsWith(" ")) return { ...t, text: `${s}@` };
                        return { ...t, text: `${s} @` };
                      })
                    );
                  }}
                >
                  <Text style={styles.editorMiniToolLabel}>@</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editorMiniToolBtn}
                  activeOpacity={0.75}
                  onPress={() => {
                    setTexts((prev) =>
                      prev.map((t) => {
                        if (t.id !== editingTextId) return t;
                        const fs = t.fontSize ?? OVERLAY_DEFAULT_FONT;
                        const nextFs =
                          fs >= OVERLAY_HEADING_FONT ? OVERLAY_DEFAULT_FONT : OVERLAY_HEADING_FONT;
                        return { ...t, fontSize: nextFs };
                      })
                    );
                  }}
                >
                  <Text style={styles.editorMiniToolLabel}>Başlık</Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.editorComposer,
                  {
                    bottom: keyboardHeight + 12,
                  },
                ]}
                pointerEvents="box-none"
              >
                <View style={styles.editorComposerInner}>
                  <Text style={styles.editorComposerSideLabel}>Metin</Text>
                  <TextInput
                    autoFocus
                    value={texts.find((t) => t.id === editingTextId)?.text ?? ""}
                    onChangeText={(val) => {
                      setTexts((prev) =>
                        prev.map((t) => (t.id === editingTextId ? { ...t, text: val } : t))
                      );
                    }}
                    placeholder="Yaz..."
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    multiline
                    style={styles.editorComposerInput}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    hitSlop={8}
                    onPress={() => {
                      Keyboard.dismiss();
                      setEditingTextId(null);
                    }}
                  >
                    <Text style={styles.editorComposerDone}>Bitti</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {!editingTextId && (
            <View style={styles.editorToolbar}>
              <TouchableOpacity
                onPress={() => {
                  const id = `txt_${Date.now()}`;
                  setTexts((prev) => [
                    ...prev,
                    {
                      id,
                      mediaIndex: safeEditorIndex,
                      text: "Metin",
                      x: 120,
                      y: 200,
                      scale: 1,
                      color: "#ffffff",
                      fontSize: OVERLAY_DEFAULT_FONT,
                    },
                  ]);
                  setActiveTextId(id);
                  setEditingTextId(id);
                }}
              >
                <Text style={styles.editorToolbarLabel}>Yazı</Text>
              </TouchableOpacity>

              <Text style={styles.editorToolbarMuted}>Etiket</Text>
              <Text style={styles.editorToolbarMuted}>Ayarlar</Text>
            </View>
          )}
        </View>
      )}

      {videoCoverEditorIndex !== null && media[videoCoverEditorIndex] && (
        <View style={styles.vcRoot} pointerEvents="box-none">
          <Pressable style={styles.vcBackdrop} onPress={cancelVideoCoverEditor} />
          <View style={styles.vcSheet}>
            <Text style={styles.vcTitle}>Kapak Seç</Text>
            <Text style={styles.vcSubtitle} numberOfLines={1}>
              {media[videoCoverEditorIndex].type === "video" ? "Video önizleme" : "Medya"} — zaman
              çizelgesi (mock kareler)
            </Text>
            <View style={styles.vcPreviewStrip}>
              <View style={styles.vcPreviewBlock} />
              <View style={[styles.vcPreviewBlock, { opacity: 0.75 }]} />
              <View style={[styles.vcPreviewBlock, { opacity: 0.55 }]} />
              <View style={[styles.vcPreviewBlock, { opacity: 0.35 }]} />
            </View>
            <Text style={styles.vcTimelineLabel}>Kare seç</Text>
            <View style={styles.vcFrameRow}>
              {Array.from({ length: VIDEO_COVER_FRAME_COUNT }, (_, k) => (
                <Pressable
                  key={k}
                  onPress={() => setPendingCoverFrame(k)}
                  style={[
                    styles.vcFrameBlock,
                    pendingCoverFrame === k && styles.vcFrameBlockSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.vcFrameInner,
                      { backgroundColor: `rgba(255,255,255,${0.22 + k * 0.07})` },
                    ]}
                  />
                  <Text style={styles.vcFrameIdx}>{k + 1}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.vcActions}>
              <TouchableOpacity onPress={cancelVideoCoverEditor} style={styles.vcBtnGhost}>
                <Text style={styles.vcBtnGhostText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyVideoCover} style={styles.vcBtnPrimary}>
                <Text style={styles.vcBtnPrimaryText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },

  caption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    minHeight: 90,
  },

  suggestionPanel: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },

  captionSuggestionWrap: {
    maxHeight: 260,
  },

  suggestionSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.45,
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  suggestionText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  suggestionEmptyText: {
    fontSize: 12.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    letterSpacing: 0.2,
  },

  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
    zIndex: 10,
    borderRadius: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },

  actionBtn: {
    flex: 1,
    minWidth: "30%",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  mediaSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  mediaHintText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },

  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  mediaGridDragging: {
    opacity: 0.98,
  },

  thumbCell: {
    width: 100,
    height: 100,
    position: "relative",
  },

  thumb: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },

  thumbTapArea: {
    flex: 1,
    width: "100%",
    minHeight: 72,
  },

  thumbImg: { width: "100%", height: "100%", flex: 1 },

  thumbSelectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.14)",
    borderRadius: 10,
  },

  thumbCheckBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 6,
  },

  thumbPostCoverBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },

  thumbPostCoverBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  thumbReorderPill: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    gap: 6,
    zIndex: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  thumbReorderGlyph: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  thumbVideoCoverBtn: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 5,
  },

  thumbVideoCoverBtnText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  thumbEditBtn: {
    position: "absolute",
    top: 6,
    right: 40,
    borderRadius: 12,
    padding: 4,
    zIndex: 3,
  },

  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    borderRadius: 12,
    padding: 4,
    zIndex: 3,
  },

  settingsCard: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  settingsCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  settingsLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  settingsSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
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

  editorMultiSelectBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.14)",
  },

  editorMultiSelectText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "600",
  },

  editorMultiSelectClear: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
    fontWeight: "700",
  },

  editorPreviewArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  editorPreviewMedia: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  editorVideoPlaceholder: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  editorVideoLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "500",
  },

  editorOverlayTextWrap: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },

  editorOverlayTextWrapActive: {
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  editorOverlayTextLabel: {
    fontSize: 20,
    fontWeight: "600",
  },

  editorToolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.2)",
  },

  editorToolbarLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },

  editorToolbarMuted: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.65,
  },

  editorMiniTools: {
    position: "absolute",
    top: 100,
    right: 12,
    zIndex: 1000,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 14,
    padding: 8,
  },

  editorMiniToolBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
  },

  editorMiniToolLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  editorComposer: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 1001,
    backgroundColor: "rgba(0,0,0,0.88)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },

  editorComposerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 40,
  },

  editorComposerSideLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
  },

  editorComposerInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    maxHeight: 120,
    paddingVertical: 6,
    minHeight: 36,
  },

  editorComposerDone: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  vcRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1200,
    justifyContent: "flex-end",
  },

  vcBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  vcSheet: {
    marginHorizontal: 12,
    marginBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderRadius: 18,
    backgroundColor: "rgba(22,22,24,0.97)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },

  vcTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  vcSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },

  vcPreviewStrip: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },

  vcPreviewBlock: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },

  vcTimelineLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  vcFrameRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 6,
    justifyContent: "space-between",
    marginBottom: 16,
  },

  vcFrameBlock: {
    flex: 1,
    minWidth: 32,
    maxHeight: 52,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  vcFrameBlockSelected: {
    borderColor: "rgba(0,191,255,0.85)",
    backgroundColor: "rgba(0,191,255,0.12)",
  },

  vcFrameInner: {
    width: "78%",
    height: 22,
    borderRadius: 4,
    marginBottom: 4,
  },

  vcFrameIdx: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontWeight: "800",
  },

  vcActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },

  vcBtnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
  },

  vcBtnGhostText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
    fontWeight: "600",
  },

  vcBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "rgba(0,191,255,0.95)",
  },

  vcBtnPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
