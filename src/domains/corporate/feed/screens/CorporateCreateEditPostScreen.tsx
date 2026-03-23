// src/domains/corporate/feed/screens/CorporateCreateEditPostScreen.tsx
// 🔒 Kurumsal paylaşım oluştur / düzenle — sağ dikey araç çubuğu

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppGradientHeader from "../../../../shared/components/AppGradientHeader";
import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporatePostOverlays from "../../components/CorporatePostOverlays";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import {
  addCorporatePost,
  editPost,
  getCorporatePostById,
} from "../../services/corporateFeedStateService";
import type {
  CorporateMediaItem,
  CorporateOverlay,
  CorporatePost,
} from "../../types/feed.types";
import { sortCorporateMedia } from "../../utils/corporatePostNormalize";

type RouteProps = RouteProp<CorporateStackParamList, "CorporateCreateEditPost">;
type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function CorporateCreateEditPostScreen() {
  const T = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { companyId, postId } = route.params;

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<CorporateMediaItem[]>([]);
  const [overlays, setOverlays] = useState<CorporateOverlay[]>([]);
  const [visibility, setVisibility] = useState<"public" | "network">("public");
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [likeCountHidden, setLikeCountHidden] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isHiring, setIsHiring] = useState(false);

  const [overlayModal, setOverlayModal] = useState<"text" | "tag" | null>(null);
  const [overlayDraft, setOverlayDraft] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [previewW, setPreviewW] = useState(0);
  const previewH = useMemo(() => {
    if (previewW <= 0) return 220;
    return Math.min(Math.max(previewW * 1.1, 200), 420);
  }, [previewW]);

  useEffect(() => {
    if (!postId) return;
    const p = getCorporatePostById(postId);
    if (!p) {
      Alert.alert(t("corporate.editor.error"), t("corporate.editor.missingPost"));
      navigation.goBack();
      return;
    }
    setCaption(p.caption);
    setMedia(p.media);
    setOverlays(p.overlays ?? []);
    setVisibility(p.visibility);
    setCommentsDisabled(!!p.commentsDisabled);
    setLikeCountHidden(!!p.likeCountHidden);
    setIsAnnouncement(!!p.isAnnouncement);
    setIsHiring(!!p.isHiring);
  }, [postId, navigation]);

  const sortedMedia = useMemo(() => sortCorporateMedia(media), [media]);

  const pickMedia = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      allowsMultipleSelection: true,
    });

    if (res.canceled) return;

    setMedia((prev) => {
      let order = prev.length;
      const next = [...prev];
      for (const a of res.assets) {
        const isVideo = a.type === "video";
        next.push({
          id: genId("m"),
          type: isVideo ? "video" : "image",
          uri: a.uri,
          order: order++,
          width: a.width ?? undefined,
          height: a.height ?? undefined,
          durationMs: a.duration != null ? Math.round(a.duration * 1000) : undefined,
        });
      }
      return next;
    });
  }, []);

  const commitOverlay = () => {
    const v = overlayDraft.trim();
    if (!v || !overlayModal) {
      setOverlayModal(null);
      return;
    }
    setOverlays((prev) => [
      ...prev,
      {
        id: genId("ov"),
        type: overlayModal === "text" ? "text" : "tag",
        x: 0.5,
        y: overlayModal === "text" ? 0.22 : 0.72,
        value: v,
        style:
          overlayModal === "text"
            ? { fontWeight: "700", fontSize: 16 }
            : { fontWeight: "600", fontSize: 13 },
      },
    ]);
    setOverlayDraft("");
    setOverlayModal(null);
  };

  const publish = () => {
    const existing = postId ? getCorporatePostById(postId) : undefined;

    const base: CorporatePost = {
      id: postId ?? genId("post"),
      companyId,
      caption: caption.trim(),
      media: sortedMedia,
      overlays: overlays.length ? overlays : undefined,
      visibility,
      likeCount: existing?.likeCount ?? 0,
      likedByMe: existing?.likedByMe ?? false,
      commentCount: existing?.commentCount ?? 0,
      createdAt: existing?.createdAt ?? Date.now(),
      commentsDisabled,
      likeCountHidden,
      isAnnouncement: isAnnouncement || undefined,
      isHiring: isHiring || undefined,
    };

    if (postId) {
      editPost(postId, base);
    } else {
      addCorporatePost(base);
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title={postId ? t("corporate.editor.editTitle") : t("corporate.editor.title")}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.body, { paddingBottom: insets.bottom + 12 }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={pickMedia}
            style={[
              styles.pickBtn,
              { borderColor: T.border, backgroundColor: T.cardBg },
            ]}
          >
            <Ionicons name="images-outline" size={22} color={T.textColor} />
            <Text style={[styles.pickLabel, { color: T.textColor }]}>
              {t("corporate.editor.pickMedia")}
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.preview,
              { height: previewH, borderColor: T.border, backgroundColor: "#0a0a0a" },
            ]}
            onLayout={(e) => setPreviewW(e.nativeEvent.layout.width)}
          >
            {sortedMedia[0] ? (
              sortedMedia[0].type === "image" ? (
                <Image
                  source={{ uri: sortedMedia[0].uri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : (
                <View style={StyleSheet.absoluteFill}>
                  <Image
                    source={{
                      uri: sortedMedia[0].thumbnailUri ?? sortedMedia[0].uri,
                    }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                  <View style={styles.videoHint}>
                    <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.85)" />
                  </View>
                </View>
              )
            ) : (
              <Text style={styles.previewEmpty}>
                {t("corporate.editor.previewEmpty")}
              </Text>
            )}
            {previewW > 0 ? (
              <CorporatePostOverlays
                overlays={overlays}
                width={previewW}
                height={previewH}
              />
            ) : null}
          </View>

          <Text style={[styles.label, { color: T.mutedText }]}>
            {t("corporate.editor.caption")}
          </Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder={t("corporate.editor.captionPlaceholder")}
            placeholderTextColor={T.mutedText}
            multiline
            style={[
              styles.captionInput,
              {
                color: T.textColor,
                borderColor: T.border,
                backgroundColor: T.cardBg,
              },
            ]}
          />

          <TouchableOpacity
            onPress={publish}
            style={[styles.publishBtn, { backgroundColor: T.textColor }]}
          >
            <Text style={[styles.publishText, { color: T.backgroundColor }]}>
              {t("corporate.editor.publish")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={[
            styles.toolbar,
            {
              paddingRight: Math.max(insets.right, 10),
              borderLeftColor: T.border,
              backgroundColor: T.backgroundColor,
            },
          ]}
        >
          <ToolBtn
            icon="document-text-outline"
            label={t("corporate.editor.tool.text")}
            onPress={() => {
              setOverlayDraft("");
              setOverlayModal("text");
            }}
            T={T}
          />
          <ToolBtn
            icon="pricetag-outline"
            label={t("corporate.editor.tool.tag")}
            onPress={() => {
              setOverlayDraft("");
              setOverlayModal("tag");
            }}
            T={T}
          />
          <ToolBtn
            icon="options-outline"
            label={t("corporate.editor.tool.settings")}
            onPress={() => setSettingsOpen(true)}
            T={T}
          />
        </View>
      </View>

      <Modal visible={overlayModal !== null} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setOverlayModal(null)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: T.cardBg, borderColor: T.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: T.textColor }]}>
              {overlayModal === "text"
                ? t("corporate.editor.addText")
                : t("corporate.editor.addTag")}
            </Text>
            <TextInput
              value={overlayDraft}
              onChangeText={setOverlayDraft}
              placeholder={
                overlayModal === "text"
                  ? t("corporate.editor.addText")
                  : t("corporate.editor.addTag")
              }
              placeholderTextColor={T.mutedText}
              style={[
                styles.modalInput,
                { color: T.textColor, borderColor: T.border },
              ]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setOverlayModal(null)}>
                <Text style={{ color: T.mutedText, fontWeight: "700" }}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={commitOverlay}>
                <Text style={{ color: T.accent, fontWeight: "800" }}>
                  {t("common.ok")}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={settingsOpen} transparent animationType="slide">
        <Pressable style={styles.modalBg} onPress={() => setSettingsOpen(false)}>
          <Pressable
            style={[
              styles.settingsSheet,
              {
                backgroundColor: T.cardBg,
                borderColor: T.border,
                paddingBottom: insets.bottom + 16,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.sheetTitle, { color: T.textColor }]}>
              {t("corporate.editor.tool.settings")}
            </Text>

            <SettingRow
              label={t("corporate.editor.visibility")}
              value={visibility === "public"}
              onValueChange={(on) => setVisibility(on ? "public" : "network")}
              T={T}
              hintOn={t("corporate.editor.visibility.public")}
              hintOff={t("corporate.editor.visibility.network")}
            />
            <SettingRow
              label={t("corporate.editor.toggle.comments")}
              value={!commentsDisabled}
              onValueChange={(on) => setCommentsDisabled(!on)}
              T={T}
            />
            <SettingRow
              label={t("corporate.editor.toggle.likeCount")}
              value={!likeCountHidden}
              onValueChange={(on) => setLikeCountHidden(!on)}
              T={T}
            />
            <SettingRow
              label={t("corporate.editor.toggle.announcement")}
              value={isAnnouncement}
              onValueChange={setIsAnnouncement}
              T={T}
            />
            <SettingRow
              label={t("corporate.editor.toggle.hiring")}
              value={isHiring}
              onValueChange={setIsHiring}
              T={T}
            />

            <TouchableOpacity
              onPress={() => setSettingsOpen(false)}
              style={{ marginTop: 12, alignItems: "center" }}
            >
              <Text style={{ color: T.accent, fontWeight: "800" }}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ToolBtn({
  icon,
  label,
  onPress,
  T,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  T: ReturnType<typeof useAppTheme>;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.toolBtn} activeOpacity={0.85}>
      <View style={[styles.toolIconWrap, { borderColor: T.border }]}>
        <Ionicons name={icon} size={20} color={T.textColor} />
      </View>
      <Text style={[styles.toolLabel, { color: T.mutedText }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
  T,
  hintOn,
  hintOff,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  T: ReturnType<typeof useAppTheme>;
  hintOn?: string;
  hintOff?: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: T.textColor, fontWeight: "700", fontSize: 15 }}>
          {label}
        </Text>
        {hintOn && hintOff ? (
          <Text style={{ color: T.mutedText, fontSize: 12, marginTop: 2 }}>
            {value ? hintOn : hintOff}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, flexDirection: "row" },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  pickLabel: { fontWeight: "700", fontSize: 15 },
  preview: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  previewEmpty: {
    ...StyleSheet.absoluteFillObject,
    textAlign: "center",
    textAlignVertical: "center",
    color: "rgba(255,255,255,0.45)",
    paddingTop: "40%",
    fontWeight: "600",
  },
  videoHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  captionInput: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 20,
  },
  publishBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  publishText: { fontWeight: "900", fontSize: 16 },
  toolbar: {
    width: 88,
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingLeft: 10,
    paddingTop: 16,
    gap: 18,
    alignItems: "center",
  },
  toolBtn: { alignItems: "center", width: 72 },
  toolIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  toolLabel: {
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  settingsSheet: {
    marginTop: "auto",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
});
