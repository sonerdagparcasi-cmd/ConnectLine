// src/domains/social/screens/SocialEventDetailScreen.tsx
// 🔒 SOCIAL – EVENT DETAIL (FINAL)
// UPDATE:
// - Participant avatars
// - Friends attending indicator
// - Event Mini Chat Room

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import SocialScreenLayout from "../components/SocialScreenLayout";
import { useSocialProfile } from "../hooks/useSocialProfile";
import type { SocialStackParamList } from "../navigation/SocialNavigator";

import {
  addAdmin,
  approveParticipant,
  banParticipant,
  canManageEvent,
  canSendEventMessage,
  canViewParticipants,
  generateEventLink,
  kickParticipant,
  getEventActivities,
  getEventNotifications,
  markEventNotificationsRead,
  muteParticipant,
  rejectParticipant,
  sendEventInvite,
  socialEventService,
  SocialEvent,
  SocialEventParticipant,
} from "../services/socialEventService";
import { createStory } from "../services/socialStoryService";

import { getFriendsAttending, getFollowingUsers } from "../services/socialFollowService";

import {
  SocialEventChatMessage,
  socialEventChatService,
} from "../services/socialEventChatService";

/* ------------------------------------------------------------------ */

type Route = RouteProp<SocialStackParamList, "SocialEventDetail">;

/* ------------------------------------------------------------------ */

export default function SocialEventDetailScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { profile } = useSocialProfile();
  const currentUserId = profile.userId;
  const eventId = route.params.eventId;
  const [event, setEvent] = useState<SocialEvent | null>(null);
  const [participants, setParticipants] = useState<SocialEventParticipant[]>([]);
  const [friendsAttending, setFriendsAttending] = useState<SocialEventParticipant[]>([]);

  const [messages, setMessages] = useState<SocialEventChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");

  /* ------------------------------------------------------------------ */
  /* LOAD EVENT                                                         */
  /* ------------------------------------------------------------------ */

  async function loadEvent() {
    const e = await socialEventService.getEventById(route.params.eventId);

    if (!e) return;

    setEvent(e);

    const list = await socialEventService.getParticipants(e.id);
    setParticipants(list);

    const friends = getFriendsAttending(list);
    setFriendsAttending(friends);
  }

  /* ------------------------------------------------------------------ */
  /* LOAD CHAT                                                          */
  /* ------------------------------------------------------------------ */

  async function loadMessages() {
    const msgs = await socialEventChatService.getMessages(route.params.eventId);
    setMessages(msgs);
  }

  useEffect(() => {
    loadEvent();
    loadMessages();

    const unsub = socialEventChatService.subscribe(
      route.params.eventId,
      loadMessages
    );

    return () => {
      unsub();
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  const refreshEvent = useCallback(() => {
    loadEvent();
  }, [eventId]);

  const role = (event as any)?.role ?? null;
  console.log("USER:", currentUserId);
  console.log("CREATED:", (event as any)?.hostId);
  console.log("ROLE:", role);
  const canMessage = event?.isJoined || event?.hostId === currentUserId;
  const canSeeParticipants = canViewParticipants(eventId, currentUserId);
  const canManage = canManageEvent(eventId, currentUserId);

  const toggleJoin = useCallback(async () => {
    if (!event) return;

    if (event.isJoined) {
      await socialEventService.leaveEvent(event.id);
    } else {
      await socialEventService.joinEvent(event.id);
    }

    await loadEvent();
  }, [event]);

  const handleApprove = (userId: string) => {
    approveParticipant(eventId, currentUserId, userId);
    refreshEvent();
  };

  const handleReject = (userId: string) => {
    rejectParticipant(eventId, currentUserId, userId);
    refreshEvent();
  };

  /* ------------------------------------------------------------------ */
  /* CHAT SEND                                                          */
  /* ------------------------------------------------------------------ */

  async function sendMessage() {
    if (!messageText.trim()) return;

    await socialEventChatService.sendMessage(
      route.params.eventId,
      messageText
    );

    setMessageText("");
  }

  /* ------------------------------------------------------------------ */
  /* OWNER ACTIONS                                                      */
  /* ------------------------------------------------------------------ */

  const isOwner = event ? socialEventService.isOwner(event) : false;

  const handleMakeAdmin = (userId: string) => {
    const res = addAdmin(eventId, userId, currentUserId);

    if (!res.success) {
      Alert.alert("Hata", res.error);
    }
  };

  const handleKick = (userId: string) => {
    kickParticipant(eventId, currentUserId, userId);
    refreshEvent();
  };

  const handleBan = (userId: string) => {
    banParticipant(eventId, currentUserId, userId);
    refreshEvent();
  };

  const handleMute = (userId: string) => {
    muteParticipant(eventId, currentUserId, userId);
    refreshEvent();
  };

  const handleShare = () => {
    const link = generateEventLink(eventId);
    Alert.alert("Etkinlik Bağlantısı", link);
  };

  const ActionButton = ({
    label,
    onPress,
    variant = "primary",
    disabled = false,
  }: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    disabled?: boolean;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.actionButton,
          variant === "primary" && styles.actionButtonPrimary,
          variant === "secondary" && styles.actionButtonSecondary,
          variant === "ghost" && styles.actionButtonGhost,
          variant === "danger" && styles.actionButtonDanger,
          disabled && styles.actionButtonDisabled,
        ]}
      >
        <Text
          style={[
            styles.actionButtonText,
            variant === "ghost" && styles.actionButtonGhostText,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  function openOwnerMenu() {
    if (!event) return;

    Alert.alert("Etkinlik", "İşlem seçin", [
      {
        text: "Düzenle",
        onPress: () =>
          navigation.navigate("SocialCreateEvent", {
            editingEventId: event.id,
          }),
      },
      {
        text: "Etkinliği Sil",
        style: "destructive",
        onPress: confirmDelete,
      },
      { text: "İptal", style: "cancel" },
    ]);
  }

  async function confirmDelete() {
    if (!event) return;

    Alert.alert("Sil", "Etkinliği silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          Alert.alert("Bilgi", "Silme akışı yeni event servisine taşınacak.");
        },
      },
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* NULL GUARD                                                         */
  /* ------------------------------------------------------------------ */

  if (!event) {
    return (
      <SocialScreenLayout title="Etkinlik">
        <View style={styles.center}>
          <Text style={{ color: T.mutedText, fontWeight: "800" }}>
            Etkinlik bulunamadı
          </Text>
        </View>
      </SocialScreenLayout>
    );
  }

  const safeParticipants = Array.isArray(event?.participants)
    ? event.participants
    : [];

  const pendingUsers = safeParticipants.filter(
    (p) => p.role === "PENDING"
  );

  const members = safeParticipants.filter(
    (p) =>
      p.role === "OWNER" ||
      p.role === "ADMIN" ||
      p.role === "MEMBER"
  );
  const admins = safeParticipants.filter(
    (p) => p.role === "OWNER" || p.role === "ADMIN"
  );
  const friends = getFollowingUsers(currentUserId);

  const RoleBadge = ({ value }: { value: string }) => {
    if (value === "OWNER") {
      return <Text style={styles.ownerBadge}>KURUCU</Text>;
    }

    if (value === "ADMIN") {
      return <Text style={styles.adminBadge}>YETKİLİ</Text>;
    }

    if (value === "MEMBER") {
      return <Text style={styles.memberBadge}>KATILIMCI</Text>;
    }

    return null;
  };

  const MessageInput = () => (
    <View style={styles.chatInputRow}>
      <TextInput
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Mesaj yaz..."
        placeholderTextColor={T.mutedText}
        style={[
          styles.chatInput,
          {
            borderColor: T.border,
            color: T.textColor,
            backgroundColor: T.cardBg,
          },
        ]}
      />

      <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: T.accent }]}>
        <Ionicons name="send" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  /* ------------------------------------------------------------------ */

  return (
    <SocialScreenLayout
      title="Etkinlik"
      right={
        isOwner ? (
          <TouchableOpacity onPress={openOwnerMenu}>
            <Ionicons name="ellipsis-horizontal" size={22} color={T.textColor} />
          </TouchableOpacity>
        ) : null
      }
    >
      <Text style={[styles.title, { color: T.textColor }]}>
        {event.title}
      </Text>

      <Text style={{ color: T.mutedText }}>
        {event.date} · {event.location}
      </Text>

      {!!event.description && (
        <Text style={[styles.desc, { color: T.textColor }]}>
          {event.description}
        </Text>
      )}

      {/* FRIENDS ATTENDING */}

      {friendsAttending.length > 0 && (
        <Text style={{ marginTop: 10, color: T.textColor, fontWeight: "700" }}>
          👥 {friendsAttending[0].username}
          {friendsAttending.length > 1
            ? ` ve ${friendsAttending.length - 1} arkadaşın katılıyor`
            : " katılıyor"}
        </Text>
      )}

      <Text style={{ marginTop: 16, color: T.mutedText }}>
        👥 {participants.length} katılımcı
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleJoin}
          style={[
            styles.primaryActionBtn,
            {
              backgroundColor: event.isJoined ? "rgba(239,68,68,0.16)" : T.accent,
              borderColor: event.isJoined ? "rgba(239,68,68,0.28)" : T.accent,
            },
          ]}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "900",
            }}
          >
            {event.isJoined ? "Ayrıl" : "Katıl"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Alert.alert("Paylaş", `${event.title} etkinliğini paylaş`);
          }}
          style={[
            styles.secondaryActionBtn,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
            },
          ]}
        >
          <Text style={{ color: T.textColor, fontWeight: "900" }}>Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Alert.alert("Hikayede Paylaş", "Etkinlik hikayede paylaşıldı");
          }}
          style={[
            styles.secondaryActionBtn,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
            },
          ]}
        >
          <Text style={{ color: T.textColor, fontWeight: "900" }}>H. Paylaş</Text>
        </TouchableOpacity>
      </View>

      {canManage && (
        <View style={styles.blockSection}>
          <Text style={styles.blockTitle}>Katılım İstekleri</Text>

          {pendingUsers.length === 0 ? (
            <Text style={styles.helperText}>Bekleyen istek yok</Text>
          ) : (
            pendingUsers.map((user) => (
              <View key={user.userId} style={styles.userRow}>
                <Text style={styles.userName}>{user.userId}</Text>

                <View style={styles.userRowActions}>
                  <TouchableOpacity onPress={() => handleApprove(user.userId)}>
                    <Text style={styles.approveText}>Onayla</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleReject(user.userId)}>
                    <Text style={styles.rejectText}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {canSeeParticipants && (
        <View style={styles.blockSection}>
          <Text style={styles.blockTitle}>Katılımcılar</Text>

          {members.length === 0 ? (
            <Text style={styles.helperText}>Henüz katılımcı yok</Text>
          ) : (
            members.map((user) => (
              <View key={user.userId} style={styles.userRow}>
                <View>
                  <Text style={styles.userName}>{user.userId}</Text>
                  <RoleBadge value={user.role} />
                </View>

                {canManage && user.userId !== (event as any)?.createdBy && (
                  <View style={styles.userRowActions}>
                    <TouchableOpacity onPress={() => handleKick(user.userId)}>
                      <Text style={styles.kickText}>Çıkar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleMute(user.userId)}>
                      <Text style={styles.muteText}>Sustur</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleBan(user.userId)}>
                      <Text style={styles.banText}>Engelle</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "bold", color: T.textColor }}>
          Arkadaşlarını Davet Et
        </Text>

        {(friends as any[]).map((f) => {
          const friendId = f.id ?? f.userId;
          const friendName = f.name ?? f.username ?? friendId;
          return (
            <TouchableOpacity
              key={friendId}
              onPress={() => sendEventInvite(eventId, currentUserId, friendId)}
              style={{
                padding: 10,
                marginTop: 8,
                backgroundColor: "#111",
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff" }}>{friendName}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.blockSection}>
        <Text style={styles.blockTitle}>Etkinlik Sohbeti</Text>

        {canMessage ? (
          <MessageInput />
        ) : role === "PENDING" ? (
          <Text style={styles.helperText}>Onay sonrası mesaj gönderebilirsin</Text>
        ) : role === "REJECTED" ? (
          <Text style={styles.helperText}>
            Katılımın reddedildiği için mesaj gönderemezsin
          </Text>
        ) : role === "BANNED" ? (
          <Text style={styles.helperText}>Engellendiğin için mesaj gönderemezsin</Text>
        ) : (
          <Text style={styles.helperText}>Mesaj göndermek için etkinliğe katılmalısın</Text>
        )}
      </View>
    </SocialScreenLayout>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
  },

  desc: {
    marginTop: 12,
    lineHeight: 18,
  },

  joinBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  participantBlock: {
    marginTop: 26,
  },

  sectionTitle: {
    fontWeight: "900",
    marginBottom: 10,
  },

  participantCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#4dbef3",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontWeight: "900",
  },

  chatBlock: {
    marginTop: 30,
  },

  messageRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  chatInputRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },

  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  modBtn: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  modBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  actionSection: {
    marginTop: 20,
    gap: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  primaryActionBtn: {
    flex: 1.2,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryActionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  inlineActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    flex: 1,
  },
  actionButtonPrimary: {
    backgroundColor: "#1d4ed8",
  },
  actionButtonSecondary: {
    backgroundColor: "rgba(29,78,216,0.16)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.32)",
  },
  actionButtonGhost: {
    backgroundColor: "transparent",
  },
  actionButtonDanger: {
    backgroundColor: "rgba(239,68,68,0.18)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.32)",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  actionButtonGhostText: {
    color: "#38bdf8",
  },
  statusCardOwner: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,191,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(0,191,255,0.28)",
  },
  statusCardOwnerText: {
    color: "#38bdf8",
    fontWeight: "700",
    fontSize: 15,
  },
  statusCardAdmin: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,197,94,0.16)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.28)",
  },
  statusCardAdminText: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 15,
  },
  statusCardPending: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250,204,21,0.16)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.28)",
  },
  statusCardPendingText: {
    color: "#facc15",
    fontWeight: "700",
    fontSize: 15,
  },
  statusCardRejected: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.16)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.28)",
  },
  statusCardRejectedText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 15,
  },
  blockSection: {
    marginTop: 26,
    gap: 10,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  helperText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  userRow: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#111111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  userName: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  userRowActions: {
    flexDirection: "row",
    gap: 10,
  },
  ownerBadge: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  adminBadge: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  memberBadge: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    marginTop: 4,
  },
  kickText: {
    color: "#f59e0b",
    fontWeight: "700",
  },
  muteText: {
    color: "#eab308",
    fontWeight: "700",
  },
  banText: {
    color: "#ef4444",
    fontWeight: "700",
  },
  approveText: {
    color: "#22c55e",
    fontWeight: "700",
  },
  rejectText: {
    color: "#ef4444",
    fontWeight: "700",
  },
});