// src/domains/chat/screens/StoryViewerScreen.tsx
// 🔒 ADIM 3 – Story Reply → ChatRoom

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { ChatStory } from "../story/chatStory.types";
import { storyReactionService } from "../story/storyReactionService";
import type { StoryReactionType } from "../story/storyReaction.types";
import { storyReplyService } from "../story/storyReplyService";
import { useChatStories } from "../story/useChatStories";

const STORY_DURATION = 5000;
const SWIPE_THRESHOLD = 50;
const { width } = Dimensions.get("window");

const QUICK_REACTIONS: StoryReactionType[] = ["❤️", "🔥", "😂", "😮", "👏"];

export default function StoryViewerScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { mine, others, markSeen, getSeenCount } = useChatStories();
  const [reactionCount, setReactionCount] = useState(0);

  const allStories: ChatStory[] = useMemo(
    () => [...mine, ...others].flatMap((g) => g.stories),
    [mine, others]
  );

  const startId: string | undefined = route.params?.storyId;
  const startIndex = useMemo(() => {
    if (!startId) return 0;
    const i = allStories.findIndex((s) => s.id === startId);
    return i >= 0 ? i : 0;
  }, [startId, allStories]);

  const [index, setIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");

  const story = allStories[index];
  const progress = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video | null>(null);
  const progressAtPauseRef = useRef(0);
  const [animatingReactionIndex, setAnimatingReactionIndex] = useState<number | null>(null);
  const reactionScale = useRef(new Animated.Value(1)).current;
  const mediaSlideX = useRef(new Animated.Value(0)).current;
  const mediaOpacity = useRef(new Animated.Value(1)).current;

  const progressWidth = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      }),
    [progress]
  );

  useEffect(() => {
    if (!story) return;
    markSeen(story.id);
    setReply("");
    setPaused(false);
    setReactionCount(storyReactionService.getByStory(story.id).length);
    progress.setValue(0);
    startProgress(0);
    return () => stopAll();
  }, [index]);

  /* Story view animation: fade-in + slight horizontal slide when story (index) changes */
  useEffect(() => {
    if (!story) return;
    mediaSlideX.setValue(24);
    mediaOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(mediaSlideX, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(mediaOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, story?.id]);

  function stopAll() {
    progress.stopAnimation();
    try {
      videoRef.current?.pauseAsync();
    } catch {}
  }

  function startProgress(from = 0) {
    progress.stopAnimation();
    progress.setValue(from);
    progressAtPauseRef.current = from;
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION * (1 - from),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !paused) goNext();
    });
  }

  function goNext() {
    stopAll();
    if (index < allStories.length - 1) setIndex((i) => i + 1);
    else navigation.goBack();
  }

  function goPrev() {
    stopAll();
    if (index > 0) setIndex((i) => i - 1);
  }

  function sendReply() {
    if (!story || !reply.trim()) return;

    const text = reply.trim();

    // UI-only kayıt
    storyReplyService.add({
      id: Date.now().toString(),
      storyId: story.id,
      fromUserId: "me",
      text,
      createdAt: Date.now(),
    });

    setReply("");
    stopAll();

    // 🔒 ADIM 3 – ChatRoom’a düş
    navigation.navigate("ChatRoom", {
      chatId: `dm_${story.ownerId}`, // UI-only birebir
      draftMessage: text,
      fromStory: true,
      storyId: story.id,
      peerName: story.ownerName,
    });
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setPaused(true);
        progress.stopAnimation((value) => {
          progressAtPauseRef.current = value;
        });
        videoRef.current?.pauseAsync().catch(() => {});
      },
      onPanResponderRelease: (_, g) => {
        setPaused(false);
        startProgress(progressAtPauseRef.current);
        videoRef.current?.playAsync().catch(() => {});
        if (Math.abs(g.dx) < 15) {
          g.x0 > width / 2 ? goNext() : goPrev();
          return;
        }
        if (g.dx < -SWIPE_THRESHOLD) goNext();
        else if (g.dx > SWIPE_THRESHOLD) goPrev();
      },
    })
  ).current;

  const canSend = reply.trim().length > 0;

  function sendReaction(emoji: StoryReactionType, chipIndex: number) {
    if (!story) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    storyReactionService.add({
      storyId: story.id,
      fromUserId: "me",
      reaction: emoji,
      createdAt: Date.now(),
    });
    setReactionCount((c) => c + 1);
    setAnimatingReactionIndex(chipIndex);
  }

  /* Lightweight scale animation for tapped reaction emoji */
  useEffect(() => {
    if (animatingReactionIndex === null) return;
    reactionScale.setValue(1);
    Animated.sequence([
      Animated.timing(reactionScale, {
        toValue: 1.35,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(reactionScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => setAnimatingReactionIndex(null));
  }, [animatingReactionIndex]);

  if (!story) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.backgroundColor }]} {...panResponder.panHandlers}>
      {/* CLOSE BUTTON */}
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: T.cardBg }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={24} color={T.textColor} />
      </TouchableOpacity>
      {/* PROGRESS BAR */}
      <View style={styles.progressRow}>
        {allStories.map((_, i) => (
          <View key={i} style={[styles.progressSegment, { backgroundColor: T.border }]}>
            {i < index && (
              <View style={[styles.progressFill, { backgroundColor: T.textColor, width: "100%" }]} />
            )}
            {i === index && (
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: T.textColor, width: progressWidth },
                ]}
              />
            )}
          </View>
        ))}
      </View>
      {/* STORY HEADER */}
      <View style={[styles.storyHeader, { borderBottomColor: T.border }]}>
        <View style={[styles.storyHeaderAvatar, { backgroundColor: T.accent }]}>
          <Text style={[styles.storyHeaderAvatarText, { color: T.cardBg }]} numberOfLines={1}>
            {story.ownerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.storyHeaderName, { color: T.textColor }]} numberOfLines={1}>
          {story.ownerName}
        </Text>
      </View>
      {/* MEDIA */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: mediaOpacity,
            transform: [{ translateX: mediaSlideX }],
          },
        ]}
      >
        {story.media?.type === "image" ? (
          <Image source={{ uri: story.media.uri }} style={styles.media} />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: story.media?.uri }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={!paused}
            onPlaybackStatusUpdate={(status: { isLoaded?: boolean; didJustFinishAndNotSeek?: boolean }) => {
              if (status.isLoaded && status.didJustFinishAndNotSeek) goNext();
            }}
          />
        )}
      </Animated.View>

      {/* QUICK REACTIONS */}
      <View style={[styles.reactionsRow, { borderColor: T.border }]}>
        {QUICK_REACTIONS.map((emoji, chipIndex) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => sendReaction(emoji, chipIndex)}
            style={[styles.reactionChip, { backgroundColor: T.cardBg }]}
            activeOpacity={0.7}
          >
            <Animated.View
              style={
                animatingReactionIndex === chipIndex
                  ? { transform: [{ scale: reactionScale }] }
                  : undefined
              }
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>

      {/* REPLY */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.keyboardAvoid}
      >
        <View style={[styles.replyBox, { borderColor: T.border }]}>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder={t("chat.story.replyPlaceholder")}
            placeholderTextColor={T.mutedText}
            style={[styles.replyInput, { color: T.textColor }]}
          />
          <TouchableOpacity
            onPress={canSend ? sendReply : undefined}
            style={{ opacity: canSend ? 1 : 0.4 }}
            disabled={!canSend}
          >
            <Ionicons name="send" size={20} color={T.accent} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* VIEWER ENTRY (bottom, only for own story) */}
      {story.ownerId === "me" && (
        <TouchableOpacity
          onPress={() => navigation.navigate("StorySeen", { storyId: story.id })}
          style={[styles.viewerEntry, { backgroundColor: T.cardBg, borderColor: T.border }]}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-outline" size={18} color={T.textColor} />
          <Text style={[styles.viewerEntryCount, { color: T.textColor }]}>
            {getSeenCount(story.id)}
          </Text>
          {reactionCount > 0 && (
            <>
              <View style={[styles.viewerEntryDot, { backgroundColor: T.border }]} />
              <Text style={[styles.viewerEntryCount, { color: T.textColor }]}>
                {reactionCount}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
  },
  storyHeaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  storyHeaderAvatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  storyHeaderName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  content: { flex: 1, padding: 12 },
  media: { width: "100%", height: "100%", borderRadius: 14 },
  keyboardAvoid: {},
  replyBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  replyInput: { flex: 1, fontWeight: "600" },
  reactionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  reactionChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reactionEmoji: { fontSize: 20 },
  viewerEntry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  viewerEntryCount: {
    fontSize: 13,
    fontWeight: "700",
  },
  viewerEntryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});