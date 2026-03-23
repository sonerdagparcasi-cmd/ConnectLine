import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import {
  getPostById,
  subscribeFeed,
  toggleLikePost,
  toggleSavePost,
} from "../services/socialFeedStateService";
import type { SocialMediaItem, SocialPost } from "../types/social.types";
import SocialEventFeedCard from "./SocialEventFeedCard";

const AnimatedImage = Reanimated.createAnimatedComponent(Image);

type Props = {
  post: SocialPost;
  reels?: boolean;
  isActive?: boolean;
  shouldPreload?: boolean;
  onPressPost?: () => void;
  onPressMedia?: (initialIndex: number) => void;
  onToggleLike?: () => void;
  onPressComments?: () => void;
  onPressMenu?: () => void;
  onPressShare?: () => void;
  onToggleSave?: () => void;
  saved?: boolean;
};

function formatPostTime(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Simdi";
  if (diffMin < 60) return `${diffMin} dk once`;
  if (diffHour < 24) return `${diffHour} sa once`;
  if (diffDay === 1) return "Dun";
  if (diffDay < 7) return `${diffDay} gun once`;

  return (
    date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    }) +
    " " +
    date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function ZoomableImage({
  uri,
  ratio,
  onLoad,
}: {
  uri: string;
  ratio: number;
  onLoad: (e: { nativeEvent: { source: { width: number; height: number } } }) => void;
}) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      baseScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = baseScale.value * e.scale;
      scale.value = Math.max(1, Math.min(next, 4));
    })
    .onEnd(() => {
      if (scale.value < 1.01) {
        scale.value = withTiming(1, { duration: 180 });
        translateX.value = withTiming(0, { duration: 180 });
        translateY.value = withTiming(0, { duration: 180 });
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(0, { duration: 180 });
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <AnimatedImage
        source={{ uri }}
        style={[styles.media, { aspectRatio: ratio }, animatedStyle]}
        resizeMode="contain"
        onLoad={onLoad}
      />
    </GestureDetector>
  );
}

function SocialPostCard({
  post,
  isActive = false,
  shouldPreload = false,
  onPressPost,
  onPressMedia,
  onToggleLike,
  onPressComments,
  onPressMenu,
  onPressShare,
  onToggleSave,
}: Props) {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const likeColor = T.isDark ? "#1834ae" : "#00bfff";
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const likeScale = useSharedValue(1);
  const seekAnim = useSharedValue(0);
  const videoRefs = useRef<Record<string, Video | null>>({});
  const panRespondersRef = useRef<Record<string, ReturnType<typeof PanResponder.create>>>({});
  const progressWidthsRef = useRef<Record<string, number>>({});
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);

  const [, setTick] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [mediaRatios, setMediaRatios] = useState<Record<string, number>>({});
  const [bufferingById, setBufferingById] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const unsub = subscribeFeed(() => setTick((n) => n + 1));
    return unsub;
  }, []);

  const livePost = getPostById(post.id) ?? post;
  const media = livePost.media ?? [];
  const liked = !!livePost.likedByMe;
  const saved = !!livePost.savedByMe;

  useEffect(() => {
    setActiveIndex(0);
  }, [livePost.id]);

  useEffect(() => {
    if (!showControls) return;
    const t = setTimeout(() => {
      setShowControls(false);
    }, 2500);
    return () => clearTimeout(t);
  }, [showControls]);

  useEffect(() => {
    const activeMedia = media[activeIndex];
    if (!activeMedia || activeMedia.type !== "video") return;
    const activeVideoRef = videoRefs.current[activeMedia.id];
    if (!activeVideoRef) return;
    if (!isActive) {
      activeVideoRef.pauseAsync().catch(() => {});
    } else {
      activeVideoRef.playAsync().catch(() => {});
    }
  }, [activeIndex, isActive, media]);

  useEffect(() => {
    if (!shouldPreload) return;
    const nextVideo = media.find((m) => m.type === "video");
    if (!nextVideo) return;
    const nextVideoRef = videoRefs.current[nextVideo.id];
    if (!nextVideoRef) return;
    nextVideoRef
      .loadAsync({ uri: nextVideo.uri }, {}, false)
      .catch(() => {});
  }, [media, shouldPreload]);

  if (livePost.event) {
    return <SocialEventFeedCard event={livePost.event} />;
  }

  const likeCount = livePost.likeCount ?? 0;
  const commentCount = livePost.commentCount ?? 0;
  const saveCount = (livePost as SocialPost & { saveCount?: number }).saveCount ?? 0;
  const shareCount = (livePost as SocialPost & { shareCount?: number }).shareCount ?? 0;
  const activeMedia = media[activeIndex];
  const activeRatio = activeMedia ? (mediaRatios[activeMedia.id] ?? 1) : 1;

  function handleMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!carouselWidth) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / carouselWidth);
    const clamped = Math.max(0, Math.min(next, media.length - 1));
    setActiveIndex(clamped);
  }

  function onLikePress() {
    if (onToggleLike) {
      onToggleLike();
    } else {
      toggleLikePost(livePost.id);
    }
  }

  function handleSave() {
    if (onToggleSave) {
      onToggleSave();
      return;
    }
    toggleSavePost(livePost.id);
  }

  async function handleShare() {
    if (onPressShare) {
      onPressShare();
      return;
    }
    try {
      await Share.share({
        message: `${livePost.caption || ""}\n\nConnectLine`,
        url: livePost.media?.[0]?.uri,
      });
    } catch {
      // no-op
    }
  }

  function openComments() {
    if (onPressComments) {
      onPressComments();
      return;
    }
    navigation.navigate("SocialPostDetail", {
      postId: livePost.id,
    });
  }

  function setMediaRatio(id: string, ratio: number) {
    if (!Number.isFinite(ratio) || ratio <= 0) return;
    setMediaRatios((prev) => (prev[id] === ratio ? prev : { ...prev, [id]: ratio }));
  }

  function toggleControls() {
    setShowControls((p) => !p);
  }

  function formatTime(ms: number) {
    if (!ms) return "0:00";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  }

  function triggerSeekFeedback() {
    seekAnim.value = 1;
    seekAnim.value = withTiming(0, { duration: 400 });
  }

  function toggleSound() {
    setMuted((prev) => !prev);
    setShowControls(true);
  }

  async function seekBy(mediaId: string, seconds: number) {
    const ref = videoRefs.current[mediaId];
    if (!ref) return;
    const status = await ref.getStatusAsync();
    if (!status.isLoaded) return;
    let newPos = status.positionMillis + seconds * 1000;
    if (newPos < 0) newPos = 0;
    await ref.setPositionAsync(newPos);
    triggerSeekFeedback();
    setShowControls(true);
  }

  function openFullscreen(mediaId: string) {
    videoRefs.current[mediaId]?.presentFullscreenPlayer().catch(() => {});
    setShowControls(true);
  }

  function getPanResponder(mediaId: string) {
    if (!panRespondersRef.current[mediaId]) {
      panRespondersRef.current[mediaId] = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          const ref = videoRefs.current[mediaId];
          ref?.pauseAsync().catch(() => {});
        },
        onPanResponderMove: (evt) => {
          const barWidth = progressWidthsRef.current[mediaId] || 0;
          if (!barWidth || !duration) return;
          const locationX = evt.nativeEvent.locationX;
          const clampedX = Math.max(0, Math.min(locationX, barWidth));
          const ratio = clampedX / barWidth;
          const newPos = ratio * duration;
          const ref = videoRefs.current[mediaId];
          if (!ref || !Number.isFinite(newPos)) return;
          ref.setPositionAsync(newPos).catch(() => {});
          setPosition(newPos);
        },
        onPanResponderRelease: () => {
          const ref = videoRefs.current[mediaId];
          if (isActive) {
            ref?.playAsync().catch(() => {});
          }
        },
      });
    }
    return panRespondersRef.current[mediaId];
  }

  function handleMediaTap() {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 250;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      if (!liked) {
        if (onToggleLike) {
          onToggleLike();
        } else {
          toggleLikePost(livePost.id);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

        heartScale.value = 0.3;
        heartOpacity.value = 1;
        heartScale.value = withSequence(
          withTiming(1.4, { duration: 180 }),
          withTiming(1, { duration: 120 })
        );
        heartOpacity.value = withTiming(0, { duration: 400 });
        likeScale.value = withSequence(
          withTiming(1.4, { duration: 120 }),
          withTiming(1, { duration: 120 })
        );
      }
    } else {
      singleTapTimeoutRef.current = setTimeout(() => {
        toggleControls();
      }, DOUBLE_PRESS_DELAY);
    }
    lastTap.current = now;
  }
  const heartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));
  const likeIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));
  const likeCountStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (likeScale.value - 1) * 0.5 }],
  }));
  const seekFeedbackStyle = useAnimatedStyle(() => ({
    opacity: seekAnim.value,
    transform: [{ scale: 0.9 + seekAnim.value * 0.4 }],
  }));

  function renderMedia({ item, index }: { item: SocialMediaItem; index: number }) {
    const pageWidth = carouselWidth || 1;
    const shouldPlay = item.type === "video" && isActive && index === activeIndex;
    const itemRatio = mediaRatios[item.id] ?? 1;
    const isBuffering = bufferingById[item.id] ?? false;
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={[styles.mediaPage, { width: pageWidth }]}
        onPress={() => {}}
      >
        <TouchableWithoutFeedback onPress={handleMediaTap}>
          <View style={[styles.mediaWrapper, { aspectRatio: itemRatio }]}>
          {item.type === "video" ? (
            <Video
              ref={(ref) => {
                videoRefs.current[item.id] = ref;
              }}
              source={{ uri: item.uri }}
              style={[styles.media, { aspectRatio: itemRatio, backgroundColor: "#000" }]}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={shouldPlay}
              isLooping
              isMuted={muted}
              useNativeControls={false}
              posterSource={{ uri: item.uri }}
              usePoster
              onLoad={(status: AVPlaybackStatus) => {
                if (!status.isLoaded) return;
                const width = status.naturalSize?.width;
                const height = status.naturalSize?.height;
                if (width && height) {
                  setMediaRatio(item.id, width / height);
                }
              }}
              onPlaybackStatusUpdate={(status) => {
                if (!status.isLoaded) return;
                setDuration(status.durationMillis || 0);
                setPosition(status.positionMillis || 0);
                const next = !!status.isBuffering;
                setBufferingById((prev) =>
                  prev[item.id] === next ? prev : { ...prev, [item.id]: next }
                );
              }}
            />
          ) : (
            <>
              <Image
                source={{ uri: item.uri }}
                style={styles.blurBackground}
                blurRadius={20}
                resizeMode="cover"
              />
              <ZoomableImage
                uri={item.uri}
                ratio={itemRatio}
                onLoad={(e) => {
                  const { width, height } = e.nativeEvent.source;
                  if (width && height) {
                    setMediaRatio(item.id, width / height);
                  }
                }}
              />
            </>
          )}
          {item.type === "video" && isBuffering ? (
            <View style={styles.bufferIndicator}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : null}
          {item.type === "video" && showControls ? (
            <View style={styles.videoControlsBar}>
              <TouchableOpacity activeOpacity={0.8} onPress={toggleSound}>
                <Ionicons
                  name={muted ? "volume-mute" : "volume-high"}
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  seekBy(item.id, -10).catch(() => {});
                }}
              >
                <Ionicons name="play-back" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  seekBy(item.id, 10).catch(() => {});
                }}
              >
                <Ionicons name="play-forward" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={() => openFullscreen(item.id)}>
                <Ionicons name="expand-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : null}
          {item.type === "video" ? (
            <View
              {...getPanResponder(item.id).panHandlers}
              style={styles.progressWrap}
              onLayout={(e) => {
                progressWidthsRef.current[item.id] = e.nativeEvent.layout.width;
              }}
            >
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(
                        0,
                        Math.min(100, (duration ? position / duration : 0) * 100)
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ) : null}
          {item.type === "video" && showControls ? (
            <View style={styles.timeTopRight}>
              <Text style={styles.timeTopRightText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          ) : null}
          {item.type === "video" ? (
            <Reanimated.View pointerEvents="none" style={[styles.seekFeedback, seekFeedbackStyle]}>
              <Ionicons name="play" size={24} color="#fff" />
            </Reanimated.View>
          ) : null}
          <Reanimated.View pointerEvents="none" style={[styles.doubleTapHeartOverlay, heartStyle]}>
            <Ionicons name="heart" size={90} color="#fff" />
          </Reanimated.View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: T.cardBg }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          activeOpacity={0.85}
          onPress={onPressPost}
        >
          <View style={styles.avatarWrap}>
            {livePost.userAvatarUri ? (
              <Image source={{ uri: livePost.userAvatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={18} color="#666" />
              </View>
            )}
          </View>
          <View style={styles.userMeta}>
            <Text style={[styles.username, { color: T.textColor }]} numberOfLines={1}>
              {livePost.username}
            </Text>
            <Text style={[styles.postTime, { color: T.mutedText ?? T.textColor }]} numberOfLines={1}>
              {formatPostTime(livePost.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={onPressMenu}>
          <Ionicons name="ellipsis-horizontal" size={20} color={T.textColor} />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.carouselWrap, { aspectRatio: activeRatio }]}
        onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
      >
        {media.length > 0 ? (
          <FlatList
            data={media}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderMedia}
            onMomentumScrollEnd={handleMomentumEnd}
            getItemLayout={(_, index) => ({
              length: carouselWidth || 1,
              offset: (carouselWidth || 1) * index,
              index,
            })}
          />
        ) : (
          <View style={[styles.media, styles.emptyMedia, { aspectRatio: 1 }]} />
        )}

        {media.length > 1 ? (
          <View style={styles.dotsRow} pointerEvents="none">
            {media.map((m, idx) => (
              <View
                key={m.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      idx === activeIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                  },
                ]}
              />
            ))}
          </View>
        ) : null}

      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionBtn}>
          <TouchableOpacity activeOpacity={0.8} onPress={onLikePress}>
            <Reanimated.View style={likeIconStyle}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={24}
                color={liked ? likeColor : T.textColor}
              />
            </Reanimated.View>
          </TouchableOpacity>
          <Reanimated.Text style={[styles.actionCount, { color: liked ? likeColor : T.textColor }, likeCountStyle]}>
            {likeCount}
          </Reanimated.Text>
        </View>

        <View style={styles.actionBtn}>
          <TouchableOpacity activeOpacity={0.8} onPress={openComments}>
            <Ionicons name="chatbubble-outline" size={22} color={T.textColor} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={openComments}>
            <Text style={[styles.actionCount, { color: T.textColor }]}>{commentCount}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={handleShare}>
          <Ionicons name="paper-plane-outline" size={22} color={T.textColor} />
          <Text style={[styles.actionCount, { color: T.textColor }]}>{shareCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={handleSave}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? likeColor : T.textColor}
          />
          <Text style={[styles.actionCount, { color: T.textColor }]}>{saveCount}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: T.border ?? T.textColor }]} />

      {!!livePost.caption && (
        <View style={styles.captionWrap}>
          <Text style={[styles.caption, { color: T.textColor }]}>{livePost.caption}</Text>
        </View>
      )}
    </View>
  );
}

export default React.memo(SocialPostCard);

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
  },
  userMeta: {
    flex: 1,
    minWidth: 0,
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  carouselWrap: {
    width: "100%",
    maxHeight: 500,
    backgroundColor: "#000",
  },
  mediaPage: {
    width: "100%",
  },
  mediaWrapper: {
    width: "100%",
    maxHeight: 500,
    overflow: "hidden",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  media: {
    width: "100%",
  },
  emptyMedia: {
    backgroundColor: "#111",
  },
  dotsRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  bigHeartOverlay: {
    position: "absolute",
    top: "40%",
    left: "40%",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionCount: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  captionWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 6,
  },
  doubleTapHeartOverlay: {
    position: "absolute",
    top: "40%",
    left: "40%",
  },
  bufferIndicator: {
    position: "absolute",
    top: "45%",
    left: "45%",
  },
  videoControlsBar: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    elevation: 10,
  },
  progressWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 0,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#fff",
  },
  timeTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    elevation: 10,
  },
  timeTopRightText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  seekFeedback: {
    position: "absolute",
    top: "45%",
    left: "46%",
  },
  divider: {
    height: 1,
    opacity: 0.3,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
});
