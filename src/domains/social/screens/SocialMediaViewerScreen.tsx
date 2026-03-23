import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RouteProp } from "@react-navigation/native";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import type { SocialMediaItem } from "../types/social.types";

const { width, height } = Dimensions.get("window");

type Props = {
  route: RouteProp<SocialStackParamList, "SocialMediaViewer">;
};

export default function SocialMediaViewerScreen({ route }: Props) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { media, startIndex = 0 } = route.params;
  const safeStartIndex = Math.max(0, Math.min(startIndex, Math.max(0, media.length - 1)));
  const [activeIndex, setActiveIndex] = useState(safeStartIndex);
  const [showUI, setShowUI] = useState(true);
  const [muted, setMuted] = useState(true);
  const listRef = useRef<FlatList<SocialMediaItem> | null>(null);

  useEffect(() => {
    if (!showUI) return;
    const t = setTimeout(() => {
      setShowUI(false);
    }, 2500);
    return () => clearTimeout(t);
  }, [showUI]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        ref={listRef}
        data={media}
        horizontal
        scrollEnabled={true}
        pagingEnabled
        initialScrollIndex={safeStartIndex}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <View style={styles.page}>
            <View style={styles.mediaWrap}>
              {item.type === "video" ? (
                <Video
                  source={{ uri: item.uri }}
                  style={styles.media}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={index === activeIndex}
                  isLooping
                  isMuted={muted}
                />
              ) : (
                <Reanimated.Image source={{ uri: item.uri }} style={styles.media} resizeMode="cover" />
              )}
            </View>
          </View>
        )}
      />
      <View style={styles.topGradientWrap}>
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0)"]}
          style={styles.topGradient}
        />
      </View>
      <View style={styles.indexIndicator}>
        <Text style={styles.indexText}>
          {activeIndex + 1} / {media.length}
        </Text>
      </View>
      {showUI && media[activeIndex]?.type === "video" ? (
        <TouchableOpacity
          onPress={() => setMuted((p) => !p)}
          style={[
            styles.soundButton,
            {
              bottom: insets.bottom + 12,
              paddingBottom: insets.bottom + 8,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name={muted ? "volume-mute" : "volume-high"} size={20} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  page: {
    width,
    height,
  },
  mediaWrap: {
    width,
    height,
  },
  media: {
    width,
    height,
  },
  indexIndicator: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    zIndex: 10,
    elevation: 10,
  },
  topGradientWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    elevation: 9,
  },
  topGradient: {
    width: "100%",
    height: 120,
  },
  indexText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  soundButton: {
    position: "absolute",
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderRadius: 16,
    alignItems: "center",
  },
});
