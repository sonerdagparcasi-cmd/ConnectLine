import { useAppTheme } from "@/core/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video } from "expo-av";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSocialProfile } from "../../hooks/useSocialProfile";
import type { SocialStackParamList } from "../../navigation/SocialNavigator";
import { socialStoryStateService } from "../../services/socialStoryStateService";
import type { SocialStory } from "../../types/social.types";
import { t } from "../../../../shared/i18n/t";

const TEXT_COLORS = [
  "#FFFFFF",
  "#FFD60A",
  "#FF453A",
  "#32D74B",
  "#0A84FF",
  "#BF5AF2",
  "#FF9F0A",
];

type Nav = NativeStackNavigationProp<SocialStackParamList>;
type EditorRoute = RouteProp<SocialStackParamList, "SocialStoryEditor">;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function SocialStoryEditorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<EditorRoute>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { profile } = useSocialProfile();
  const inputRef = useRef<TextInput>(null);

  const media = route.params?.media;

  const [draftText, setDraftText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [overlay, setOverlay] = useState({
    text: "",
    x: SCREEN_W * 0.12,
    y: SCREEN_H * 0.38,
    scale: 1,
  });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleSV = useSharedValue(overlay.scale);
  const savedScale = useSharedValue(overlay.scale);
  const pinchStart = useSharedValue(1);
  const panOriginX = useSharedValue(0);
  const panOriginY = useSharedValue(0);

  useEffect(() => {
    scaleSV.value = overlay.scale;
    savedScale.value = overlay.scale;
  }, [overlay.scale]);

  useEffect(() => {
    if (!media?.uri) {
      navigation.goBack();
    }
  }, [media?.uri, navigation]);

  const syncDraftToOverlay = useCallback((t: string) => {
    setDraftText(t);
    setOverlay((o) => ({ ...o, text: t }));
  }, []);

  const commitPan = useCallback((tx: number, ty: number) => {
    setOverlay((o) => ({ ...o, x: o.x + tx, y: o.y + ty }));
  }, []);

  const commitPinch = useCallback((s: number) => {
    const clamped = Math.min(4.5, Math.max(0.35, s));
    setOverlay((o) => ({ ...o, scale: clamped }));
  }, []);

  const overlayGesture = useMemo(() => {
    const pan = Gesture.Pan()
      .onStart(() => {
        panOriginX.value = translateX.value;
        panOriginY.value = translateY.value;
      })
      .onUpdate((e) => {
        translateX.value = panOriginX.value + e.translationX;
        translateY.value = panOriginY.value + e.translationY;
      })
      .onEnd(() => {
        const tx = translateX.value;
        const ty = translateY.value;
        translateX.value = 0;
        translateY.value = 0;
        runOnJS(commitPan)(tx, ty);
      });

    const pinch = Gesture.Pinch()
      .onStart(() => {
        pinchStart.value = savedScale.value;
      })
      .onUpdate((e) => {
        const next = pinchStart.value * e.scale;
        scaleSV.value = next < 0.35 ? 0.35 : next > 4.5 ? 4.5 : next;
      })
      .onEnd(() => {
        savedScale.value = scaleSV.value;
        runOnJS(commitPinch)(scaleSV.value);
      });

    return Gesture.Simultaneous(pan, pinch);
  }, [commitPan, commitPinch]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scaleSV.value },
    ],
  }));

  const bumpScale = (delta: number) => {
    setOverlay((o) => {
      const ns = Math.max(0.35, Math.min(4.5, o.scale + delta));
      scaleSV.value = ns;
      savedScale.value = ns;
      return { ...o, scale: ns };
    });
  };

  const openKeyboard = () => {
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handlePublish = () => {
    if (!media?.uri) return;
    const uid = profile?.userId ?? "u1";
    const uname = profile?.username ?? "Sen";
    const story: SocialStory = {
      id: `story_${Date.now()}`,
      userId: uid,
      username: uname,
      userAvatarUri: profile?.avatarUri ?? null,
      media: {
        id: `m_${Date.now()}`,
        type: media.type === "video" ? "video" : "image",
        uri: media.uri,
      },
      visibility: "public",
      createdAt: new Date().toISOString(),
      overlays: {
        text: (draftText || overlay.text).trim(),
        x: overlay.x,
        y: overlay.y,
        scale: overlay.scale,
        color: textColor,
      },
    };
    socialStoryStateService.createStory(story);
    Alert.alert(t("story_published"));
    Keyboard.dismiss();
    if (navigation.canGoBack()) navigation.goBack();
    if (navigation.canGoBack()) navigation.goBack();
  };

  const chromeBg = isDark ? "rgba(28,28,30,0.92)" : "rgba(248,248,250,0.94)";
  const chromeBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  if (!media?.uri) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

  const displayText = draftText || overlay.text;
  const isVideo = media.type === "video";

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={60}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
          {/* Medya — tam ekran */}
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              openKeyboard();
            }}
          >
            {isVideo ? (
              <Video
                source={{ uri: media.uri }}
                style={{
                  width: SCREEN_W,
                  height: SCREEN_H,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted={false}
              />
            ) : (
              <Image
                source={{ uri: media.uri }}
                style={{
                  width: SCREEN_W,
                  height: SCREEN_H,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                resizeMode="cover"
              />
            )}
          </Pressable>

          {/* Metin overlay — Reanimated + eşzamanlı pan + pinch (2 parmak) */}
          <View
            style={StyleSheet.absoluteFillObject}
            pointerEvents="box-none"
          >
            <View
              style={{
                position: "absolute",
                left: overlay.x,
                top: overlay.y,
                maxWidth: SCREEN_W * 0.92,
              }}
              collapsable={false}
            >
              <GestureDetector gesture={overlayGesture}>
                <Animated.View style={overlayAnimatedStyle}>
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 24,
                      fontWeight: "800",
                      lineHeight: 30,
                      textShadowColor: "rgba(0,0,0,0.6)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 6,
                    }}
                  >
                    {displayText.length > 0 ? displayText : " "}
                  </Text>
                </Animated.View>
              </GestureDetector>
            </View>
          </View>

          {/* Header */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              paddingTop: insets.top + 6,
              paddingBottom: 10,
              paddingHorizontal: 12,
              backgroundColor: chromeBg,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: chromeBorder,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={12}
                style={{ padding: 6 }}
              >
                <Ionicons name="chevron-back" size={26} color={colors.text} />
              </TouchableOpacity>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <TouchableOpacity
                  onPress={() => bumpScale(-0.12)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "800" }}>A−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => bumpScale(0.12)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: "800" }}>A+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handlePublish} hitSlop={12}>
                <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 16 }}>
                  {t("share")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Renk paleti */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 12,
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {TEXT_COLORS.map((c) => {
                const selected = textColor === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setTextColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: c,
                      borderWidth: selected ? 3 : 1,
                      borderColor: selected ? colors.primary : "rgba(255,255,255,0.35)",
                    }}
                  />
                );
              })}
            </View>
          </View>
          </View>
          </TouchableWithoutFeedback>

          {/* Floating input — TWD dışında: focus + KAV ile klavye üstü */}
          {isEditing && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: insets.bottom + 20,
                paddingHorizontal: 16,
              }}
              pointerEvents="box-none"
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 8,
                  backgroundColor: isDark ? "rgba(40,40,42,0.95)" : "rgba(255,255,255,0.96)",
                  borderRadius: 14,
                  padding: 10,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: chromeBorder,
                }}
              >
                <TextInput
                  ref={inputRef}
                  value={draftText}
                  onChangeText={syncDraftToOverlay}
                  placeholder="Yazı…"
                  placeholderTextColor={colors.muted}
                  multiline
                  style={{
                    flex: 1,
                    maxHeight: 100,
                    color: colors.text,
                    fontSize: 16,
                    paddingVertical: 8,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsEditing(false);
                  }}
                  style={{ padding: 8 }}
                >
                  <Text style={{ color: colors.primary, fontWeight: "700" }}>Bitti</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
