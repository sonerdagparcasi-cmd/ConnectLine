// src/domains/corporate/feed/components/CorporateFeedMedia.tsx
// 🔒 Kurumsal medya motoru — carousel, overlay, görünür öğede video

import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import CorporatePostOverlays from "../../components/CorporatePostOverlays";
import type { CorporateMediaItem, CorporateOverlay } from "../../types/feed.types";
import { sortCorporateMedia } from "../../utils/corporatePostNormalize";

type Props = {
  media: CorporateMediaItem[];
  overlays?: CorporateOverlay[];
  onPress: (index: number) => void;
  /** Liste içinde görünür hücre — yalnız aktif slaytta video oynar */
  isVisible?: boolean;
  onDoubleTapLike?: () => void;
};

function mediaBlockHeight(item: CorporateMediaItem, containerW: number): number {
  if (item.width && item.height && item.width > 0) {
    const ratio = item.height / item.width;
    const h = containerW * ratio;
    return Math.min(Math.max(h, containerW * 0.52), containerW * 1.45);
  }
  return containerW / 1.25;
}

export default function CorporateFeedMedia({
  media,
  overlays,
  onPress,
  isVisible = true,
  onDoubleTapLike,
}: Props) {
  const T = useAppTheme();
  const [layoutW, setLayoutW] = useState(0);
  const [page, setPage] = useState(0);
  const lastTap = useRef(0);
  const pendingOpen = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenW = Dimensions.get("window").width;

  const items = useMemo(() => sortCorporateMedia(media), [media]);

  const slideW = layoutW > 0 ? layoutW : screenW;

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const w = slideW || 1;
      const x = e.nativeEvent.contentOffset.x;
      setPage(Math.round(x / w));
    },
    [slideW]
  );

  const handleMediaPress = useCallback(
    (index: number) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        if (pendingOpen.current) {
          clearTimeout(pendingOpen.current);
          pendingOpen.current = null;
        }
        lastTap.current = 0;
        onDoubleTapLike?.();
        return;
      }
      lastTap.current = now;
      if (pendingOpen.current) clearTimeout(pendingOpen.current);
      pendingOpen.current = setTimeout(() => {
        pendingOpen.current = null;
        lastTap.current = 0;
        onPress(index);
      }, 300);
    },
    [onDoubleTapLike, onPress]
  );

  if (!items.length) return null;

  const w = slideW;

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setLayoutW(e.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={slideW}
        snapToAlignment="center"
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => {
          const h = mediaBlockHeight(item, w);
          const playVideo = isVisible && page === index && item.type === "video";

          return (
            <View key={item.id} style={{ width: w }}>
              <Pressable
                onPress={() => handleMediaPress(index)}
                style={[
                  styles.slide,
                  {
                    height: h,
                    borderColor: T.border,
                    backgroundColor: T.cardBg,
                  },
                ]}
              >
                {item.type === "image" ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <FeedVideoSlide
                    uri={item.uri}
                    posterUri={item.thumbnailUri}
                    shouldPlay={!!playVideo}
                  />
                )}

                <CorporatePostOverlays
                  overlays={overlays}
                  width={w}
                  height={h}
                />

                {item.type === "video" ? (
                  <View style={styles.videoBadge} pointerEvents="none">
                    <Ionicons name="videocam" size={14} color="#fff" />
                  </View>
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((it, i) => (
            <View
              key={it.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === page ? T.textColor : T.mutedText,
                  opacity: i === page ? 0.9 : 0.35,
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      {items.length > 1 ? (
        <View style={styles.indexRow}>
          <Text style={[styles.indexText, { color: T.mutedText }]}>
            {page + 1} / {items.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function FeedVideoSlide({
  uri,
  posterUri,
  shouldPlay,
}: {
  uri: string;
  posterUri?: string;
  shouldPlay: boolean;
}) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<Video>(null);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay={shouldPlay}
        isMuted={muted}
        isLooping
        useNativeControls={false}
        posterSource={posterUri ? { uri: posterUri } : undefined}
      />

      <Pressable
        onPress={() => setMuted((m) => !m)}
        style={styles.audioToggle}
        hitSlop={8}
      >
        <Ionicons
          name={muted ? "volume-mute" : "volume-high"}
          size={18}
          color="#fff"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  slide: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indexRow: {
    position: "absolute",
    top: 10,
    right: 12,
  },
  indexText: {
    fontSize: 12,
    fontWeight: "700",
  },
  audioToggle: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    left: 10,
    top: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});
