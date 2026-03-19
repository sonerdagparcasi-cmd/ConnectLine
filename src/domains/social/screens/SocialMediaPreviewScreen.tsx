// src/domains/social/screens/SocialMediaPreviewScreen.tsx
// 🔒 SOCIAL – MEDIA PREVIEW (STABLE FINAL)

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Video, ResizeMode } from "expo-av";
import { useEffect, useRef } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import type { SocialStackParamList } from "../navigation/SocialNavigator";
import type { SocialMediaItem } from "../types/social.types";

type RouteProps = RouteProp<SocialStackParamList, "SocialMediaPreview">;
type Nav = NativeStackNavigationProp<SocialStackParamList>;

const { width: W, height: H } = Dimensions.get("window");

export default function SocialMediaPreviewScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();

  const media: SocialMediaItem[] = route.params?.media ?? [];
  const initialIndex = route.params?.initialIndex ?? 0;

  const listRef = useRef<FlatList<SocialMediaItem>>(null);

  useEffect(() => {
    if (!listRef.current || !media.length) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: Math.min(initialIndex, media.length - 1),
        animated: false,
      });
    });
  }, [initialIndex, media.length]);

  function renderItem(item: SocialMediaItem) {
    const isImage = item.type === "image";

    return (
      <View style={styles.mediaContainer}>
        {isImage ? (
          <Image source={{ uri: item.uri }} style={styles.mediaImg} />
        ) : (
          <Video
            source={{ uri: item.uri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={false} // 🔒 autoplay yok
            isMuted
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title=""
        onBack={() => navigation.goBack()}
      />

      <FlatList
        ref={listRef}
        data={media}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => renderItem(item)}
        onScrollToIndexFailed={() => {}}
      />

      {!media.length && <View style={styles.empty} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  mediaContainer: {
    width: W,
    height: H,
    alignItems: "center",
    justifyContent: "center",
  },

  mediaImg: {
    width: W,
    height: H,
    resizeMode: "contain",
  },

  video: {
    width: W,
    height: H,
  },

  empty: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});