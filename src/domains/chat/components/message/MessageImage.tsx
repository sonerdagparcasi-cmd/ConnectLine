// src/domains/chat/components/message/MessageImage.tsx

import { Ionicons } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";
import { t } from "../../../../shared/i18n/t";

type Props = {
  uri: string;
  onPress?: () => void;
  uploadStatus?: "idle" | "uploading" | "uploaded" | "failed";
  downloadStatus?: "idle" | "downloading" | "downloaded" | "failed";
  onRetry?: () => void;
};

function MessageImageInner({ uri, onPress, uploadStatus, downloadStatus, onRetry }: Props) {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const onOverlayIcon = C.buttonText;
  const overlayBg = T.isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.35)";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const failed = uploadStatus === "failed" || downloadStatus === "failed";
  const uploading = uploadStatus === "uploading" || downloadStatus === "downloading";

  if (error && !uri) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
      disabled={!onPress}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
      />
      {loading && !failed && (
        <View style={[styles.loadingWrap, { backgroundColor: overlayBg }]}>
          <ActivityIndicator size="small" color={onOverlayIcon} />
        </View>
      )}
      {uploading && (
        <View style={[styles.statusOverlay, { backgroundColor: overlayBg }]}>
          <ActivityIndicator size="small" color={onOverlayIcon} />
        </View>
      )}
      {failed && onRetry && (
        <TouchableOpacity style={[styles.retryOverlay, { backgroundColor: T.isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.45)" }]} onPress={onRetry} activeOpacity={0.9}>
          <Ionicons name="refresh" size={28} color={onOverlayIcon} />
          <Text style={[styles.retryText, { color: onOverlayIcon }]}>{t("chat.media.retry")}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    maxHeight: 280,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 240,
  },
  placeholder: {
    width: 240,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  retryOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  retryText: { fontSize: 12, fontWeight: "600" },
});

export default memo(MessageImageInner);
