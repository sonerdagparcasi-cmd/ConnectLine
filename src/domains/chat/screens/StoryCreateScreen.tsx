import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";
import { chatMediaPicker, PickedMedia } from "../services/chatMediaPicker";
import { useChatProfile } from "../profile/useChatProfile";
import { useChatStories } from "../story/useChatStories";
import { addStory } from "../story/chatStoryStateService";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                           */
/* ------------------------------------------------------------------ */

const CAPTION_MAX = 120;

const EMOJIS = ["❤️", "🔥", "😂", "😍", "😮", "👏", "👌", "😢", "😡"];

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function StoryCreateScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const { createStory } = useChatStories();
  const { profile } = useChatProfile();

  const currentUserId = (profile as any)?.userId ?? "me";

  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [animatingEmojiIndex, setAnimatingEmojiIndex] = useState<number | null>(null);
  const emojiScale = useRef(new Animated.Value(1)).current;

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  async function pickFromCamera() {
    const picked = await chatMediaPicker.pickFromCamera();
    if (picked) setMedia(picked);
  }

  async function pickPhotoFromCamera() {
    const picked = await chatMediaPicker.pickImageFromCamera();
    if (picked) setMedia(picked);
  }

  async function pickVideoFromCamera() {
    const picked = await chatMediaPicker.pickVideoFromCamera();
    if (picked) setMedia(picked);
  }

  async function pickFromGallery() {
    const picked = await chatMediaPicker.pickFromGallery();
    if (picked) setMedia(picked);
  }

  async function shareStory() {
    if (!media || uploading) return;

    setUploading(true);

    try {
      // UI-only upload simülasyonu
      const uploaded = await chatMediaPicker.uploadMedia(media);
      setSelectedMedia(uploaded.url);

      createStory(
        {
          type: uploaded.mimeType?.startsWith("video")
            ? "video"
            : "image",
          uri: uploaded.url,
        },
        caption.trim() || undefined
      );

      addStory({
        id: Date.now().toString(),
        userId: currentUserId,
        username: (profile as any)?.username ?? profile?.displayName ?? "Me",
        userAvatarUri: (profile as any)?.avatarUri ?? null,
        mediaUri: selectedMedia ?? uploaded.url ?? "",
        createdAt: new Date().toISOString(),
        seenBy: [],
        likedBy: [],
      });

      navigation.goBack();
    } catch {
      // noop
    } finally {
      setUploading(false);
    }
  }

  function addEmoji(e: string, index: number) {
    if (caption.length >= CAPTION_MAX) return;
    setCaption((c) => (c + e).slice(0, CAPTION_MAX));
    setAnimatingEmojiIndex(index);
  }

  useEffect(() => {
    if (animatingEmojiIndex === null) return;
    emojiScale.setValue(1);
    Animated.sequence([
      Animated.timing(emojiScale, {
        toValue: 1.3,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(emojiScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => setAnimatingEmojiIndex(null));
  }, [animatingEmojiIndex]);

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: T.backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <AppGradientHeader title={t("chat.story.createTitle")} onBack={() => navigation.goBack()} />

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* PREVIEW */}
        {!media ? (
          <View
            style={[
              styles.emptyPreview,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={48}
              color={T.mutedText}
            />
            <Text style={{ color: T.mutedText, marginTop: 8 }}>
              {t("chat.story.selectMedia")}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.previewBox,
              { backgroundColor: T.cardBg },
            ]}
          >
            {media.kind === "video" ? (
              <Video
                source={{ uri: media.uri }}
                style={styles.preview}
                resizeMode={ResizeMode.COVER}
                useNativeControls
                shouldPlay
                isMuted
                isLooping
              />
            ) : (
              <Image
                source={{ uri: media.uri }}
                style={styles.preview}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={[styles.removeMediaBtn, { backgroundColor: T.cardBg }]}
              onPress={() => setMedia(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={T.textColor} />
            </TouchableOpacity>
          </View>
        )}

        {/* PICKERS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: T.border }]}
            onPress={pickFromCamera}
          >
            <Ionicons name="camera" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>{t("chat.story.camera")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: T.border }]}
            onPress={pickPhotoFromCamera}
          >
            <Ionicons name="image" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>{t("chat.story.photo")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: T.border }]}
            onPress={pickVideoFromCamera}
          >
            <Ionicons name="videocam" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>{t("chat.story.video")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: T.border }]}
            onPress={pickFromGallery}
          >
            <Ionicons name="images" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>{t("chat.story.gallery")}</Text>
          </TouchableOpacity>
        </View>

        {/* CAPTION */}
        <View>
          <TextInput
            value={caption}
            onChangeText={(v) =>
              setCaption(v.slice(0, CAPTION_MAX))
            }
            placeholder={t("chat.story.captionPlaceholder")}
            placeholderTextColor={T.mutedText}
            multiline
            returnKeyType="done"
            onSubmitEditing={shareStory}
            blurOnSubmit={false}
            style={[
              styles.caption,
              {
                color: T.textColor,
                backgroundColor: T.cardBg,
                borderColor: T.border,
              },
            ]}
          />

          <View style={styles.captionFooter}>
            <Text style={{ color: T.mutedText, fontSize: 12 }}>
              {caption.length}/{CAPTION_MAX}
            </Text>
          </View>
        </View>

        {/* EMOJI BAR */}
        <View style={styles.emojiBar}>
          {EMOJIS.map((e, index) => (
            <TouchableOpacity
              key={e}
              onPress={() => addEmoji(e, index)}
            >
              <Animated.View
                style={
                  animatingEmojiIndex === index
                    ? { transform: [{ scale: emojiScale }] }
                    : undefined
                }
              >
                <Text style={styles.emoji}>{e}</Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* SHARE */}
        <TouchableOpacity
          disabled={!media || uploading}
          activeOpacity={0.85}
          onPress={shareStory}
          style={[
            styles.shareBtn,
            {
              backgroundColor: media ? T.accent : T.border,
            },
          ]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.shareText, { color: media ? "#ffffff" : T.mutedText }]}>
              {t("chat.share")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  content: {
    padding: 16,
    gap: 14,
  },

  emptyPreview: {
    height: 260,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  previewBox: {
    height: 260,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },

  preview: {
    width: "100%",
    height: "100%",
  },

  removeMediaBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
  },

  caption: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
  },

  captionFooter: {
    alignItems: "flex-end",
    marginTop: 4,
  },

  emojiBar: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },

  emoji: {
    fontSize: 22,
  },

  shareBtn: {
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  shareText: {
    fontWeight: "800",
    fontSize: 15,
  },
});
