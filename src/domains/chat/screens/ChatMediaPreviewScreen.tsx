// src/domains/chat/screens/ChatMediaPreviewScreen.tsx
// Preview image/video, caption, upload state (mock), send

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import { ChatStackParamList } from "../navigation/ChatNavigator";

type Params = {
  uri: string;
  type: "image" | "video";
  chatId: string;
  peerName?: string;
  replyTo?: { messageId: string; preview: string; mine: boolean };
};

type NavProp = NativeStackNavigationProp<ChatStackParamList, "ChatMediaPreview">;

export default function ChatMediaPreviewScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const overlayBg = T.isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.45)";
  const progressTrackBg = T.isDark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.35)";
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { uri, type, chatId, peerName, replyTo } = (route.params ?? {}) as Params;
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<Video>(null);

  const handleSend = () => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 1) {
          clearInterval(interval);
          setUploading(false);
          navigation.navigate("ChatRoom", {
            chatId,
            peerName,
            pendingMedia: { uri, type, caption: caption.trim() || undefined, replyTo },
          });
          return 1;
        }
        return p + 0.2;
      });
    }, 150);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (!uri || !type || !chatId) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: T.backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppGradientHeader
        title={t("chat.mediaPreview.title")}
        onBack={handleClose}
      />

      <View style={styles.mediaWrap}>
        {type === "image" ? (
          <Image source={{ uri }} style={styles.media} resizeMode="contain" />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={false}
            isMuted
          />
        )}
        {uploading && (
          <View style={[styles.uploadOverlay, { backgroundColor: overlayBg }]}>
            <ActivityIndicator size="large" color={C.buttonText} />
            <Text style={[styles.uploadText, { color: C.buttonText }]}>{t("chat.mediaPreview.uploading")}</Text>
            <View style={[styles.progressBg, { backgroundColor: progressTrackBg }]}>
              <View style={[styles.progressBar, { width: `${uploadProgress * 100}%`, backgroundColor: T.accent }]} />
            </View>
          </View>
        )}
      </View>

      <View style={[styles.footer, { backgroundColor: T.cardBg, borderColor: T.border }]}>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder={t("chat.mediaPreview.caption")}
          placeholderTextColor={T.mutedText}
          style={[styles.captionField, { color: T.textColor }]}
          multiline
          maxLength={500}
          editable={!uploading}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={uploading}
          style={[styles.sendButton, { backgroundColor: uploading ? T.mutedText : T.accent }]}
        >
          <Ionicons name="send" size={20} color={C.buttonText} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
  mediaWrap: {
    flex: 1,
    justifyContent: "center",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadText: { fontWeight: "600" },
  progressBg: {
    width: "70%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  captionField: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    fontSize: 15,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
