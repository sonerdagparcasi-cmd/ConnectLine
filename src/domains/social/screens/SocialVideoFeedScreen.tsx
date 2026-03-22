// src/domains/social/screens/SocialVideoFeedScreen.tsx
// FAZ 4 – Full-screen vertical short video feed

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

import type { SocialStackParamList } from "../navigation/SocialNavigator";
import {
  getTrendingVideos,
  subscribeFeed,
  toggleLike,
} from "../services/socialFeedStateService";

import {
  isFollowing,
  toggleFollow,
} from "../services/socialFollowService";

import type { SocialPost } from "../types/social.types";

type Nav = NativeStackNavigationProp<SocialStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SocialVideoFeedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const [muted, setMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const [videos, setVideos] = useState<SocialPost[]>(() =>
    getTrendingVideos(50)
  );

  useEffect(() => {
    const sync = () => setVideos(getTrendingVideos(50));
    sync();
    return subscribeFeed(sync);
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      const idx = viewableItems[0]?.index;
      if (idx != null) setCurrentIndex(idx);
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const openPost = useCallback(
    (postId: string) => {
      navigation.navigate("SocialPostDetail", { postId });
    },
    [navigation]
  );

  function renderItem({ item, index }: { item: SocialPost; index: number }) {
    const media = item.media?.[0];
    const isVideo = media?.type === "video";
    const isActive = index === currentIndex;
    const likeColor = T.isDark ? "#1834ae" : "#00bfff";

    return (
      <View style={styles.item}>
        {isVideo && media?.uri ? (
          <Video
            source={{ uri: media.uri }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive}
            isLooping
            isMuted={muted}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.placeholder,
              { backgroundColor: T.backgroundColor },
            ]}
          >
            <Ionicons name="videocam" size={48} color={T.mutedText} />
          </View>
        )}

        {/* Overlay gradient */}
        <View style={styles.overlay} pointerEvents="box-none">
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconBtn}
            >
              <Ionicons name="arrow-back" size={24} color={T.cardBg} />
            </TouchableOpacity>
            <Text style={styles.title}>{t("social.trendingVideos")}</Text>
          </View>

          {/* Right side actions */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              onPress={() => toggleFollow(item.userId)}
              style={styles.actionRow}
            >
              <View style={[styles.actionCircle, { backgroundColor: T.cardBg + "99" }]}>
                <Ionicons name="person-add" size={22} color={T.cardBg} />
              </View>
              <Text style={styles.actionLabel}>
                {isFollowing(item.userId) ? t("social.following") : t("social.follow")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleLike(item.id)}
              style={styles.actionRow}
            >
              <View style={[styles.actionCircle, { backgroundColor: T.cardBg + "99" }]}>
                <Ionicons
                  name={item.likedByMe ? "heart" : "heart-outline"}
                  size={24}
                  color={item.likedByMe ? likeColor : T.textColor}
                />
              </View>
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: item.likedByMe ? likeColor : T.textColor,
                  },
                ]}
              >
                {String(item.likeCount ?? 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openPost(item.id)}
              style={styles.actionRow}
            >
              <View style={[styles.actionCircle, { backgroundColor: T.cardBg + "99" }]}>
                <Ionicons name="chatbubble-outline" size={20} color={T.cardBg} />
              </View>
              <Text style={styles.actionLabel}>{String(item.commentCount ?? 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openPost(item.id)}
              style={styles.actionRow}
            >
              <View style={[styles.actionCircle, { backgroundColor: T.cardBg + "99" }]}>
                <Ionicons name="share-outline" size={20} color={T.cardBg} />
              </View>
              <Text style={styles.actionLabel}>{t("social.share")}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom info */}
          <TouchableOpacity
            style={styles.bottomInfo}
            onPress={() => openPost(item.id)}
            activeOpacity={1}
          >
            <Text style={styles.username}>{item.username}</Text>
            {(item.caption ?? "").length > 0 && (
              <Text style={styles.caption} numberOfLines={2}>
                {item.caption}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Mute toggle */}
        <TouchableOpacity
          style={styles.muteBtn}
          onPress={() => setMuted((m) => !m)}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={26}
            color={T.cardBg}
          />
        </TouchableOpacity>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: T.backgroundColor }]}>
        <Ionicons name="videocam-outline" size={64} color={T.mutedText} />
        <Text style={[styles.emptyText, { color: T.mutedText }]}>
          {t("social.noVideos")}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: T.accent, fontWeight: "700" }}>
            {t("common.cancel")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <FlatList
        ref={listRef}
        data={videos}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    height: SCREEN_HEIGHT,
    width: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  iconBtn: { padding: 8 },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 12,
  },
  rightActions: {
    position: "absolute",
    right: 12,
    bottom: 120,
    alignItems: "center",
    gap: 20,
  },
  actionRow: { alignItems: "center" },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    marginTop: 4,
  },
  bottomInfo: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  username: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  caption: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 4,
  },
  muteBtn: {
    position: "absolute",
    right: 16,
    bottom: 100,
    padding: 8,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: { fontSize: 15, marginTop: 12, textAlign: "center" },
});
