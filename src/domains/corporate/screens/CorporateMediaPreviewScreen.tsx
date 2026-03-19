// src/domains/corporate/screens/CorporateMediaPreviewScreen.tsx
// 🔒 E3 – MEDIA SWIPE (STABİL)

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video } from "expo-av";
import { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import type { CorporateStackParamList } from "../navigation/CorporateNavigator";
import type { CorporateMediaItem } from "../types/feed.types";

type RouteProps = RouteProp<CorporateStackParamList, "CorporateMediaPreview">;
type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

const SCREEN_W = Dimensions.get("window").width;

export default function CorporateMediaPreviewScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const { media, initialIndex = 0 } = route.params;

  const items = useMemo(() => {
    return [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [media]);

  function renderItem({ item }: { item: CorporateMediaItem }) {
    if (item.type === "image") {
      return (
        <View style={[styles.page, { width: SCREEN_W }]}>
          <Image source={{ uri: item.uri }} style={styles.media} resizeMode="contain" />
        </View>
      );
    }

    return (
      <View style={[styles.page, { width: SCREEN_W }]}>
        <Video
          source={{ uri: item.uri }}
          style={styles.media}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isMuted
          useNativeControls
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.close}
        activeOpacity={0.85}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={items}
        horizontal
        pagingEnabled
        initialScrollIndex={Math.max(0, Math.min(initialIndex, items.length - 1))}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  close: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 10,
  },
  page: { flex: 1, height: "100%" },
  media: { width: "100%", height: "100%" },
});