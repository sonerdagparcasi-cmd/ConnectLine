// src/domains/corporate/screens/CorporateMediaPreviewScreen.tsx
// 🔒 Kurumsal tam ekran medya — güvenli alan, aktif slayt video, overlay

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CorporatePostOverlays from "../components/CorporatePostOverlays";
import type { CorporateStackParamList } from "../navigation/CorporateNavigator";
import type { CorporateMediaItem, CorporateOverlay } from "../types/feed.types";
import { sortCorporateMedia } from "../utils/corporatePostNormalize";

type RouteProps = RouteProp<CorporateStackParamList, "CorporateMediaPreview">;
type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

function formatMs(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CorporateMediaPreviewScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();

  const { media, overlays, initialIndex = 0 } = route.params;

  const items = useMemo(() => sortCorporateMedia(media), [media]);

  const [page, setPage] = useState(() =>
    Math.max(0, Math.min(initialIndex, Math.max(0, items.length - 1)))
  );

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / winW);
      setPage(Math.max(0, Math.min(idx, items.length - 1)));
    },
    [winW, items.length]
  );

  const listRef = useRef<FlatList<CorporateMediaItem>>(null);

  if (!items.length) {
    navigation.goBack();
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View
        style={[
          styles.topBar,
          { paddingHorizontal: 12 + insets.left, paddingRight: 12 + insets.right },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.iconBtn}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>

        <Text style={styles.indexLabel}>
          {page + 1} / {items.length}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        initialScrollIndex={page}
        onMomentumScrollEnd={onScrollEnd}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: winW,
          offset: winW * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <PreviewPage
            item={item}
            width={winW}
            height={winH - insets.top - insets.bottom - 56}
            isActive={page === index}
            overlays={overlays}
          />
        )}
      />

      <View style={{ height: insets.bottom }} />
    </View>
  );
}

function PreviewPage({
  item,
  width,
  height,
  isActive,
  overlays,
}: {
  item: CorporateMediaItem;
  width: number;
  height: number;
  isActive: boolean;
  overlays?: CorporateOverlay[];
}) {
  const [muted, setMuted] = useState(true);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const videoRef = useRef<Video>(null);
  const insets = useSafeAreaInsets();

  const progress =
    status &&
    status.isLoaded &&
    status.durationMillis &&
    status.durationMillis > 0
      ? (status.positionMillis ?? 0) / status.durationMillis
      : 0;

  async function toggleFullscreen() {
    try {
      await videoRef.current?.presentFullscreenPlayer();
    } catch {
      /* noop */
    }
  }

  return (
    <View style={{ width, height, backgroundColor: "#000" }}>
      {item.type === "image" ? (
        <Image
          source={{ uri: item.uri }}
          style={{ width, height }}
          resizeMode="contain"
        />
      ) : (
        <>
          <Video
            ref={videoRef}
            source={{ uri: item.uri }}
            style={{ width, height }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isActive}
            isMuted={muted}
            isLooping={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={(s) => setStatus(s)}
          />

          <View
            style={[
              styles.videoChrome,
              { paddingBottom: 8 + insets.bottom * 0.25 },
            ]}
          >
            <View style={styles.seekTrack}>
              <View
                style={[styles.seekFill, { width: `${Math.round(progress * 100)}%` }]}
              />
            </View>

            <View style={styles.videoRow}>
              <Pressable onPress={() => setMuted((m) => !m)} style={styles.roundBtn}>
                <Ionicons
                  name={muted ? "volume-mute" : "volume-high"}
                  size={20}
                  color="#fff"
                />
              </Pressable>

              <Text style={styles.timeText}>
                {status && status.isLoaded
                  ? `${formatMs(status.positionMillis ?? 0)} / ${formatMs(
                      status.durationMillis ?? item.durationMs ?? 0
                    )}`
                  : formatMs(item.durationMs ?? 0)}
              </Text>

              <Pressable onPress={toggleFullscreen} style={styles.roundBtn}>
                <Ionicons name="expand" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </>
      )}

      <CorporatePostOverlays overlays={overlays} width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  indexLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "700",
  },
  videoChrome: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  seekTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    marginBottom: 10,
  },
  seekFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
});
