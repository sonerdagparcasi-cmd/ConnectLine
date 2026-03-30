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
  canSendEventMessage,
  kickParticipant,
  banParticipant,
  muteParticipant,
  SocialEvent,
  SocialEventParticipant,
  socialEventService,
} from "../services/socialEventService";

import { getFriendsAttending } from "../services/socialFollowService";

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
  const canMessage = canSendEventMessage(eventId, currentUserId);

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
  }, [route.params.eventId]);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  const toggleJoin = useCallback(async () => {
    if (!event) return;

    if (event.isJoined) {
      await socialEventService.leaveEvent(event.id);
    } else {
      await socialEventService.joinEvent(event.id);
    }

    await loadEvent();
  }, [event]);

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
  };

  const handleBan = (userId: string) => {
    banParticipant(eventId, currentUserId, userId);
  };

  const handleMute = (userId: string) => {
    muteParticipant(eventId, currentUserId, userId);
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
          await socialEventService.deleteEvent(event.id);
          navigation.goBack();
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

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleJoin}
        style={[
          styles.joinBtn,
          { backgroundColor: event.isJoined ? T.border : T.accent },
        ]}
      >
        <Text
          style={{
            color: event.isJoined ? T.textColor : "#fff",
            fontWeight: "900",
          }}
        >
          {event.isJoined ? "Ayrıl" : "Katıl"}
        </Text>
      </TouchableOpacity>

      {/* PARTICIPANTS */}

      {participants.length > 0 && (
        <View style={styles.participantBlock}>
          <Text style={[styles.sectionTitle, { color: T.textColor }]}>
            Katılımcılar
          </Text>

          {participants.map((p) => (
            <View
              key={p.userId}
              style={[
                styles.participantCard,
                { borderColor: T.border, backgroundColor: T.cardBg },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {p.username.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: T.textColor, fontWeight: "800" }}>
                  {p.username}
                </Text>

                <Text style={{ color: T.mutedText, marginTop: 2 }}>
                  katıldı: {new Date(p.joinedAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* EVENT CHAT                                                         */}
      {/* ------------------------------------------------------------------ */}

      <View style={styles.chatBlock}>
        <Text style={[styles.sectionTitle, { color: T.textColor }]}>
          💬 Etkinlik Sohbeti
        </Text>

        {messages.map((m) => (
          <View key={m.id} style={styles.messageRow}>
            <Text style={{ color: T.textColor, fontWeight: "800" }}>
              {m.username}:
            </Text>

            <Text style={{ color: T.textColor }}> {m.text}</Text>
          </View>
        ))}

        {canMessage ? (
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

            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendBtn, { backgroundColor: T.accent }]}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ opacity: 0.6, textAlign: "center", color: T.mutedText }}>
            Katılımınız onaylanmadığı için mesaj gönderemezsiniz
          </Text>
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
});