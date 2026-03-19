// src/domains/chat/screens/GroupMediaScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES (UI-ONLY)                                                     */
/* ------------------------------------------------------------------ */

type RouteParams = { chatId: string };

type MediaItem =
  | { id: string; type: "image" | "video"; uri: string }
  | { id: string; type: "file"; name: string };

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI-ONLY, 🔒)                                             */
/* ------------------------------------------------------------------ */

const MOCK_ITEMS: MediaItem[] = [
  { id: "1", type: "image", uri: "https://via.placeholder.com/300" },
  { id: "2", type: "video", uri: "https://via.placeholder.com/300" },
  { id: "3", type: "file", name: "Sözleşme.pdf" },
  { id: "4", type: "file", name: "Teklif.docx" },
];

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function GroupMediaScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { chatId } = route.params as RouteParams;

  function openItem(item: MediaItem) {
    if (item.type === "image" || item.type === "video") {
      navigation.navigate("MediaPreview", {
        uri: item.uri,
        type: item.type,
      });
    } else {
      alert("Dosya açma (UI-only)");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.row,
              { backgroundColor: T.cardBg, borderColor: T.border },
            ]}
            onPress={() => openItem(item)}
          >
            <Ionicons
              name={
                item.type === "file"
                  ? "document"
                  : item.type === "video"
                  ? "videocam"
                  : "image"
              }
              size={20}
              color={T.textColor}
            />
            <Text style={{ color: T.textColor }}>
              {item.type === "file" ? item.name : item.type}
            </Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <Text style={[styles.title, { color: T.textColor }]}>
            Grup Medya & Dosyalar
          </Text>
        }
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
});