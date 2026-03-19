import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";

/* ------------------------------------------------------------------ */
/* TYPES (UI-ONLY, 🔒 KİLİTLİ)                                         */
/* ------------------------------------------------------------------ */

type RouteParams = {
  chatId: string;
  groupName?: string;
};

type MemberRole = "owner" | "admin" | "member";

type GroupMember = {
  id: string;
  name: string;
  role: MemberRole;
};

type GroupPermissions = {
  canSendMessage: "all" | "admin";
  canSendMedia: "all" | "admin";
  canEditGroupInfo: "owner" | "admin";
  canInviteMembers: "owner" | "admin";
};

type PinnedMessage = {
  id: string;
  text: string;
  createdAt: number;
};

/* ------------------------------------------------------------------ */
/* MOCK STATE (UI-ONLY, 🔒)                                            */
/* ------------------------------------------------------------------ */

const MOCK_CURRENT_USER_ID = "u1";

const INITIAL_MEMBERS: GroupMember[] = [
  { id: "u1", name: "Ahmet Yılmaz", role: "owner" },
  { id: "u2", name: "Ayşe Demir", role: "admin" },
  { id: "u3", name: "Mehmet Kaya", role: "member" },
];

const INITIAL_PERMISSIONS: GroupPermissions = {
  canSendMessage: "all",
  canSendMedia: "all",
  canEditGroupInfo: "admin",
  canInviteMembers: "admin",
};

/* ------------------------------------------------------------------ */
/* HELPERS (UI-ONLY, 🔒)                                              */
/* ------------------------------------------------------------------ */

function buildInviteLink(chatId: string) {
  return `connectline://chat/group/${chatId}/invite`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function GroupInfoScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { chatId, groupName } = route.params as RouteParams;
  const title = groupName ?? "Grup Sohbeti";

  const [members, setMembers] = useState<GroupMember[]>(INITIAL_MEMBERS);
  const [permissions] =
    useState<GroupPermissions>(INITIAL_PERMISSIONS);

  const [inviteLink, setInviteLink] = useState(() =>
    buildInviteLink(chatId)
  );

  const [pinned, setPinned] = useState<PinnedMessage | null>(null);

  const currentUser = useMemo(
    () => members.find((m) => m.id === MOCK_CURRENT_USER_ID),
    [members]
  );

  const isOwner = currentUser?.role === "owner";
  const isAdmin = currentUser?.role === "admin" || isOwner;

  /* ------------------------------------------------------------------ */
  /* ACTIONS (UI-ONLY, 🔒)                                              */
  /* ------------------------------------------------------------------ */

  function leaveGroup() {
    if (isOwner) {
      Alert.alert(
        "İzin yok",
        "Grup sahibi gruptan çıkamaz (UI-only kural)"
      );
      return;
    }
    Alert.alert("Bilgi", "Gruptan çıkıldı (UI-only)");
    navigation.goBack();
  }

  function copyInviteLink() {
    Alert.alert("Kopyalandı (UI-only)", inviteLink);
  }

  async function shareInviteLink() {
    await Share.share({ message: inviteLink });
  }

  function regenerateInviteLink() {
    Alert.alert(
      "Linki yenile",
      "Mevcut davet linki geçersiz olacak (UI-only).",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Yenile",
          style: "destructive",
          onPress: () => {
            setInviteLink(buildInviteLink(chatId));
            Alert.alert(
              "Bilgi",
              "Yeni davet linki oluşturuldu (UI-only)"
            );
          },
        },
      ]
    );
  }

  /* ---------------- C13 – PINNED ---------------- */

  function addOrEditPinned() {
    Alert.prompt(
      pinned ? "Duyuruyu Düzenle" : "Duyuru Sabitle",
      "Grup için sabitlenecek mesaj",
      [
        { text: "İptal", style: "cancel" },
        {
          text: pinned ? "Güncelle" : "Sabitle",
          onPress: (text?: string) => {
            if (!text || !text.trim()) return;
            setPinned({
              id: Date.now().toString(),
              text: text.trim(),
              createdAt: Date.now(),
            });
          },
        },
      ],
      "plain-text",
      pinned?.text
    );
  }

  function removePinned() {
    Alert.alert(
      "Duyuruyu Kaldır",
      "Sabit mesaj kaldırılsın mı?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Kaldır",
          style: "destructive",
          onPress: () => setPinned(null),
        },
      ]
    );
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.container, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader title="Grup Bilgisi" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <Ionicons name="people" size={36} color={T.textColor} />
        </View>

        <Text style={[styles.groupName, { color: T.textColor }]}>
          {title}
        </Text>
        <Text style={[styles.groupId, { color: T.mutedText }]}>
          {chatId}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: T.textColor }]}>
            {t("chat.group.participants")} ({members.length})
          </Text>
          {members.map((m) => (
            <View
              key={m.id}
              style={[
                styles.row,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <View style={[styles.memberAvatar, { backgroundColor: T.border }]}>
                <Ionicons name="person" size={20} color={T.mutedText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: T.textColor }]}>
                  {m.name}
                  {(m.role === "admin" || m.role === "owner") && (
                    <Text style={[styles.adminBadge, { color: T.accent }]}>
                      {" "}· {t("chat.group.admin")}
                    </Text>
                  )}
                </Text>
              </View>
              {isAdmin && m.role !== "owner" && (
                <TouchableOpacity onPress={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}>
                  <Ionicons name="person-remove-outline" size={20} color={T.mutedText} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isAdmin && (
            <TouchableOpacity
              onPress={() => Alert.alert("UI-only", t("chat.group.addParticipant"))}
              style={[
                styles.row,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <Ionicons name="person-add-outline" size={18} color={T.textColor} />
              <Text style={[styles.rowText, { color: T.textColor }]}>
                {t("chat.group.addParticipant")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: T.textColor }]}>
              Grup Duyurusu
            </Text>

            {pinned ? (
              <View
                style={[
                  styles.pinnedBox,
                  { backgroundColor: T.cardBg, borderColor: T.border },
                ]}
              >
                <Ionicons name="pin" size={16} color={T.accent} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: T.textColor, fontWeight: "700" }}
                  >
                    {pinned.text}
                  </Text>
                  <Text
                    style={{ color: T.mutedText, fontSize: 11 }}
                  >
                    {formatDate(pinned.createdAt)}
                  </Text>
                </View>

                <TouchableOpacity onPress={addOrEditPinned}>
                  <Ionicons name="create-outline" size={18} color={T.textColor} />
                </TouchableOpacity>

                <TouchableOpacity onPress={removePinned}>
                  <Ionicons name="trash-outline" size={18} color={C.danger} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={addOrEditPinned}
                style={[
                  styles.row,
                  { backgroundColor: T.cardBg, borderColor: T.border },
                ]}
              >
                <Ionicons name="pin-outline" size={18} color={T.textColor} />
                <Text style={[styles.rowText, { color: T.textColor }]}>
                  Duyuru Sabitle
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES (🔒 STABLE)                                                  */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },

  avatar: {
    alignSelf: "center",
    marginTop: 20,
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  groupName: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  groupId: { fontSize: 11, textAlign: "center", marginTop: 4 },

  section: { marginTop: 28, paddingHorizontal: 12, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800" },

  row: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  rowText: { fontSize: 14, fontWeight: "600" },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  adminBadge: { fontSize: 12, fontWeight: "600" },

  pinnedBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
});