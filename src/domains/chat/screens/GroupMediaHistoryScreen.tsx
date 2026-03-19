import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import type { ChatStackParamList } from "../navigation/ChatNavigator";

/* ------------------------------------------------------------------ */
/* ROUTE                                                              */
/* ------------------------------------------------------------------ */

type Route = RouteProp<ChatStackParamList, "GroupMediaHistory">;

/* ------------------------------------------------------------------ */
/* TYPES (UI-ONLY)                                                     */
/* ------------------------------------------------------------------ */

type MediaKind = "image" | "video" | "audio" | "file";

type MediaItem = {
  id: string;
  kind: MediaKind;
  uri: string;
  createdAt: number;
};

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                           */
/* ------------------------------------------------------------------ */

const FILTERS: Array<{ key: "all" | MediaKind; label: string; icon: any }> = [
  { key: "all", label: "Tümü", icon: "grid" },
  { key: "image", label: "Görseller", icon: "image" },
  { key: "video", label: "Videolar", icon: "videocam" },
  { key: "audio", label: "Sesler", icon: "mic" },
  { key: "file", label: "Dosyalar", icon: "document" },
];

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI-ONLY)                                                 */
/* ------------------------------------------------------------------ */

function useMockMedia(chatId: string): MediaItem[] {
  return [
    {
      id: "m1",
      kind: "image",
      uri: "https://placekitten.com/400/400",
      createdAt: Date.now() - 100000,
    },
    {
      id: "m2",
      kind: "video",
      uri: "https://example.com/video.mp4",
      createdAt: Date.now() - 200000,
    },
    {
      id: "m3",
      kind: "audio",
      uri: "file://voice.aac",
      createdAt: Date.now() - 300000,
    },
    {
      id: "m4",
      kind: "file",
      uri: "file://doc.pdf",
      createdAt: Date.now() - 400000,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function GroupMediaHistoryScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();

  const { chatId } = route.params;
  const [filter, setFilter] = useState<
    "all" | "image" | "video" | "audio" | "file"
  >("all");

  const allMedia = useMockMedia(chatId);

  const data = useMemo(() => {
    if (filter === "all") return allMedia;
    return allMedia.filter((m) => m.kind === filter);
  }, [allMedia, filter]);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  function openMedia(item: MediaItem) {
    if (item.kind === "image" || item.kind === "video") {
      navigation.navigate("MediaPreview", {
        uri: item.uri,
        type: item.kind,
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      {/* FILTER BAR */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: active ? T.cardBg : "transparent",
                  borderColor: active ? T.textColor : T.border,
                },
              ]}
            >
              <Ionicons
                name={f.icon}
                size={14}
                color={active ? T.textColor : T.mutedText}
              />
              <Text
                style={{
                  color: active ? T.textColor : T.mutedText,
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* GRID */}
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <Text style={{ color: T.mutedText, fontWeight: "700" }}>
            Medya bulunamadı.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openMedia(item)}
            style={[
              styles.item,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
          >
            <Ionicons
              name={
                item.kind === "image"
                  ? "image"
                  : item.kind === "video"
                  ? "videocam"
                  : item.kind === "audio"
                  ? "mic"
                  : "document"
              }
              size={22}
              color={T.textColor}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 32,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  item: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});