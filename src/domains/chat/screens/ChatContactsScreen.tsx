// src/domains/chat/screens/ChatContactsScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { getColors } from "../../../shared/theme/colors";
import { t } from "../../../shared/i18n/t";
import { useContacts } from "../hooks/useContacts";
import { ChatStackParamList } from "../navigation/ChatNavigator";
import type { Contact } from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type Nav = NativeStackNavigationProp<ChatStackParamList>;

type RouteParams = {
  mode?: "single" | "group";
};

/* ------------------------------------------------------------------ */
/* SCREEN                                                              */
/* ------------------------------------------------------------------ */

export default function ChatContactsScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();

  const mode: "single" | "group" =
    (route?.params as RouteParams | undefined)?.mode ?? "single";

  // 🔑 TEK VE GERÇEK VERİ KAYNAĞI
  const { permission, state, matched, unmatched, reload } = useContacts();

  /* ------------------------------------------------------------------ */
  /* PERMISSION STATES                                                  */
  /* ------------------------------------------------------------------ */

  if (permission === "notAsked" || state === "idle") {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Ionicons name="people" size={48} color={T.mutedText} />
        <Text style={[styles.title, { color: T.textColor }]}>
          Rehberine erişelim mi?
        </Text>
        <Text style={[styles.desc, { color: T.mutedText }]}>
          ConnectLine kullanan kişileri bulabilmemiz için rehberine erişmemiz
          gerekiyor.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: T.accent }]}
          onPress={reload}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryText, { color: C.buttonText }]}>İzin Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: T.mutedText, marginTop: 12 }}>Şimdi değil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permission === "denied") {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Ionicons name="lock-closed" size={48} color={T.mutedText} />
        <Text style={[styles.title, { color: T.textColor }]}>
          Rehber izni kapalı
        </Text>
        <Text style={[styles.desc, { color: T.mutedText }]}>
          Ayarlardan rehber iznini açabilirsin.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: T.accent }]}
          onPress={reload}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryText, { color: C.buttonText }]}>Tekrar Dene</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: T.mutedText, marginTop: 12 }}>Geri</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* HELPERS                                                            */
  /* ------------------------------------------------------------------ */

  function renderAvatar(contact: Contact) {
    if (contact.avatarUrl) {
      return <Image source={{ uri: contact.avatarUrl }} style={styles.avatar} />;
    }

    return (
      <View style={[styles.avatar, { backgroundColor: T.border }]}>
        <Text style={{ color: T.textColor, fontWeight: "700" }}>
          {contact.displayName?.charAt(0) ?? "?"}
        </Text>
      </View>
    );
  }

  function startDirectChat(contact: Contact) {
    if (!contact.userId) return;

    // 🔒 DOMAIN KURALI (chatId contract)
    const chatId = `direct_${contact.userId}`;

    navigation.navigate("ChatRoom", {
      chatId,
      peerName: contact.displayName,
    });
  }

  function startGroupFlow(contact: Contact) {
    // UI-only: CreateGroup ekranının param sözleşmesi yoksa bile kırmamak için "as any"
    navigation.navigate("CreateGroup" as any, {
      initialMemberIds: contact.userId ? [contact.userId] : [],
      initialMemberNames: [contact.displayName],
    } as any);
  }

  function inviteContact(contact: Contact) {
    // UI-only placeholder
    alert(`${contact.displayName} davet edilecek (SMS / link – ileride)`);
  }

  function onPressMatched(contact: Contact) {
    if (mode === "group") {
      startGroupFlow(contact);
      return;
    }
    startDirectChat(contact);
  }

  function renderContact(contact: Contact) {
    const isMatched = !!contact.userId;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: T.cardBg, borderColor: T.border },
        ]}
      >
        <View style={styles.info}>
          {renderAvatar(contact)}

          <View style={{ flex: 1 }}>
            <Text style={{ color: T.textColor, fontWeight: "700" }}>
              {contact.displayName}
            </Text>
            {!!contact.phoneNumber && (
              <Text style={{ color: T.mutedText, fontSize: 12, marginTop: 2 }}>
                {contact.phoneNumber}
              </Text>
            )}
          </View>
        </View>

        {isMatched ? (
          <TouchableOpacity
            onPress={() => onPressMatched(contact)}
            activeOpacity={0.85}
            style={styles.actionIconBtn}
          >
            <Ionicons
              name={mode === "group" ? "people" : "chatbubble"}
              size={20}
              color={T.textColor}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => inviteContact(contact)} activeOpacity={0.85}>
            <Text style={{ color: T.accent, fontSize: 12, fontWeight: "800" }}>
              Davet Et
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* LIST                                                               */
  /* ------------------------------------------------------------------ */

  const data = [...matched, ...unmatched];

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      {/* MODE INFO (UI-only, kırmaz) */}
      <View style={[styles.modeBar, { borderColor: T.border }]}>
        <Text style={{ color: T.textColor, fontWeight: "900" }}>
          {mode === "group" ? t("chat.contacts.selectForGroup") : t("chat.contacts.selectPerson")}
        </Text>
        <Text style={{ color: T.mutedText, fontSize: 12, marginTop: 2 }}>
          {mode === "group"
            ? t("chat.contacts.selectDescGroup")
            : t("chat.contacts.selectDescSingle")}
        </Text>
      </View>

      <FlatList
        contentContainerStyle={{
          padding: 12,
          gap: 10,
          flexGrow: data.length === 0 ? 1 : undefined,
        }}
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => renderContact(item)}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="people-outline" size={42} color={T.mutedText} />
            <Text style={[styles.title, { color: T.textColor, marginTop: 10 }]}>
              {t("chat.contacts.noContacts")}
            </Text>
            <Text style={[styles.desc, { color: T.mutedText }]}>
              {t("chat.contacts.emptyDesc")}
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: T.accent }]}
              onPress={reload}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryText}>{t("chat.contacts.reload")}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  primaryText: {
    fontWeight: "800",
  },

  modeBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});