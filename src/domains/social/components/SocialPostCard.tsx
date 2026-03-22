// src/domains/social/components/SocialPostCard.tsx
// 🔒 SOCIAL POST CARD — list mode + REELS fullscreen (flex, tek aktif video)

import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { SocialMediaItem, SocialPost } from "../types/social.types";
import SocialEventFeedCard from "./SocialEventFeedCard";
import {
  getPostById,
  isPostSaved,
  subscribeFeed,
  toggleLikePost,
  toggleSavePost,
} from "../services/socialFeedStateService";

type Props = {
  post: SocialPost;
  /** Dikey tam ekran Reels düzeni */
  reels?: boolean;
  /** Görünür reel satırı — yalnızca bu öğede video oynar */
  isActive?: boolean;
  onPressPost: () => void;
  onPressMedia: (initialIndex: number) => void;
  onToggleLike?: () => void;
  onPressComments: () => void;
  onPressMenu: () => void;
  onPressShare?: () => void;
  onToggleSave?: () => void;
  saved?: boolean;
};

const CARD_INNER_H_PAD = 14;
const LIST_MEDIA_MIN_HEIGHT = 240;
/** Reels: sol üst menü */
const REELS_TOP_ALIGN = 12;
/** Reels: sağ alt aksiyon sütunu (caption ~bottom 40 üstünde) */
const REELS_ACTIONS_BOTTOM = 110;

function SocialPostCard({
  post,
  reels = false,
  isActive = false,
  onPressPost,
  onPressMedia,
  onPressComments,
  onPressMenu,
  onPressShare,
}: Props) {
  const T = useAppTheme();
  const likeColor = T.isDark ? "#1834ae" : "#00bfff";

  const [, setFeedTick] = useState(0);
  useEffect(() => {
    const unsub = subscribeFeed(() => setFeedTick((n) => n + 1));
    return unsub;
  }, []);

  const livePost = getPostById(post.id) ?? post;
  const saved = isPostSaved(post.id);
  const liked = !!livePost.likedByMe;
  const likeCount = livePost.likeCount ?? 0;
  const showLikeCount = livePost.settings?.likesVisible !== false;
  const commentsOpen =
    (livePost.settings?.commentsEnabled ?? livePost.settings?.comments) !==
    false;

  const media = livePost.media ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [carouselBox, setCarouselBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setActiveIndex(0);
  }, [livePost.id, media.length]);

  const lastTap = useRef(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressHandledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    };
  }, []);

  function handleListMediaTap() {
    const now = Date.now();
    if (lastTap.current > 0 && now - lastTap.current < 300) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTap.current = 0;
      toggleLikePost(livePost.id);
      scaleAnim.stopAnimation();
      scaleAnim.setValue(0);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    lastTap.current = now;
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    singleTapTimerRef.current = setTimeout(() => {
      singleTapTimerRef.current = null;
      setMuted((prev) => !prev);
      lastTap.current = 0;
    }, 280);
  }

  function handleListMediaLongPress(index: number) {
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = null;
    }
    lastTap.current = 0;
    longPressHandledRef.current = true;
    onPressMedia(index);
  }

  function handleListMediaPress(index: number) {
    if (longPressHandledRef.current) {
      longPressHandledRef.current = false;
      return;
    }
    handleListMediaTap();
  }

  function getTimeAgo(date: string) {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
    if (diff < 60) return t("social.time.now");
    const min = Math.floor(diff / 60);
    if (min < 60) return t("social.time.minAgo").replace("{{m}}", String(min));
    const hour = Math.floor(min / 60);
    if (hour < 24) return t("social.time.hourAgo").replace("{{h}}", String(hour));
    const day = Math.floor(hour / 24);
    return t("social.time.dayAgo").replace("{{d}}", String(day));
  }

  function onCarouselScrollEnd(e: {
    nativeEvent: { contentOffset: { x: number } };
  }) {
    const slideW = carouselBox.w;
    if (slideW <= 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / slideW);
    const clamped = Math.min(Math.max(0, i), Math.max(0, media.length - 1));
    setActiveIndex(clamped);
  }

  function onCarouselLayout(e: {
    nativeEvent: { layout: { width: number; height: number } };
  }) {
    const { width: w, height: h } = e.nativeEvent.layout;
    setCarouselBox((prev) =>
      prev.w !== w || prev.h !== h ? { w, h } : prev
    );
  }

  function renderListCarouselItem({
    item,
    index,
  }: {
    item: SocialMediaItem;
    index: number;
  }) {
    const isSlideActive = index === activeIndex;
    const isVideo = item.type === "video";
    const shouldPlayVideo = isActive && isSlideActive && isVideo;
    const pageW = carouselBox.w;
    const pageH = carouselBox.h;

    return (
      <Pressable
        delayLongPress={380}
        onLongPress={() => handleListMediaLongPress(index)}
        onPress={() => handleListMediaPress(index)}
      >
        <View style={[styles.carouselPage, { width: pageW, height: pageH }]}>
          {isVideo ? (
            <Video
              source={{ uri: item.uri }}
              style={styles.mediaFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay={shouldPlayVideo}
              isLooping
              isMuted={muted}
              useNativeControls={false}
            />
          ) : (
            <Image
              source={{ uri: item.uri }}
              style={styles.mediaFill}
              resizeMode="cover"
            />
          )}
          {isVideo && item.durationSec != null ? (
            <View
              style={[
                styles.videoDurationBadge,
                { backgroundColor: T.textColor + "dd" },
              ]}
            >
              <Text style={[styles.videoDurationText, { color: T.cardBg }]}>
                {Math.floor(item.durationSec / 60)}:
                {String(item.durationSec % 60).padStart(2, "0")}
              </Text>
            </View>
          ) : null}
          {isVideo ? (
            <View style={styles.soundIconWrap} pointerEvents="none">
              <Ionicons
                name={muted ? "volume-mute" : "volume-high"}
                size={20}
                color="#fff"
              />
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  function renderReelsCarouselItem({
    item,
    index,
  }: {
    item: SocialMediaItem;
    index: number;
  }) {
    const isSlideActive = index === activeIndex;
    const isVideo = item.type === "video";
    const shouldPlayVideo = isActive && isSlideActive && isVideo;
    const pageW = carouselBox.w;
    const pageH = carouselBox.h;

    return (
      <View style={[styles.reelsPage, { width: pageW, height: pageH }]}>
        <TouchableWithoutFeedback
          onPress={() => setMuted((prev) => !prev)}
        >
          <View style={styles.reelsMediaTouch}>
            {isVideo ? (
              <Video
                source={{ uri: item.uri }}
                style={styles.reelsMedia}
                resizeMode={ResizeMode.COVER}
                shouldPlay={shouldPlayVideo}
                isLooping
                isMuted={muted}
                useNativeControls={false}
              />
            ) : (
              <Image
                source={{ uri: item.uri }}
                style={styles.reelsMedia}
                resizeMode="cover"
              />
            )}
            {isVideo ? (
              <View style={styles.soundIconWrap} pointerEvents="none">
                <Ionicons
                  name={muted ? "volume-mute" : "volume-high"}
                  size={20}
                  color="#fff"
                />
              </View>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  function renderListMedia() {
    if (!media.length) {
      return (
        <View
          style={[
            styles.emptyMedia,
            styles.emptyMediaList,
            { backgroundColor: T.backgroundColor },
          ]}
        />
      );
    }

    const carouselRootStyle = [
      styles.carouselRoot,
      { backgroundColor: "#000000" },
      styles.carouselRootList,
    ];

    return (
      <View style={[styles.carouselBleed, { marginHorizontal: -CARD_INNER_H_PAD }]}>
        <View style={carouselRootStyle} onLayout={onCarouselLayout}>
          {carouselBox.w > 0 ? (
            <FlatList
              data={media}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(m) => m.id}
              renderItem={renderListCarouselItem}
              onMomentumScrollEnd={onCarouselScrollEnd}
              getItemLayout={(_: unknown, idx: number) => ({
                length: carouselBox.w,
                offset: carouselBox.w * idx,
                index: idx,
              })}
              style={styles.carouselList}
              contentContainerStyle={styles.carouselListContent}
              extraData={`${carouselBox.w}x${carouselBox.h}`}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews
            />
          ) : (
            <View style={styles.carouselListPlaceholder} />
          )}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heartBurst,
              {
                opacity: scaleAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="heart" size={80} color="#ffffff" />
          </Animated.View>
          {media.length > 1 ? (
            <View style={styles.dotsRow} pointerEvents="none">
              {media.map((m, i) => (
                <View
                  key={m.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === activeIndex ? "#fff" : "rgba(255,255,255,0.4)",
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  function renderReelsMedia() {
    if (!media.length) {
      return <View style={[styles.reelsMediaShell, styles.reelsEmpty]} />;
    }

    return (
      <View style={styles.reelsMediaShell} onLayout={onCarouselLayout}>
        {carouselBox.w > 0 ? (
          <FlatList
            data={media}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(m) => m.id}
            renderItem={renderReelsCarouselItem}
            onMomentumScrollEnd={onCarouselScrollEnd}
            getItemLayout={(_: unknown, idx: number) => ({
              length: carouselBox.w,
              offset: carouselBox.w * idx,
              index: idx,
            })}
            style={styles.carouselList}
            contentContainerStyle={styles.carouselListContent}
            extraData={`${carouselBox.w}x${carouselBox.h}`}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews
          />
        ) : (
          <View style={styles.carouselListPlaceholder} />
        )}
        {media.length > 1 ? (
          <View style={styles.reelsDots} pointerEvents="none">
            {media.map((m, i) => (
              <View
                key={m.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === activeIndex ? "#fff" : "rgba(255,255,255,0.4)",
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  if (livePost.event && !reels) {
    return <SocialEventFeedCard event={livePost.event} />;
  }

  if (livePost.event && reels) {
    return (
      <View style={styles.reelsRoot}>
        <View style={styles.reelsMediaShell}>
          <SocialEventFeedCard event={livePost.event} />
        </View>
        <TouchableOpacity
          style={styles.reelsMenuBtn}
          onPress={onPressMenu}
          hitSlop={12}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reelsUserRow}
          onPress={onPressPost}
          activeOpacity={0.85}
        >
          <View style={styles.reelsAvatarWrap}>
            {livePost.userAvatarUri ? (
              <Image
                source={{ uri: livePost.userAvatarUri }}
                style={styles.reelsAvatarImg}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.reelsAvatarPlaceholder}>
                <Ionicons name="person" size={18} color="#666" />
              </View>
            )}
          </View>
          <View style={styles.reelsUserNameRow}>
            <Text style={styles.reelsUserNameText} numberOfLines={1}>
              {livePost.username}
            </Text>
            {livePost.verified ? (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#00bfff"
                style={styles.reelsVerifiedIcon}
              />
            ) : null}
          </View>
        </TouchableOpacity>
        {!!livePost.caption && (
          <View style={styles.reelsCaptionWrap} pointerEvents="box-none">
            <Text style={styles.reelsCaption} numberOfLines={4}>
              {livePost.caption}
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (reels) {
    return (
      <View style={styles.reelsRoot}>
        <View style={styles.reelsMediaOuter}>{renderReelsMedia()}</View>

        <TouchableOpacity
          style={styles.reelsMenuBtn}
          onPress={onPressMenu}
          hitSlop={12}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.reelsRight}>
          <TouchableOpacity
            onPress={() => toggleLikePost(livePost.id)}
            activeOpacity={0.85}
            style={styles.reelsActionCol}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={28}
              color={liked ? likeColor : "#fff"}
            />
            {showLikeCount && likeCount > 0 ? (
              <Text
                style={[
                  styles.reelsActionCount,
                  { color: liked ? likeColor : "#fff" },
                ]}
              >
                {likeCount}
              </Text>
            ) : null}
          </TouchableOpacity>
          {commentsOpen ? (
            <TouchableOpacity
              onPress={onPressComments}
              activeOpacity={0.85}
              style={styles.reelsActionCol}
            >
              <Ionicons name="chatbubble-outline" size={26} color="#fff" />
              {(livePost.commentCount ?? 0) > 0 ? (
                <Text style={styles.reelsActionCount}>
                  {livePost.commentCount}
                </Text>
              ) : null}
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => toggleSavePost(livePost.id)}
            activeOpacity={0.85}
            style={styles.reelsActionCol}
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={26}
              color={saved ? likeColor : "#fff"}
            />
          </TouchableOpacity>
          {onPressShare ? (
            <TouchableOpacity
              onPress={onPressShare}
              activeOpacity={0.85}
              style={styles.reelsActionCol}
            >
              <Ionicons
                name="paper-plane-outline"
                size={26}
                color="#fff"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.reelsUserRow}
          onPress={onPressPost}
          activeOpacity={0.85}
        >
          <View style={styles.reelsAvatarWrap}>
            {livePost.userAvatarUri ? (
              <Image
                source={{ uri: livePost.userAvatarUri }}
                style={styles.reelsAvatarImg}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.reelsAvatarPlaceholder}>
                <Ionicons name="person" size={18} color="#666" />
              </View>
            )}
          </View>
          <View style={styles.reelsUserNameRow}>
            <Text style={styles.reelsUserNameText} numberOfLines={1}>
              {livePost.username}
            </Text>
            {livePost.verified ? (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#00bfff"
                style={styles.reelsVerifiedIcon}
              />
            ) : null}
          </View>
        </TouchableOpacity>
        {!!livePost.caption && (
          <View style={styles.reelsCaptionWrap} pointerEvents="box-none">
            <Text style={styles.reelsCaption} numberOfLines={4}>
              {livePost.caption}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onPressPost}
          style={styles.headerLeft}
          activeOpacity={0.9}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: T.backgroundColor, borderColor: T.border },
            ]}
          >
            <Ionicons name="person" size={16} color={T.mutedText} />
          </View>
          <View>
            <Text style={{ color: T.textColor, fontWeight: "900" }}>
              {livePost.username}
            </Text>
            <Text style={{ color: T.mutedText, fontSize: 12 }}>
              {getTimeAgo(livePost.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={onPressMenu}>
          <Ionicons name="ellipsis-horizontal" size={20} color={T.mutedText} />
        </TouchableOpacity>
      </View>

      <View style={styles.mediaWrap}>{renderListMedia()}</View>

      {!!livePost.music?.title && (
        <Text style={[styles.musicText, { color: T.mutedText }]}>
          🎵 {livePost.music.title}
          {livePost.music.artist ? ` • ${livePost.music.artist}` : ""}
        </Text>
      )}

      {!!livePost.caption && (
        <Text
          style={[styles.caption, { color: T.textColor }]}
          numberOfLines={3}
        >
          {livePost.caption}
        </Text>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => toggleLikePost(livePost.id)}
          activeOpacity={0.7}
          style={styles.actionBtn}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? likeColor : T.textColor}
          />
        </TouchableOpacity>
        {showLikeCount ? (
          <Text
            style={{
              color: liked ? likeColor : T.textColor,
              fontSize: 12,
              fontWeight: "800",
            }}
          >
            {likeCount}
          </Text>
        ) : null}

        {commentsOpen ? (
          <TouchableOpacity
            onPress={onPressComments}
            activeOpacity={0.7}
            style={styles.actionBtn}
          >
            <Ionicons
              name="chatbubble-outline"
              size={19}
              color={T.textColor}
            />
            <Text style={{ color: T.textColor, fontSize: 12, fontWeight: "800" }}>
              {livePost.commentCount ?? 0}
            </Text>
          </TouchableOpacity>
        ) : null}

        {onPressShare ? (
          <TouchableOpacity
            onPress={onPressShare}
            activeOpacity={0.7}
            style={styles.actionBtn}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={T.textColor}
            />
          </TouchableOpacity>
        ) : null}

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={() => toggleSavePost(livePost.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? likeColor : T.textColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(SocialPostCard);

const styles = StyleSheet.create({
  reelsRoot: {
    flex: 1,
    backgroundColor: "#000000",
    minHeight: 0,
  },
  reelsMediaOuter: {
    flex: 1,
    minHeight: 0,
  },
  reelsMediaShell: {
    flex: 1,
    minHeight: 0,
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  reelsEmpty: {
    backgroundColor: "#111",
  },
  reelsPage: {
    overflow: "hidden",
    backgroundColor: "#000",
  },
  reelsMediaTouch: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  reelsMedia: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  reelsMenuBtn: {
    position: "absolute",
    top: REELS_TOP_ALIGN,
    left: 12,
    zIndex: 20,
    padding: 6,
  },
  reelsUserRow: {
    position: "absolute",
    bottom: 70,
    left: 12,
    right: 72,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  reelsAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  reelsAvatarImg: {
    width: "100%",
    height: "100%",
  },
  reelsAvatarPlaceholder: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
  },
  reelsUserNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  reelsUserNameText: {
    flexShrink: 1,
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  reelsVerifiedIcon: {
    marginLeft: 4,
  },
  reelsCaptionWrap: {
    position: "absolute",
    bottom: 40,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  reelsCaption: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  reelsRight: {
    position: "absolute",
    right: 12,
    bottom: REELS_ACTIONS_BOTTOM,
    alignItems: "center",
    zIndex: 10,
    gap: 18,
  },
  reelsActionCol: {
    alignItems: "center",
  },
  reelsActionCount: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  reelsDots: {
    flexDirection: "row",
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    left: 0,
    right: 0,
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 28 * 0.25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaWrap: {
    width: "100%",
    position: "relative",
  },
  carouselBleed: {
    alignSelf: "stretch",
    width: "100%",
  },
  carouselRoot: {
    position: "relative",
    overflow: "hidden",
  },
  carouselRootList: {
    minHeight: LIST_MEDIA_MIN_HEIGHT,
  },
  carouselList: {
    flex: 1,
  },
  carouselListPlaceholder: {
    flex: 1,
    backgroundColor: "#000",
  },
  carouselListContent: {
    flexGrow: 1,
  },
  carouselPage: {
    overflow: "hidden",
    backgroundColor: "#000",
  },
  mediaFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  emptyMedia: {
    width: "100%",
  },
  emptyMediaList: {
    minHeight: LIST_MEDIA_MIN_HEIGHT,
  },
  heartBurst: {
    position: "absolute",
    top: "40%",
    left: "40%",
  },
  dotsRow: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    left: 0,
    right: 0,
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  videoDurationBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  soundIconWrap: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  videoDurationText: {
    fontSize: 11,
    fontWeight: "700",
  },
  caption: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  musicText: {
    marginTop: 10,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
