import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { RouteProp } from "@react-navigation/native";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import type { SocialMediaItem } from "../types/social.types";

const { width, height } = Dimensions.get("window");

type Props = {
  route: RouteProp<SocialStackParamList, "SocialMediaViewer">;
};

export default function SocialMediaViewerScreen({ route }: Props) {
  const navigation = useNavigation<any>();
  const { media, startIndex = 0 } = route.params;
  const safeStartIndex = Math.max(0, Math.min(startIndex, Math.max(0, media.length - 1)));
  const [activeIndex, setActiveIndex] = useState(safeStartIndex);
  const [showUI, setShowUI] = useState(true);
  const [muted, setMuted] = useState(true);
  const listRef = useRef<FlatList<SocialMediaItem> | null>(null);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!showUI) return;
    const t = setTimeout(() => {
      setShowUI(false);
    }, 2500);
    return () => clearTimeout(t);
  }, [showUI]);

  function toggleUI() {
    setShowUI((p) => !p);
  }

  function closeViewer() {
    navigation.goBack();
  }

  const pinch = Gesture.Pinch()
    .enabled(media[activeIndex]?.type === "image")
    .onUpdate((e) => {
      scale.value = Math.max(1, e.scale);
    })
    .onEnd(() => {
      scale.value = withTiming(1);
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 150) {
        runOnJS(closeViewer)();
      } else {
        translateY.value = withTiming(0);
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={media}
        horizontal
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
            <GestureDetector gesture={composed}>
              <Reanimated.View style={[styles.mediaWrap, animStyle]}>
                <TouchableWithoutFeedback onPress={toggleUI}>
                  <View style={styles.touchLayer}>
                    {item.type === "video" ? (
                      <Video
                        source={{ uri: item.uri }}
                        style={styles.media}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={index === activeIndex}
                        isLooping
                        isMuted={muted}
                      />
                    ) : (
                      <Reanimated.Image source={{ uri: item.uri }} style={styles.media} resizeMode="contain" />
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </Reanimated.View>
            </GestureDetector>
          </View>
        )}
      />
      {showUI ? (
        <View style={styles.indexIndicator}>
          <Text style={styles.indexText}>
            {activeIndex + 1} / {media.length}
          </Text>
        </View>
      ) : null}
      {showUI && media[activeIndex]?.type === "video" ? (
        <TouchableOpacity
          onPress={() => setMuted((p) => !p)}
          style={styles.soundButton}
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
    flex: 1,
  },
  touchLayer: {
    flex: 1,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  indexIndicator: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  indexText: {
    color: "#fff",
  },
  soundButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
});
