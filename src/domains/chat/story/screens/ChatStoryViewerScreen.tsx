import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
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

import { useChatProfile } from "../../profile/useChatProfile";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { groupStoriesByUser } from "../chatStoryGroupService";
import { chatService } from "../../services/chatService";
import { createStoryReplyMessage } from "../../services/chatMessageFactory";
import {
  deleteStory,
  getStories,
  getUserDisplay,
  markStorySeen,
  markStoryViewed,
  toggleStoryLike,
} from "../chatStoryStateService";

const STORY_DURATION_MS = 6000;
const SWIPE_THRESHOLD = 60;
const SWIPE_VISUAL_LIMIT = 80;
const { width: SCREEN_W } = Dimensions.get("window");

export default function ChatStoryViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profile } = useChatProfile();
  const T = useAppTheme();
  const insets = useSafeAreaInsets();
  const currentUserId = "me";

  const progress = useRef(new Animated.Value(0)).current;
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const progressAtPauseRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;

  const currentUserIdParam: string = route.params?.currentUserId ?? "me";
  const initialStoryIndexParam: number = route.params?.initialStoryIndex ?? 0;

  // Single source: story state service
  const allStories = useMemo(() => getStories(), []);
  const groups = useMemo(
    () => groupStoriesByUser(allStories as any).filter((g) => g.stories.length > 0),
    [allStories]
  );

  const initialGroupIndex = useMemo(() => {
    const i = groups.findIndex((g) => g.userId === currentUserIdParam);
    return i >= 0 ? i : 0;
  }, [groups, currentUserIdParam]);

  const [groupIndex, setGroupIndex] = useState<number>(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState<number>(
    Math.max(0, initialStoryIndexParam)
  );
  const [reply, setReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    setGroupIndex(initialGroupIndex);
    setStoryIndex(Math.max(0, initialStoryIndexParam));
  }, [initialGroupIndex, initialStoryIndexParam]);

  // If groups change (rare in current UI-only impl), keep indices safe
  useEffect(() => {
    if (groupIndex >= groups.length) setGroupIndex(Math.max(0, groups.length - 1));
  }, [groupIndex, groups.length]);

  const group = groups[groupIndex];
  const stories = group?.stories ?? [];

  useEffect(() => {
    // clamp storyIndex when user changes
    setStoryIndex((i) => Math.min(Math.max(i, 0), Math.max(stories.length - 1, 0)));
    setReply("");
    progress.setValue(0);
  }, [groupIndex]);

  const story = stories[storyIndex];
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
    const raw = profile?.displayName?.trim();
    if (!raw) return "Sen";
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return parts[0] ?? "Sen";
    return `${parts[0]} ${parts[1][0]}`;
  }, [profile?.displayName]);

  const headerName = group?.userId === "me" ? meName : group?.username ?? "User";
  const headerAvatarUri = group?.userId === "me" ? (profile as any)?.avatarUri ?? null : group?.avatarUri ?? null;

  const storyTimeLabel = useMemo(() => {
    const createdAt = (story as any)?.createdAt;
    if (!createdAt) return "";
    const ts = new Date(createdAt).getTime();
    if (!Number.isFinite(ts)) return "";
    const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
    if (diffMin < 1) return "şimdi";
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
    markStorySeen(current.id, currentUserId);
  }, [storyIndex, currentUserId]);

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

    // clear existing
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
    anim.start(({ finished }) => {
      if (finished) {
        // timer will fire goNext; keep single source of truth
      }
    });
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

  // Playback orchestration (timer + progress)
  useEffect(() => {
    if (!story) return;
    if (isTyping || isHolding || menuOpen || showStats) {
      stopPlayback();
      return;
    }
    progressAtPauseRef.current = 0;
    startPlayback(0);
    return () => stopPlayback();
  }, [story?.id, isTyping, isHolding, menuOpen, showStats]);

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
      onPanResponderGrant: () => {
        // pause timer/progress by resetting progress; timer effect remains stable per story id
      },
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
        }).start(() => {
          // no-op
        });
      },
    })
  ).current;

  if (!story) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Story yok</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar hidden />
      {/* CLOSE */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeBtn}
        activeOpacity={0.85}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      {/* PROGRESS */}
      <View style={styles.headerContainer}>
        <BlurView intensity={40} tint="dark" style={styles.blur} />
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.0)"]}
          style={styles.gradient}
        />

        <View style={styles.headerContent}>
          <View style={styles.progressRow}>
            {stories.map((_, i) => (
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
            <View style={styles.headerLeft}>
              {headerAvatarUri ? (
                <Image
                  source={{ uri: headerAvatarUri }}
                  style={styles.headerAvatar}
                />
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
            </View>

            {!!currentUserId && !!current?.id && (
              <TouchableOpacity
                onPress={() => toggleStoryLike(current.id, currentUserId)}
                style={{ marginLeft: 10 }}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={
                    current.likedBy?.includes(currentUserId)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
            )}

            {isOwner && (
              <TouchableOpacity
                onPress={() => setMenuOpen(true)}
                style={{ marginLeft: "auto" }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* MEDIA */}
      <Animated.View style={[styles.mediaWrap, { transform: [{ translateX: pan }] }]}>
        <Image
          source={{ uri: (story as any)?.mediaUri }}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
        />
      </Animated.View>

      {/* HOLD DIM */}
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

      {/* TAP ZONES */}
      <View style={styles.tapRow} pointerEvents="box-none">
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

      {/* REPLY */}
      {!isOwner && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={insets.bottom + 12}
          style={styles.replyWrap}
        >
          <View style={styles.replyRow}>
            <View
              style={[
                styles.replyBox,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
            <TextInput
              value={reply}
              onChangeText={setReply}
              placeholder="Story’ye cevap ver"
              placeholderTextColor={T.mutedText}
              style={[styles.replyInput, { color: T.textColor }]}
              multiline
              maxLength={240}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
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

                const chatId = `direct_${group.userId}`;
                const msg = createStoryReplyMessage({
                  text,
                  storyId: story.id,
                  storyOwnerId: group.userId,
                  storyMediaUri: (story as any)?.mediaUri ?? null,
                  status: "sending",
                });

                chatService.getChat(chatId);
                chatService.enqueuePendingMessage(chatId, msg);

                setReply("");
                setIsTyping(false);
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
          <View style={{ height: Math.max(12, insets.bottom) }} />
        </KeyboardAvoidingView>
      )}

      {menuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate("StoryCreate", {
                editMode: true,
                storyId: current?.id,
              });
            }}
          >
            <Text style={styles.menuItem}>Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              deleteStory(current?.id);
              setMenuOpen(false);
              navigation.goBack();
            }}
          >
            <Text style={[styles.menuItem, { color: "red" }]}>Sil</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuOpen(false)}>
            <Text style={styles.menuItem}>İptal</Text>
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
              <Text style={styles.statsHeaderTitle}>İstatistikler</Text>
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
                👀 {(current?.seenBy?.length ?? 0)} görüntüleme
              </Text>
              <Text style={styles.statTitle}>
                ❤️ {(current?.likedBy?.length ?? 0)} beğeni
              </Text>
            </View>

            {isOwner ? (
              <>
                <Text style={styles.sectionTitle}>Görüntüleyenler</Text>
                <FlatList
                  data={current?.seenBy ?? []}
                  keyExtractor={(i) => `seen-${i}`}
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

                <Text style={styles.sectionTitle}>Beğenenler</Text>
                <FlatList
                  data={current?.likedBy ?? []}
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
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  headerContent: {
    paddingTop: 12,
    paddingHorizontal: 12,
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
    resizeMode: "cover",
  },

  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tapRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
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
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
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
    justifyContent: "space-between",
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

