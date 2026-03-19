// src/domains/chat/components/message/MessageVideo.tsx

import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import React, { memo, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import { getColors } from "../../../../shared/theme/colors";

type Props = {
  uri: string;
  onPress?: () => void;
};

function MessageVideoInner({ uri, onPress }: Props) {
  const videoRef = useRef<Video>(null);
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const overlayBg = T.isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.35)";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
      disabled={!onPress}
    >
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        useNativeControls={false}
        shouldPlay={false}
        isMuted
      />
      <View style={[styles.playOverlay, { backgroundColor: overlayBg }]}>
        <Ionicons name="play-circle" size={48} color={C.buttonText} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(MessageVideoInner);
