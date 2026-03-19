import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { useChatList } from "../hooks/useChatList";
import { ChatStackParamList } from "../navigation/ChatNavigator";
import { useChatProfile } from "../profile/useChatProfile";

type NavProp = NativeStackNavigationProp<ChatStackParamList, "ChatHome">;

export default function ChatListScreen() {
  const navigation = useNavigation<NavProp>();
  const T = useAppTheme();
  const C = getColors(T.isDark);

  const { chats } = useChatList();
  const { profile } = useChatProfile();
  const avatarUri = profile?.avatarUri || "https://i.pravatar.cc/200?img=12";

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredChats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(
      (chat) =>
        (chat.title ?? "").toLowerCase().includes(q) ||
        (chat.lastMessage?.content ?? "").toLowerCase().includes(q)
    );
  }, [chats, query]);

  const gradientColors = useMemo<[string, string]>(() => {
    return T.isDark ? [...T.darkGradient.colors] : [...T.lightGradient.colors];
  }, [T.isDark, T.darkGradient.colors, T.lightGradient.colors]);

  function isGroup(chatId: string) {
    return chatId.startsWith("group_");
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.85}>
            <Image source={{ uri: avatarUri }} style={styles.userAvatar} />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setMenuOpen((p) => !p)}
          >
            <Ionicons name="add" size={26} color={T.textColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.belowHeaderRow}>
          <Text style={[styles.belowHeaderLeft, { color: T.textColor }]}>
            📌 Sabitlenenler
          </Text>
          <Text style={[styles.belowHeaderRight, { color: T.textColor }]}>
            Sohbetler
          </Text>
        </View>
      </LinearGradient>

      <View style={[styles.searchWrap, { backgroundColor: T.cardBg, borderColor: T.border }]}>
        <Ionicons name="search" size={20} color={T.mutedText} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Sohbet ara"
          placeholderTextColor={T.mutedText}
          style={[styles.searchInput, { color: T.textColor }]}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: 16,
        }}
        renderItem={({ item }) => {
          const group = isGroup(item.id);

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("ChatRoom", { chatId: item.id })
              }
              style={[
                styles.row,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <View style={styles.left}>
                <View
                  style={[
                    styles.chatAvatar,
                    { borderColor: T.border, backgroundColor: T.cardBg },
                  ]}
                >
                  <Ionicons
                    name={group ? "people" : "person"}
                    size={18}
                    color={T.textColor}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.chatTitle, { color: T.textColor }]}>
                    {item.title ?? (group ? "Grup Sohbeti" : "Sohbet")}
                  </Text>

                  <Text
                    style={[styles.preview, { color: T.mutedText }]}
                    numberOfLines={1}
                  >
                    {item.lastMessage?.content ?? "Henüz mesaj yok"}
                  </Text>
                </View>
              </View>

              {item.unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: T.accent }]}>
                  <Text style={[styles.badgeText, { color: C.buttonText }]}>
                    {item.unreadCount > 99 ? "99+" : item.unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {menuOpen && (
        <View style={[styles.menu, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate("ChatContacts", { mode: "single" });
            }}
          >
            <Ionicons name="person" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>Birebir Sohbet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate("CreateGroup");
            }}
          >
            <Ionicons name="people" size={18} color={T.textColor} />
            <Text style={{ color: T.textColor }}>Grup Sohbeti</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  gradient: {
    paddingTop: 32,
    paddingBottom: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },

  addButton: {
    padding: 6,
  },

  belowHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },

  belowHeaderLeft: {
    fontSize: 16,
    fontWeight: "600",
  },

  belowHeaderRight: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
  },

  searchInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
    fontSize: 15,
  },

  searchIcon: {
    marginRight: 8,
  },

  row: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  chatTitle: { fontSize: 14, fontWeight: "800" },

  preview: { fontSize: 12, fontWeight: "600" },

  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: { fontSize: 12, fontWeight: "900" },

  menu: {
    position: "absolute",
    right: 16,
    top: 110,
    borderRadius: 12,
    borderWidth: 1,
    width: 190,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
});
