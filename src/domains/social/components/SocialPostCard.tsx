// src/domains/social/components/SocialPostCard.tsx
// 🔒 SOCIAL POST CARD – MEDIA + TIME + ARCHIVE + ACTIONS (STABLE)
// UPDATED:
// - double tap like
// - heart animation
// - gesture safe implementation
// - event feed support (non-breaking)

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import type { SocialPost } from "../types/social.types";
import SocialEventFeedCard from "./SocialEventFeedCard";
import SocialReactionBar from "./SocialReactionBar";

type Props = {
  post: SocialPost;
  onPressPost: () => void;
  onPressMedia: (initialIndex: number) => void;
  onToggleLike: () => void;
  onPressComments: () => void;
  onPressMenu: () => void;

  onPressShare?: () => void;
  onToggleSave?: () => void;
  saved?: boolean;
};

function SocialPostCard({
  post,
  onPressPost,
  onPressMedia,
  onToggleLike,
  onPressComments,
  onPressMenu,
  onPressShare,
  onToggleSave,
  saved,
}: Props) {

  const T = useAppTheme();

  /* --------------------------------------------------------------- */
  /* EVENT FEED CARD SUPPORT                                         */
  /* --------------------------------------------------------------- */

  // Eğer post bir etkinlik içeriyorsa
  // normal post yerine event kartı gösterilir
  // bu mimariyi bozmaz çünkü feed hala SocialPost render eder

  // @ts-ignore (event property optional olabilir)
  if (post.event) {
    // @ts-ignore
    return <SocialEventFeedCard event={post.event} />;
  }

  const media = post.media ?? [];

  const displaySlots = useMemo(() => {
    if (media.length <= 1) {
      return media.map((m, originalIndex) => ({ m, originalIndex }));
    }
    const ci = post.coverIndex;
    const coverPos = ci != null && ci >= 0 && ci < media.length ? ci : 0;
    if (coverPos === 0) {
      return media.map((m, originalIndex) => ({ m, originalIndex }));
    }
    return [
      { m: media[coverPos], originalIndex: coverPos },
      ...media
        .map((m, originalIndex) => ({ m, originalIndex }))
        .filter((x) => x.originalIndex !== coverPos),
    ];
  }, [media, post.coverIndex]);

  const lastTap = useRef<number>(0);

  const heartScale = useRef(new Animated.Value(0)).current;
  const [showHeart, setShowHeart] = useState(false);

  /* --------------------------------------------------------------- */
  /* HEART ANIMATION                                                 */
  /* --------------------------------------------------------------- */

  function animateHeart() {
    setShowHeart(true);

    heartScale.setValue(0.3);

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 250,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeart(false);
    });
  }

  /* --------------------------------------------------------------- */
  /* DOUBLE TAP                                                      */
  /* --------------------------------------------------------------- */

  function handleDoubleTap(index: number) {
    const now = Date.now();

    if (lastTap.current && now - lastTap.current < 300) {
      onToggleLike();
      animateHeart();
    } else {
      lastTap.current = now;
      onPressMedia(index);
    }
  }

  /* --------------------------------------------------------------- */
  /* TIME FORMAT                                                     */
  /* --------------------------------------------------------------- */

  function getTimeAgo(date: string) {
    const now = new Date();
    const created = new Date(date);

    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return t("social.time.now");

    const min = Math.floor(diff / 60);
    if (min < 60)
      return t("social.time.minAgo").replace("{{m}}", String(min));

    const hour = Math.floor(min / 60);
    if (hour < 24)
      return t("social.time.hourAgo").replace("{{h}}", String(hour));

    const day = Math.floor(hour / 24);
    return t("social.time.dayAgo").replace("{{d}}", String(day));
  }

  /* --------------------------------------------------------------- */
  /* ACTION WRAPPERS                                                 */
  /* --------------------------------------------------------------- */

  function handleLike() {
    onToggleLike?.();
  }

  function handleComment() {
    onPressComments?.();
  }

  function handleShare() {
    onPressShare?.();
  }

  function handleSave() {
    onToggleSave?.();
  }

  /* --------------------------------------------------------------- */
  /* MEDIA GRID                                                      */
  /* --------------------------------------------------------------- */

  function renderMedia() {
    if (!media.length) {
      return (
        <View
          style={[
            styles.singleMedia,
            { backgroundColor: T.backgroundColor },
          ]}
        />
      );
    }

    if (media.length === 1) {
      const m = media[0];
      const isVideo = m.type === "video";

      return (
        <Pressable onPress={() => handleDoubleTap(0)} style={styles.singleMediaWrap}>
          <Image source={{ uri: m.uri }} style={styles.singleMedia} />
          {isVideo && (
            <>
              <View style={[styles.videoPlayOverlay, { backgroundColor: T.textColor + "40" }]}>
                <Ionicons name="play-circle" size={48} color={T.cardBg} />
              </View>
              {m.durationSec != null && (
                <View style={[styles.videoDurationBadge, { backgroundColor: T.textColor + "dd" }]}>
                  <Text style={[styles.videoDurationText, { color: T.cardBg }]}>
                    {Math.floor(m.durationSec / 60)}:
                    {String(m.durationSec % 60).padStart(2, "0")}
                  </Text>
                </View>
              )}
            </>
          )}
        </Pressable>
      );
    }

    if (media.length === 2) {
      return (
        <View style={styles.row}>
          {displaySlots.map((slot) => (
            <Pressable
              key={slot.m.id ?? `m_${slot.originalIndex}`}
              style={styles.half}
              onPress={() => handleDoubleTap(slot.originalIndex)}
            >
              <Image source={{ uri: slot.m.uri }} style={styles.mediaImg} />
            </Pressable>
          ))}
        </View>
      );
    }

    if (media.length === 3) {
      const [first, ...rest] = displaySlots;
      return (
        <>
          <Pressable onPress={() => handleDoubleTap(first.originalIndex)}>
            <Image source={{ uri: first.m.uri }} style={styles.bigTop} />
          </Pressable>

          <View style={styles.row}>
            {rest.map((slot) => (
              <Pressable
                key={slot.m.id ?? `m_${slot.originalIndex}`}
                style={styles.half}
                onPress={() => handleDoubleTap(slot.originalIndex)}
              >
                <Image source={{ uri: slot.m.uri }} style={styles.mediaImg} />
              </Pressable>
            ))}
          </View>
        </>
      );
    }

    const [hero, ...rowRest] = displaySlots;
    return (
      <>
        <Pressable onPress={() => handleDoubleTap(hero.originalIndex)}>
          <Image source={{ uri: hero.m.uri }} style={styles.bigTop} />
        </Pressable>

        <View style={styles.row}>
          {rowRest.slice(0, 3).map((slot) => (
            <Pressable
              key={slot.m.id ?? `m_${slot.originalIndex}`}
              style={styles.third}
              onPress={() => handleDoubleTap(slot.originalIndex)}
            >
              <Image source={{ uri: slot.m.uri }} style={styles.mediaImg} />
            </Pressable>
          ))}
        </View>
      </>
    );
  }

  /* --------------------------------------------------------------- */

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: T.cardBg, borderColor: T.border },
      ]}
    >
      {/* HEADER */}

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
              {post.username}
            </Text>

            <Text style={{ color: T.mutedText, fontSize: 12 }}>
              {getTimeAgo(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {onToggleSave && (
          <TouchableOpacity onPress={handleSave} style={{ marginRight: 12 }}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={T.textColor}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onPressMenu}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={T.mutedText}
          />
        </TouchableOpacity>
      </View>

      {/* MEDIA */}

      <View style={styles.mediaWrap}>
        {renderMedia()}

        {showHeart && (
          <Animated.View
            style={[
              styles.heartOverlay,
              { transform: [{ scale: heartScale }] },
            ]}
          >
            <Ionicons name="heart" size={90} color="#ff2d55" />
          </Animated.View>
        )}
      </View>

      {/* MUSIC */}

      {!!post.music?.title && (
        <Text style={[styles.musicText, { color: T.mutedText }]}>
          🎵 {post.music.title}
          {post.music.artist ? ` • ${post.music.artist}` : ""}
        </Text>
      )}

      {/* CAPTION */}

      {!!post.caption && (
        <Text
          style={[styles.caption, { color: T.textColor }]}
          numberOfLines={3}
        >
          {post.caption}
        </Text>
      )}

      {/* REACTIONS */}

      <SocialReactionBar
        liked={post.likedByMe}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        saved={saved}
        showLikeCount={post.settings?.likesVisible !== false}
        commentsEnabled={post.settings?.comments !== false}
        onToggleLike={handleLike}
        onPressComments={handleComment}
        onPressShare={handleShare}
        onToggleSave={handleSave}
      />
    </View>
  );
}

export default React.memo(SocialPostCard);

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
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
  },

  heartOverlay: {
    position: "absolute",
    top: "40%",
    left: "40%",
  },

  singleMediaWrap: {
    position: "relative",
  },
  singleMedia: {
    width: "100%",
    height: 320,
    borderRadius: 14,
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  videoDurationBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  videoDurationText: {
    fontSize: 11,
    fontWeight: "700",
  },

  bigTop: {
    width: "100%",
    height: 260,
    borderRadius: 14,
  },

  row: {
    flexDirection: "row",
    marginTop: 4,
    gap: 4,
  },

  half: {
    flex: 1,
    height: 160,
  },

  third: {
    flex: 1,
    height: 120,
  },

  mediaImg: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
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
});