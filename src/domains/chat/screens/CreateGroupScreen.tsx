import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  FlatList,
  Image,
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
import { chatMediaPicker, PickedMedia } from "../services/chatMediaPicker";
import { Contact } from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                           */
/* ------------------------------------------------------------------ */

const BOTTOM_BAR_HEIGHT = 56;

/* ------------------------------------------------------------------ */
/* MOCK CONTACTS (UI-ONLY)                                             */
/* ------------------------------------------------------------------ */

const MOCK_CONTACTS: Contact[] = [
  { id: "c1", displayName: "Ahmet Yılmaz", phoneNumber: "+90 555 111 22 33" },
  { id: "c2", displayName: "Ayşe Demir", phoneNumber: "+90 555 444 55 66" },
  { id: "c3", displayName: "Mehmet Kaya", phoneNumber: "+90 555 777 88 99" },
];

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function CreateGroupScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();

  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectedCount() {
    return Object.values(selected).filter(Boolean).length;
  }

  async function pickGroupAvatar() {
    const media: PickedMedia | null =
      await chatMediaPicker.pickFromGallery();

    if (media && media.kind === "image") {
      setGroupAvatar(media.uri);
    }
  }

  function createGroup() {
    if (!groupName.trim() || selectedCount() < 1) return;

    /**
     * 🔒 UI-ONLY
     * group_ prefix → ChatRoomScreen otomatik grup algılar
     */
    const fakeGroupId = `group_${Date.now()}`;

    navigation.replace("ChatRoom", {
      chatId: fakeGroupId,
    });
  }

  function renderContact(item: Contact) {
    const isSelected = !!selected[item.id];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => toggle(item.id)}
        style={[
          styles.row,
          {
            backgroundColor: T.cardBg,
            borderColor: isSelected ? T.accent : T.border,
          },
        ]}
      >
        <View style={styles.left}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: T.border },
            ]}
          >
            <Text style={{ color: T.textColor, fontWeight: "600" }}>
              {item.displayName.charAt(0)}
            </Text>
          </View>

          <Text style={{ color: T.textColor, fontWeight: "600" }}>
            {item.displayName}
          </Text>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={T.accent} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader title="Yeni Grup" onBack={() => navigation.goBack()} />

      {/* AVATAR */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={pickGroupAvatar}
        style={[
          styles.groupAvatar,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        {groupAvatar ? (
          <Image
            source={{ uri: groupAvatar }}
            style={styles.groupAvatarImage}
          />
        ) : (
          <>
            <Ionicons name="camera" size={22} color={T.mutedText} />
            <Text style={{ color: T.mutedText, fontSize: 12 }}>
              Grup Fotoğrafı
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* GROUP NAME */}
      <TextInput
        value={groupName}
        onChangeText={setGroupName}
        placeholder="Grup adı"
        placeholderTextColor={T.mutedText}
        style={[
          styles.input,
          { color: T.textColor, borderColor: T.border },
        ]}
      />

      {/* CONTACT LIST */}
      <FlatList
        data={MOCK_CONTACTS}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => renderContact(item)}
        contentContainerStyle={{
          padding: 12,
          gap: 10,
          paddingBottom: BOTTOM_BAR_HEIGHT + 96, // 👈 CTA için boşluk
        }}
      />

      {/* STICKY FOOTER */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: T.border,
            backgroundColor: T.backgroundColor,
            paddingBottom:
              BOTTOM_BAR_HEIGHT + (Platform.OS === "ios" ? 12 : 8),
          },
        ]}
      >
        <TouchableOpacity
          disabled={!groupName.trim() || selectedCount() < 1}
          onPress={createGroup}
          style={[
            styles.createBtn,
            {
              backgroundColor:
                groupName.trim() && selectedCount() > 0
                  ? T.accent
                  : T.border,
            },
          ]}
        >
          <Text style={[styles.createText, { color: C.buttonText }]}>
            Grup Oluştur ({selectedCount()})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },

  title: { fontSize: 16, fontWeight: "700" },

  groupAvatar: {
    alignSelf: "center",
    marginVertical: 12,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  groupAvatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  input: {
    marginHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  row: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: { flexDirection: "row", alignItems: "center", gap: 10 },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },

  createBtn: {
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },

  createText: {
    fontWeight: "700",
    fontSize: 15,
  },
});