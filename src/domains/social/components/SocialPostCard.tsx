import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import {
  getPostById,
  isPostSaved,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  const videoRefs = useRef<Record<string, Video | null>>({});

  const [, setTick] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [mediaRatios, setMediaRatios] = useState<Record<string, number>>({});
  const [bufferingById, setBufferingById] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = subscribeFeed(() => setTick((n) => n + 1));
    return unsub;
  }, []);

  const livePost = getPostById(post.id) ?? post;
  const media = livePost.media ?? [];
  const liked = !!livePost.likedByMe;
  const saved = isPostSaved(livePost.id);

  useEffect(() => {
    setActiveIndex(0);
  }, [livePost.id]);

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

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    heartAnim.setValue(0);
    Animated.timing(heartAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }

  function onSavePress() {
    if (onToggleSave) {
      onToggleSave();
      return;
    }
    toggleSavePost(livePost.id);
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

  function renderMedia({ item, index }: { item: SocialMediaItem; index: number }) {
    const pageWidth = carouselWidth || 1;
    const shouldPlay = item.type === "video" && isActive && index === activeIndex;
    const itemRatio = mediaRatios[item.id] ?? 1;
    const isBuffering = bufferingById[item.id] ?? false;
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={[styles.mediaPage, { width: pageWidth }]}
        onPress={() => onPressMedia?.(index)}
      >
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
              isMuted
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
        </View>
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

        <Animated.View
          pointerEvents="none"
          style={[
            styles.bigHeartOverlay,
            {
              opacity: heartAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  scale: heartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.5],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="heart" size={80} color="#fff" />
        </Animated.View>
      </View>

      <View style={styles.actionsRow}>
        <Animated.View style={[styles.actionBtn, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={onLikePress}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? likeColor : T.textColor}
            />
          </TouchableOpacity>
          <Text style={[styles.actionCount, { color: liked ? likeColor : T.textColor }]}>
            {likeCount}
          </Text>
        </Animated.View>

        <View style={styles.actionBtn}>
          <TouchableOpacity activeOpacity={0.8} onPress={openComments}>
            <Ionicons name="chatbubble-outline" size={22} color={T.textColor} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={openComments}>
            <Text style={[styles.actionCount, { color: T.textColor }]}>{commentCount}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={onPressShare}>
          <Ionicons name="paper-plane-outline" size={22} color={T.textColor} />
          <Text style={[styles.actionCount, { color: T.textColor }]}>{shareCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={onSavePress}>
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
  bufferIndicator: {
    position: "absolute",
    top: "45%",
    left: "45%",
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
