import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  PanResponder,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "../../../../shared/i18n/t";

import { switchTestUser, useSocialProfile } from "../../hooks/useSocialProfile";
import { sendSocialMessage } from "../../services/socialMessageService";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getCurrentSocialUserId } from "../../services/socialFollowService";
import { getEventById } from "../../services/socialEventService";
import { groupStoriesByUser } from "../services/socialStoryGroupService";
import {
  addReaction,
  deleteStory,
  getStories,
  getStoryMeta,
  getStoryViewers,
  getUserDisplay,
  markStoryViewed,
  socialStoryStateService,
  subscribeStories,
} from "../services/socialStoryStateService";
import {
  mapStoryToFeedSignal,
  pushFeedSignal,
} from "../../services/socialFeedBridgeService";
import {
  addStoryReaction,
  getStoryReplyCount,
  subscribeStoryReplies,
} from "../../services/socialStoryReplyService";

const STORY_DURATION_MS = 6000;
const SWIPE_THRESHOLD = 60;
const SWIPE_VISUAL_LIMIT = 80;
const { width: SCREEN_W } = Dimensions.get("window");

const REACTIONS = ["💙", "🔥", "👍", "👏", "😂", "🤔", "🎉"] as const;

export default function SocialStoryViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profile } = useSocialProfile();
  const T = useAppTheme();
  const insets = useSafeAreaInsets();

  const currentUserId = getCurrentSocialUserId();

  const progress = useRef(new Animated.Value(0)).current;
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const progressAtPauseRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;

  const initialUserIdParam: string | undefined = route.params?.initialUserId;
  const initialStoryIndexParam: number = route.params?.initialStoryIndex ?? 0;
  const storyIdParam: string | undefined = route.params?.storyId;

  const [storyStoreRev, setStoryStoreRev] = useState(0);
  useEffect(() => {
    const u1 = subscribeStories(() => setStoryStoreRev((n) => n + 1));
    const u2 = subscribeStoryReplies(() => setStoryStoreRev((n) => n + 1));
    return () => {
      u1();
      u2();
    };
  }, []);

  const allStories = useMemo(() => getStories(), [storyStoreRev]);
  const groups = useMemo(
    () =>
      groupStoriesByUser(allStories as any, currentUserId).filter(
        (g) => g.stories.length > 0
      ),
    [allStories, currentUserId]
  );

  const locateByStoryId = useMemo(() => {
    if (!storyIdParam || !groups.length) return null as { gi: number; si: number } | null;
    for (let gi = 0; gi < groups.length; gi++) {
      const si = (groups[gi].stories as any[]).findIndex((s) => s?.id === storyIdParam);
      if (si >= 0) return { gi, si };
    }
    return null;
  }, [groups, storyIdParam]);

  const initialGroupIndex = useMemo(() => {
    if (locateByStoryId) return locateByStoryId.gi;
    if (!initialUserIdParam) return 0;
    const i = groups.findIndex((g) => g.userId === initialUserIdParam);
    return i >= 0 ? i : 0;
  }, [groups, initialUserIdParam, locateByStoryId]);

  const resolvedInitialStoryIndex = locateByStoryId?.si ?? initialStoryIndexParam;

  const [groupIndex, setGroupIndex] = useState<number>(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState<number>(
    Math.max(0, resolvedInitialStoryIndex)
  );
  const [reply, setReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [flyingEmoji, setFlyingEmoji] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [, forceUpdate] = useState(0);

  const [muted, setMuted] = useState(true);

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      setIsPaused(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      setIsPaused(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    setGroupIndex(initialGroupIndex);
    setStoryIndex(Math.max(0, resolvedInitialStoryIndex));
  }, [initialGroupIndex, resolvedInitialStoryIndex]);

  useEffect(() => {
    if (groupIndex >= groups.length) setGroupIndex(Math.max(0, groups.length - 1));
  }, [groupIndex, groups.length]);

  const group = groups[groupIndex];
  const stories = group?.stories ?? [];

  useEffect(() => {
    setStoryIndex((i) => Math.min(Math.max(i, 0), Math.max(stories.length - 1, 0)));
    setReply("");
    setMuted(true);
    progress.setValue(0);
  }, [groupIndex]);

  const story = stories[storyIndex] as any;
  const current = story as any;
  const isOwner = current?.userId === currentUserId;

  const progressWidth = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      }),
    [progress]
  );

  const meName = useMemo(() => {
    const raw = profile?.username?.trim();
    if (!raw) return t("social.you");
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return parts[0] ?? t("social.you");
    return `${parts[0]} ${parts[1][0]}`;
  }, [profile?.username]);

  const headerName =
    group?.userId === currentUserId ? meName : group?.username ?? "User";
  const headerAvatarUri =
    group?.userId === currentUserId ? profile?.avatarUri ?? null : group?.avatarUri ?? null;

  const storyTimeLabel = useMemo(() => {
    const createdAt = (story as any)?.createdAt;
    if (!createdAt) return "";
    const ts = new Date(createdAt).getTime();
    if (!Number.isFinite(ts)) return "";
    const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
    if (diffMin < 1) return t("social.now");
    if (diffMin < 60) return `${diffMin} dk`;
    const h = Math.floor(diffMin / 60);
    return `${h} sa`;
  }, [story?.id]);

  useEffect(() => {
    if (!story) return;
    markStoryViewed(story.id);
  }, [story?.id]);

  useEffect(() => {
    if (!current?.id || !currentUserId) return;
    socialStoryStateService.addView(current.id, currentUserId);
  }, [storyIndex, currentUserId, current?.id, isOwner, profile?.username]);

  function stopPlayback() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    progressAnimRef.current?.stop();
    progress.stopAnimation((v) => {
      progressAtPauseRef.current = typeof v === "number" ? v : 0;
    });
  }

  function startPlayback(from?: number) {
    const startFrom = typeof from === "number" ? from : progressAtPauseRef.current;
    const clamped = Math.max(0, Math.min(1, startFrom));

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    progressAnimRef.current?.stop();

    progress.setValue(clamped);
    progressAtPauseRef.current = clamped;

    const remainingMs = Math.max(0, Math.round(STORY_DURATION_MS * (1 - clamped)));

    timerRef.current = setTimeout(() => {
      progressAtPauseRef.current = 0;
      goNext();
    }, remainingMs);

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: remainingMs,
      useNativeDriver: false,
    });
    progressAnimRef.current = anim;
    anim.start();
  }

  const goNextUser = useCallback(() => {
    setGroupIndex((g) => {
      const next = g + 1;
      if (next >= groups.length) return g;
      setStoryIndex(0);
      return next;
    });
  }, [groups.length]);

  const goPrevUser = useCallback(() => {
    setGroupIndex((g) => {
      const prevIdx = Math.max(0, g - 1);
      const prev = groups[prevIdx];
      const last = prev?.stories?.length ? prev.stories.length - 1 : 0;
      setStoryIndex(last);
      return prevIdx;
    });
  }, [groups]);

  const goNext = useCallback(() => {
    if (storyIndex < stories.length - 1) {
      progressAtPauseRef.current = 0;
      setStoryIndex((i) => i + 1);
      return;
    }
    if (groupIndex < groups.length - 1) {
      progressAtPauseRef.current = 0;
      setGroupIndex((g) => g + 1);
      setStoryIndex(0);
      return;
    }
    navigation.goBack();
  }, [storyIndex, stories.length, groupIndex, groups.length, navigation]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      return;
    }
    if (groupIndex > 0) {
      const prev = groups[groupIndex - 1];
      const last = prev?.stories?.length ? prev.stories.length - 1 : 0;
      setGroupIndex((g) => g - 1);
      setStoryIndex(last);
    }
  }, [storyIndex, groupIndex, groups]);

  useEffect(() => {
    if (!story) return;
    if (isPaused || isTyping || isHolding || menuOpen || showStats) {
      stopPlayback();
      return;
    }
    progressAtPauseRef.current = 0;
    startPlayback(0);
    return () => stopPlayback();
  }, [story?.id, isPaused, isTyping, isHolding, menuOpen, showStats]);

  useEffect(() => {
    Animated.timing(dim, {
      toValue: isHolding ? 1 : 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [isHolding]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
      onPanResponderMove: (_, g) => {
        const clamped = Math.max(-SWIPE_VISUAL_LIMIT, Math.min(SWIPE_VISUAL_LIMIT, g.dx));
        pan.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -60) {
          setShowStats(true);
          stopPlayback();
        }
        if (g.dx > SWIPE_THRESHOLD) goPrevUser();
        else if (g.dx < -SWIPE_THRESHOLD) goNextUser();

        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          tension: 110,
          friction: 16,
        }).start();
      },
    })
  ).current;

  function handleReaction(emoji: (typeof REACTIONS)[number]) {
    if (!currentUserId || !current?.id) return;

    addReaction(current.id, currentUserId, emoji);
    addStoryReaction(
      current.id,
      currentUserId,
      profile?.username ?? t("social.you"),
      emoji,
      group.userId
    );

    pushFeedSignal(
      mapStoryToFeedSignal(current, {
        userId: currentUserId,
        type: "reaction",
      })
    );

    forceUpdate((x) => x + 1);

    setFlyingEmoji(emoji);

    translateY.setValue(0);
    opacity.setValue(1);
    scale.setValue(1);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.8,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFlyingEmoji(null);
    });
  }

  if (!story) {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <StatusBar hidden />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.closeBtn, styles.closeBtnTopRight]}
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t("social.story.empty")}</Text>
        </View>
      </View>
    );
  }

  const media = (story as any)?.media;
  const linkedEvent = (story as any)?.eventId
    ? getEventById((story as any).eventId)
    : null;
  const isVideo = media?.type === "video";
  const mediaUri = media?.uri ?? null;

  const meta = getStoryMeta(story.id);
  const storyViewersList = getStoryViewers(story.id);
  const seenListForUi =
    storyViewersList.length > 0
      ? storyViewersList
      : (meta.seenBy ?? []).map((uid) => ({
          userId: uid,
          username: getUserDisplay(uid).username,
          seenAt: "",
        }));
  const uniqueSeenCount = Math.max(
    meta.seenBy?.length ?? 0,
    storyViewersList.length
  );
  const replyCount = getStoryReplyCount(story.id);

  return (
    <View style={styles.container} pointerEvents="box-none" {...panResponder.panHandlers}>
      <StatusBar hidden />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.closeBtn, styles.closeBtnTopRight]}
        activeOpacity={0.85}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.headerIconBtn, { top: Math.max(insets.top, 6), right: 52 }]}
        onPress={() => navigation.navigate("SocialInbox")}
        hitSlop={12}
      >
        <Ionicons name="mail-outline" size={22} color="#fff" />
      </TouchableOpacity>

      {__DEV__ ? (
        <TouchableOpacity
          style={[styles.devSwitchBtn, { top: Math.max(insets.top, 6) }]}
          onPress={() => {
            switchTestUser();
            forceUpdate((x) => x + 1);
          }}
        >
          <Text style={styles.devSwitchText}>Kullanıcı</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.progressRow}>
            {stories.map((_: any, i: number) => (
              <View
                key={`${group.userId}-${i}`}
                style={[
                  styles.progressSegment,
                  i !== stories.length - 1 ? { marginRight: 4 } : null,
                ]}
              >
                {i < storyIndex && (
                  <View style={[styles.progressFill, { width: "100%" }]} />
                )}
                {i === storyIndex && (
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressWidth,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.headerLeft}
              onPress={() => {
                if (group.userId !== currentUserId) {
                  navigation.navigate("SocialProfileContainer", { userId: group.userId });
                }
              }}
            >
              {headerAvatarUri ? (
                <Image source={{ uri: headerAvatarUri }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerAvatarFallback}>
                  <Ionicons name="person" size={16} color="#fff" />
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {headerName}
                </Text>
                {storyTimeLabel ? (
                  <Text style={styles.headerTime} numberOfLines={1}>
                    {storyTimeLabel}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>

            {isOwner && (
              <TouchableOpacity
                onPress={() => setMenuOpen(true)}
                style={{ marginLeft: "auto" }}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Animated.View style={[styles.mediaWrap, { transform: [{ translateX: pan }] }]}>
        {isVideo ? (
          <Video
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted={muted}
          />
        ) : (
          <Image
            source={{ uri: mediaUri }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
        )}
        {(() => {
          const ov = (story as { overlays?: unknown })?.overlays;
          if (
            !ov ||
            typeof ov !== "object" ||
            ov === null ||
            !("text" in ov) ||
            Array.isArray((ov as { texts?: unknown }).texts)
          ) {
            return null;
          }
          const t = (ov as { text?: string }).text?.trim();
          if (!t) return null;
          const o = ov as unknown as {
            x: number;
            y: number;
            scale?: number;
            color?: string;
          };
          return (
            <Text
              pointerEvents="none"
              style={{
                position: "absolute",
                left: o.x,
                top: o.y,
                color: o.color ?? "#FFFFFF",
                fontSize: 26,
                fontWeight: "800",
                lineHeight: 32,
                maxWidth: "90%",
                transform: [{ scale: o.scale ?? 1 }],
                textShadowColor: "rgba(0,0,0,0.65)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {t}
            </Text>
          );
        })()}
      </Animated.View>

      {linkedEvent && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("SocialEventDetail", {
              eventId: linkedEvent.id,
            })
          }
          style={{
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
            backgroundColor: "#00bfff",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff" }}>Etkinliği Gör</Text>
        </TouchableOpacity>
      )}

      {isVideo && (
        <TouchableOpacity
          style={styles.soundBtn}
          activeOpacity={0.9}
          onPress={() => setMuted((m) => !m)}
        >
          <Ionicons name={muted ? "volume-mute" : "volume-high"} size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {keyboardHeight === 0 && (
        <View
          style={{
            position: "absolute",
            right: 10,
            top: "40%",
            zIndex: 100,
            elevation: 100,
          }}
          pointerEvents="box-none"
        >
          {REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={{
                marginVertical: 6,
              }}
              onPress={() => handleReaction(emoji)}
              onLongPress={() => setShowPicker(true)}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 22 }}>{emoji === "💙" ? "💙" : emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showPicker && (
        <View
          style={{
            position: "absolute",
            bottom: 120,
            alignSelf: "center",
            flexDirection: "row",
            backgroundColor: "rgba(0,0,0,0.9)",
            padding: 10,
            borderRadius: 20,
            gap: 10,
            zIndex: 999,
            elevation: 999,
          }}
        >
          {REACTIONS.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => {
                handleReaction(e);
                setShowPicker(false);
              }}
            >
              <Text style={{ fontSize: 26 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {flyingEmoji && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 40,
            bottom: 120,
            transform: [{ translateY }, { scale }],
            opacity,
            zIndex: 999,
            elevation: 999,
          }}
        >
          <Text style={{ fontSize: 40 }}>{flyingEmoji}</Text>
        </Animated.View>
      )}

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "#000",
            opacity: dim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
          },
        ]}
      />

      <View
        style={styles.tapRow}
        pointerEvents={keyboardHeight > 0 ? "none" : "box-none"}
      >
        <TouchableOpacity
          style={styles.tapZone}
          onPress={goPrev}
          onPressIn={() => {
            setIsHolding(true);
            stopPlayback();
          }}
          onPressOut={() => {
            setIsHolding(false);
            startPlayback();
          }}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={styles.tapZone}
          onPress={goNext}
          onPressIn={() => {
            setIsHolding(true);
            stopPlayback();
          }}
          onPressOut={() => {
            setIsHolding(false);
            startPlayback();
          }}
          activeOpacity={1}
        />
      </View>

      {!isOwner && (
        <View
          style={[
            styles.replyWrap,
            {
              bottom:
                keyboardHeight > 0
                  ? keyboardHeight - insets.bottom - 25
                  : 20,
            },
          ]}
        >
          {replyCount > 0 ? (
            <Text style={styles.replyCountHint} numberOfLines={1}>
              {replyCount} yanıt
            </Text>
          ) : null}
          <View style={styles.replyRow}>
            <View
              style={[
                styles.replyBox,
                {
                  backgroundColor: T.isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)",
                  borderColor: "rgba(255,255,255,0.15)",
                },
              ]}
            >
              <TextInput
                value={reply}
                onChangeText={setReply}
                placeholder={t("story_reply_placeholder")}
                placeholderTextColor={T.mutedText}
                style={[styles.replyInput, { color: T.textColor }]}
                multiline
                maxLength={240}
                onFocus={() => {
                  setIsTyping(true);
                  setIsPaused(true);
                }}
                onBlur={() => {
                  setIsTyping(false);
                  setIsPaused(false);
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!reply.trim() || !currentUserId}
              style={[
                styles.sendBtn,
                {
                  opacity: reply.trim() && currentUserId ? 1 : 0.4,
                },
              ]}
              onPress={() => {
                const text = reply.trim();
                if (!text || !currentUserId) return;
                socialStoryStateService.addReply(story.id, {
                  userId: currentUserId,
                  text,
                  username: profile?.username ?? t("social.you"),
                  targetUserId: group.userId,
                });
                sendSocialMessage({
                  id: `msg_${Date.now()}`,
                  senderId: currentUserId,
                  receiverId: group.userId,
                  text,
                  type: "story_reply",
                  storyId: story.id,
                  createdAt: new Date().toISOString(),
                });
                pushFeedSignal(
                  mapStoryToFeedSignal(story, {
                    userId: currentUserId,
                    type: "reply",
                  })
                );
                setReply("");
                setIsTyping(false);
                Keyboard.dismiss();
              }}
            >
              <LinearGradient
                colors={["#00BFFF", "#1834AE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtnGradient}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {menuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate("SocialCreateStory", {
                editMode: true,
                storyId: current?.id,
              });
            }}
          >
            <Text style={styles.menuItem}>{t("social.feed.edit")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              deleteStory(current?.id);
              setMenuOpen(false);
              navigation.goBack();
            }}
          >
            <Text style={[styles.menuItem, { color: "red" }]}>{t("social.feed.delete")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuOpen(false)}>
            <Text style={styles.menuItem}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {showStats && (
        <View style={styles.statsBackdrop}>
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowStats(false)}
          />

          <View style={styles.statsPanel}>
            <View style={styles.statsHandle} />

            <View style={styles.statsHeader}>
              <Text style={styles.statsHeaderTitle}>{t("social.storyInsights")}</Text>
              <TouchableOpacity
                onPress={() => setShowStats(false)}
                style={styles.statsHeaderClose}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsCountsRow}>
              <Text style={styles.statTitle}>
                👀 {uniqueSeenCount} görüntüleme
              </Text>
              <Text style={styles.statTitle}>
                ❤️ {(meta.likedBy?.length ?? 0)} beğeni
              </Text>
              <Text style={styles.statTitle}>
                🔥 {(meta.reactions?.length ?? 0)} reaksiyon
              </Text>
              {isOwner ? (
                <Text style={styles.statTitle}>💬 {replyCount} yanıt</Text>
              ) : null}
            </View>

            {isOwner ? (
              <>
                <Text style={styles.sectionTitle}>{t("social.story.viewersTitle")}</Text>
                <FlatList
                  data={seenListForUi}
                  keyExtractor={(i, idx) => `seen-${i.userId}-${i.seenAt || idx}`}
                  style={styles.list}
                  renderItem={({ item }) => {
                    const u = getUserDisplay(item.userId);
                    const seenLabel = item.seenAt
                      ? new Date(item.seenAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";
                    return (
                      <View style={styles.userRow}>
                        {u.avatarUri ? (
                          <Image source={{ uri: u.avatarUri }} style={styles.userAvatar} />
                        ) : (
                          <View style={styles.userAvatarFallback}>
                            <Ionicons name="person" size={16} color="#fff" />
                          </View>
                        )}
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.userName} numberOfLines={1}>
                            {item.username || u.username}
                          </Text>
                          <Text style={styles.userMeta} numberOfLines={1}>
                            {seenLabel || u.userId}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                />

                <Text style={styles.sectionTitle}>{t("social.story.likers")}</Text>
                <FlatList
                  data={meta.likedBy ?? []}
                  keyExtractor={(i) => `like-${i}`}
                  style={styles.list}
                  renderItem={({ item }) => {
                    const u = getUserDisplay(item);
                    return (
                      <View style={styles.userRow}>
                        {u.avatarUri ? (
                          <Image source={{ uri: u.avatarUri }} style={styles.userAvatar} />
                        ) : (
                          <View style={styles.userAvatarFallback}>
                            <Ionicons name="person" size={16} color="#fff" />
                          </View>
                        )}
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.userName} numberOfLines={1}>
                            {u.username}
                          </Text>
                          <Text style={styles.userMeta} numberOfLines={1}>
                            {u.userId}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                />
              </>
            ) : (
              <Text style={styles.statsHint}>
                Bu story’nin detaylı istatistikleri sadece sahibine gösterilir.
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  closeBtn: {
    alignItems: "center",
    justifyContent: "center",
  },

  closeBtnTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
    padding: 8,
  },

  headerIconBtn: {
    position: "absolute",
    zIndex: 999,
    elevation: 999,
    padding: 8,
  },
  devSwitchBtn: {
    position: "absolute",
    left: 10,
    zIndex: 999,
    elevation: 999,
    backgroundColor: "rgba(220,38,38,0.45)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  devSwitchText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 50,
    elevation: 50,
  },

  headerContent: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingRight: 56,
  },

  progressRow: {
    flexDirection: "row",
    paddingBottom: 10,
  },
  progressSegment: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    maxWidth: SCREEN_W - 24 - 42,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerTime: {
    marginTop: 2,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  mediaWrap: {
    flex: 1,
  },

  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  media: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  soundBtn: {
    position: "absolute",
    right: 12,
    bottom: 150,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  tapRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 110,
    bottom: 0,
    flexDirection: "row",
  },
  tapZone: { flex: 1 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  replyWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
  },
  replyCountHint: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  replyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  replyBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  replyInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 88,
    fontSize: 14,
    fontWeight: "600",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  menuOverlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 12,
  },

  menuItem: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    textAlign: "center",
  },

  statsPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    zIndex: 20,
    maxHeight: 520,
  },

  statTitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "700",
  },

  statsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: "flex-end",
  },

  statsHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    marginBottom: 10,
  },

  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  statsHeaderTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  statsHeaderClose: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  statsCountsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  sectionTitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  list: {
    maxHeight: 150,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },

  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  userAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  userMeta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  statsHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 14,
  },
});

