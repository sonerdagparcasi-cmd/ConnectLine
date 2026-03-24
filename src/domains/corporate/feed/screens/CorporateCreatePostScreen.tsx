import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Pressable,
  Switch,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import { addCorporatePost } from "../../services/corporateFeedStateService";
import { getCorporateManagedCompanyId } from "../../services/corporateViewerIdentity";
import type { CorporateMediaItem, CorporateOverlay } from "../../types/feed.types";

type NavProp = NativeStackNavigationProp<CorporateStackParamList, "CorporateCreatePost">;
type RouteProps = RouteProp<CorporateStackParamList, "CorporateCreatePost">;

function buildMediaId() {
  return `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildOverlayId() {
  return `ov_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function CorporateCreatePostScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const managedCompanyId = getCorporateManagedCompanyId();
  const companyId = managedCompanyId ?? route.params?.companyId ?? "c1";

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<CorporateMediaItem[]>([]);
  const [overlays, setOverlays] = useState<CorporateOverlay[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [likeHidden, setLikeHidden] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "network">("public");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [overlayInput, setOverlayInput] = useState("");
  const [mediaBounds, setMediaBounds] = useState({ width: 0, height: 0 });
  const listRef = useRef<FlatList<CorporateMediaItem>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (!firstVisible?.index && firstVisible?.index !== 0) return;
      setActiveIndex(firstVisible.index);
    }
  ).current;

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 70,
    }),
    []
  );

  const pickMedia = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Media permission required", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const nextMedia: CorporateMediaItem[] = result.assets.map((asset, index) => ({
      id: buildMediaId(),
      type: asset.type === "video" ? "video" : "image",
      uri: asset.uri,
      order: index,
      width: asset.width,
      height: asset.height,
      durationMs: asset.duration != null ? Math.round(asset.duration * 1000) : undefined,
    }));

    setMedia(nextMedia);
    setActiveIndex(0);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: 0, animated: false });
    });
  }, []);

  const addOverlay = useCallback((type: "text" | "tag") => {
    const overlay: CorporateOverlay = {
      id: buildOverlayId(),
      type,
      value: type === "text" ? "Metin" : "etiket",
      x: 0.5,
      y: 0.5,
    };
    setOverlays((prev) => [...prev, overlay]);
  }, []);

  const handleOverlayPress = useCallback((overlay: CorporateOverlay) => {
    setEditingOverlayId(overlay.id);
    setOverlayInput(overlay.value);
  }, []);

  const updateOverlayValue = useCallback(() => {
    const targetId = editingOverlayId;
    if (!targetId) return;
    const nextValue = overlayInput.trim();
    if (!nextValue) return;
    setOverlays((prev) =>
      prev.map((item) => (item.id === targetId ? { ...item, value: nextValue } : item))
    );
    setEditingOverlayId(null);
    setOverlayInput("");
  }, [editingOverlayId, overlayInput]);

  const removeOverlay = useCallback(() => {
    const targetId = editingOverlayId;
    if (!targetId) return;
    setOverlays((prev) => prev.filter((item) => item.id !== targetId));
    setEditingOverlayId(null);
    setOverlayInput("");
  }, [editingOverlayId]);

  const updateOverlayPosition = useCallback(
    (overlayId: string, absX: number, absY: number) => {
      const width = Math.max(mediaBounds.width, 1);
      const height = Math.max(mediaBounds.height, 1);
      const relX = clamp(absX / width, 0, 1);
      const relY = clamp(absY / height, 0, 1);
      setOverlays((prev) =>
        prev.map((item) => (item.id === overlayId ? { ...item, x: relX, y: relY } : item))
      );
    },
    [mediaBounds.height, mediaBounds.width]
  );

  const canShare = media.length > 0 || caption.trim().length > 0;

  const sharePost = useCallback(async () => {
    if (!canShare || submitting) return;
    try {
      setSubmitting(true);
      addCorporatePost({
        companyId,
        media,
        overlays,
        caption: caption.trim(),
        visibility,
        commentsDisabled,
        likeCountHidden: likeHidden,
        isAnnouncement,
        isHiring,
      });
      navigation.goBack();
    } catch (error) {
      console.warn("Corporate post create failed", error);
    } finally {
      setSubmitting(false);
    }
  }, [
    canShare,
    caption,
    commentsDisabled,
    companyId,
    isAnnouncement,
    isHiring,
    likeHidden,
    media,
    navigation,
    overlays,
    submitting,
    visibility,
  ]);

  return (
    <View style={styles.root}>
      <View style={styles.previewWrap}>
        {media.length > 0 ? (
          <FlatList
            ref={listRef}
            data={media}
            horizontal
            pagingEnabled
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_, index) => ({
              index,
              length: screenWidth,
              offset: screenWidth * index,
            })}
            renderItem={({ item, index }) => (
              <View style={[styles.page, { width: screenWidth, height: screenHeight }]}>
                <View
                  style={styles.mediaLayer}
                  onLayout={(e) => {
                    setMediaBounds({
                      width: e.nativeEvent.layout.width,
                      height: e.nativeEvent.layout.height,
                    });
                  }}
                >
                  {item.type === "video" ? (
                    <Video
                      source={{ uri: item.uri }}
                      style={styles.media}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={index === activeIndex}
                      isLooping
                      isMuted={muted}
                      useNativeControls
                    />
                  ) : (
                    <Image source={{ uri: item.uri }} style={styles.media} resizeMode="contain" />
                  )}
                  {mediaBounds.width > 0 && mediaBounds.height > 0
                    ? overlays.map((overlay) => (
                        <DraggableOverlay
                          key={overlay.id}
                          overlay={overlay}
                          containerWidth={mediaBounds.width}
                          containerHeight={mediaBounds.height}
                          onChangePosition={updateOverlayPosition}
                          onPress={handleOverlayPress}
                        />
                      ))
                    : null}
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={42} color="#ffffff" />
            <Text style={styles.emptyTitle}>Select media to start post</Text>
            <Text style={styles.emptySub}>Supports multiple images and videos.</Text>
            <TouchableOpacity style={styles.pickButton} onPress={pickMedia}>
              <Text style={styles.pickButtonLabel}>Pick Media</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.toolbar, { top: insets.top + 80, right: Math.max(12, insets.right + 8) }]}>
        <TouchableOpacity style={styles.toolBtn} onPress={() => addOverlay("text")}>
          <Ionicons name="text-outline" size={20} color="#fff" />
          <Text style={styles.toolLabel}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => addOverlay("tag")}>
          <Ionicons name="pricetag-outline" size={20} color="#fff" />
          <Text style={styles.toolLabel}>Tag</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setSettingsOpen(true)}>
          <Ionicons name="options-outline" size={20} color="#fff" />
          <Text style={styles.toolLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            paddingLeft: Math.max(12, insets.left + 8),
            paddingRight: Math.max(12, insets.right + 8),
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Post</Text>
          {media.length > 0 ? <Text style={styles.headerCount}>{activeIndex + 1}/{media.length}</Text> : null}
        </View>

        <TouchableOpacity
          onPress={sharePost}
          style={[styles.headerBtn, styles.primaryBtn]}
          accessibilityLabel={`Share post for ${companyId}`}
          disabled={!canShare || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#111" />
          ) : (
            <Text style={[styles.headerBtnText, styles.primaryBtnText]}>
              Paylas
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.captionWrap,
          {
            left: Math.max(12, insets.left + 8),
            right: Math.max(92, insets.right + 84),
          },
        ]}
      >
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Bir aciklama yaz..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={styles.captionInput}
          multiline
        />
      </View>

      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSettingsOpen(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: T.cardBg, borderColor: T.border }]}>
            <Text style={[styles.modalTitle, { color: T.textColor }]}>Create Settings</Text>
            <TouchableOpacity
              style={styles.modalRow}
              onPress={() => setMuted((prev) => !prev)}
            >
              <Text style={[styles.modalLabel, { color: T.textColor }]}>Mute videos by default</Text>
              <Ionicons
                name={muted ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={muted ? T.accent : T.mutedText}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRow} onPress={() => setCommentsDisabled((v) => !v)}>
              <Text style={[styles.modalLabel, { color: T.textColor }]}>Comments disabled</Text>
              <Switch value={commentsDisabled} onValueChange={setCommentsDisabled} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRow} onPress={() => setLikeHidden((v) => !v)}>
              <Text style={[styles.modalLabel, { color: T.textColor }]}>Hide like count</Text>
              <Switch value={likeHidden} onValueChange={setLikeHidden} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRow} onPress={() => setIsAnnouncement((v) => !v)}>
              <Text style={[styles.modalLabel, { color: T.textColor }]}>Announcement</Text>
              <Switch value={isAnnouncement} onValueChange={setIsAnnouncement} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRow} onPress={() => setIsHiring((v) => !v)}>
              <Text style={[styles.modalLabel, { color: T.textColor }]}>Hiring</Text>
              <Switch value={isHiring} onValueChange={setIsHiring} />
            </TouchableOpacity>
            <View style={styles.visibilityRow}>
              <Text style={[styles.modalLabel, { color: T.textColor }]}>Visibility</Text>
              <View style={styles.visibilityButtons}>
                <TouchableOpacity
                  style={[
                    styles.visibilityBtn,
                    visibility === "public" ? { backgroundColor: T.accent } : { backgroundColor: T.backgroundColor },
                  ]}
                  onPress={() => setVisibility("public")}
                >
                  <Text style={styles.visibilityText}>Public</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.visibilityBtn,
                    visibility === "network" ? { backgroundColor: T.accent } : { backgroundColor: T.backgroundColor },
                  ]}
                  onPress={() => setVisibility("network")}
                >
                  <Text style={styles.visibilityText}>Network</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={[styles.modalClose, { borderColor: T.border }]} onPress={() => setSettingsOpen(false)}>
              <Text style={[styles.modalCloseText, { color: T.textColor }]}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={editingOverlayId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingOverlayId(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setEditingOverlayId(null)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: T.cardBg, borderColor: T.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: T.textColor }]}>Edit Overlay</Text>
            <TextInput
              value={overlayInput}
              onChangeText={setOverlayInput}
              style={[styles.overlayInput, { color: T.textColor, borderColor: T.border }]}
              placeholder="Type content"
              placeholderTextColor={T.mutedText}
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={removeOverlay}>
                <Text style={[styles.editDelete, { color: T.accent }]}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={updateOverlayValue}>
                <Text style={[styles.editSave, { color: T.textColor }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DraggableOverlay({
  overlay,
  containerWidth,
  containerHeight,
  onChangePosition,
  onPress,
}: {
  overlay: CorporateOverlay;
  containerWidth: number;
  containerHeight: number;
  onChangePosition: (overlayId: string, absX: number, absY: number) => void;
  onPress: (overlay: CorporateOverlay) => void;
}) {
  const pan = useRef(
    new Animated.ValueXY({
      x: overlay.x * containerWidth,
      y: overlay.y * containerHeight,
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderGrant: () => {
        pan.stopAnimation((value) => {
          pan.setOffset({ x: value.x, y: value.y });
          pan.setValue({ x: 0, y: 0 });
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        pan.stopAnimation((value) => {
          const nextX = clamp(value.x, 0, containerWidth);
          const nextY = clamp(value.y, 0, containerHeight);
          const moved = Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3;
          pan.setValue({ x: nextX, y: nextY });
          onChangePosition(overlay.id, nextX, nextY);
          if (!moved) {
            onPress(overlay);
          }
        });
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  useEffect(() => {
    pan.setValue({
      x: overlay.x * containerWidth,
      y: overlay.y * containerHeight,
    });
  }, [containerHeight, containerWidth, overlay.x, overlay.y, pan]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.overlayItem,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
    >
      {overlay.type === "tag" ? (
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{overlay.value}</Text>
        </View>
      ) : (
        <Text style={styles.textOverlay}>{overlay.value}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "black",
  },
  previewWrap: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  captionWrap: {
    position: "absolute",
    bottom: 20,
  },
  captionInput: {
    minHeight: 72,
    maxHeight: 140,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
    textAlignVertical: "top",
  },
  media: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  mediaLayer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 12,
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  emptySub: {
    marginTop: 8,
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    textAlign: "center",
  },
  pickButton: {
    marginTop: 18,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  pickButtonLabel: {
    color: "#111",
    fontSize: 13,
    fontWeight: "800",
  },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
  },
  headerBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  primaryBtn: {
    backgroundColor: "#fff",
  },
  primaryBtnText: {
    color: "#111",
  },
  headerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  headerCount: {
    marginTop: 4,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
  },
  toolbar: {
    position: "absolute",
    gap: 12,
  },
  toolBtn: {
    width: 64,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toolLabel: {
    marginTop: 4,
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 14,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  visibilityRow: {
    marginBottom: 16,
    gap: 10,
  },
  visibilityButtons: {
    flexDirection: "row",
    gap: 8,
  },
  visibilityBtn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  visibilityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalClose: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCloseText: {
    fontWeight: "800",
  },
  overlayItem: {
    position: "absolute",
  },
  textOverlay: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: 240,
  },
  tagPill: {
    backgroundColor: "rgba(0,0,0,0.58)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.24)",
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  overlayInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editDelete: {
    fontWeight: "800",
    fontSize: 14,
  },
  editSave: {
    fontWeight: "900",
    fontSize: 14,
  },
});
