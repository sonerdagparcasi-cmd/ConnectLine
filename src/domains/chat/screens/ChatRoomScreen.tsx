// src/domains/chat/screens/ChatRoomScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
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
import ChatComposerSheet, {
  AttachmentType,
  ComposerSelectPayload,
} from "../components/ChatComposerSheet";
import ChatMessageActionsSheet from "../components/ChatMessageActionsSheet";
import MessageRow from "../components/MessageRow";
import { useChatReply } from "../hooks/useChatReply";
import { useChatRoomAudio } from "../hooks/useChatRoomAudio";
import { useChatRoomRecording } from "../hooks/useChatRoomRecording";
import { ChatStackParamList } from "../navigation/ChatNavigator";
import {
  UiMessage,
  buildReplyMeta,
  createMediaMessage,
  createTextMessage,
} from "../services/chatMessageFactory";

/* ------------------------------------------------------------------ */
/* CONSTANTS (🔒)                                                      */
/* ------------------------------------------------------------------ */

const BOTTOM_BAR_HEIGHT = 56;
const COMPOSER_HEIGHT = 48;

type NavProp = NativeStackNavigationProp<ChatStackParamList, "ChatRoom">;

type LocalMessage = UiMessage & {
  editedAt?: number;
};

/* ------------------------------------------------------------------ */
/* SCREEN (🔒)                                                         */
/* ------------------------------------------------------------------ */

export default function ChatRoomScreen() {
  const T = useAppTheme();
  const C = getColors(T.isDark);
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();

  const { chatId, peerName } = route.params ?? {};
  const isGroup = typeof chatId === "string" && chatId.startsWith("group_");

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [text, setText] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  const [selected, setSelected] = useState<LocalMessage | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  const listRef = useRef<FlatList<LocalMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  /* ---------------- AUDIO ---------------- */

  const { activeAudioId, playing, togglePlay, toggleSpeed } =
    useChatRoomAudio(messages, setMessages);

  /* ---------------- REPLY (GERÇEK API) ---------------- */

  const {
    replyTo,
    replyRef,
    activateReply,
    clearReply,
  } = useChatReply<LocalMessage>({
    messages,
    listRef,
  });

  /* ---------------- RECORDING ---------------- */

  const { recording, startRecording, stopRecording, panResponder } =
    useChatRoomRecording<LocalMessage>({
      appendMessage: (m) => setMessages((p) => [...p, m]),
      replyRef,
    });

  /* ---------------- EDIT / SEND ---------------- */

  function startEdit(target: LocalMessage) {
    if (!target.mine || !target.text?.trim()) return;
    setEditingId(target.id);
    setText(target.text);
    clearReply();
    requestAnimationFrame(() => inputRef.current?.focus());
    Haptics.selectionAsync().catch(() => {});
  }

  function cancelEdit() {
    setEditingId(null);
    setText("");
  }

  function saveEdit() {
    const v = text.trim();
    if (!editingId || !v) return;

    setMessages((p) =>
      p.map((m) =>
        m.id === editingId ? { ...m, text: v, editedAt: Date.now() } : m
      )
    );
    setEditingId(null);
    setText("");
  }

  function sendText() {
    const v = text.trim();
    if (!v) return;

    if (editingId) {
      saveEdit();
      return;
    }

    setMessages((p) => [
      ...p,
      createTextMessage({
        text: v,
        replyTo: replyTo ? buildReplyMeta(replyTo) : undefined,
      }) as LocalMessage,
    ]);

    setText("");
    clearReply();
  }

  function handleComposerSelect(
    type: AttachmentType,
    payload?: ComposerSelectPayload
  ) {
    setComposerOpen(false);
    if (editingId) cancelEdit();

    setMessages((p) => [
      ...p,
      createMediaMessage({
        type,
        uri: (payload as any)?.uri,
        fileName: (payload as any)?.fileName,
        replyTo: replyTo ? buildReplyMeta(replyTo) : undefined,
      }) as LocalMessage,
    ]);

    clearReply();
  }

  /* ---------------- ACTIONS ---------------- */

  function openActions(target: LocalMessage) {
    setSelected(target);
    setActionsOpen(true);
    Haptics.selectionAsync().catch(() => {});
  }

  function handleReplyFromActions() {
    if (!selected) return;
    activateReply(selected);
    setActionsOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleEditFromActions() {
    if (!selected) return;
    setActionsOpen(false);
    startEdit(selected);
  }

  const onSwipeReply = useCallback(
    (m: LocalMessage) => {
      if (editingId) cancelEdit();
      activateReply(m);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [editingId, activateReply]
  );

  const title = useMemo(
    () => peerName ?? (isGroup ? "Grup" : "Sohbet"),
    [peerName, isGroup]
  );

  /* ---------------- RENDER ---------------- */

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: T.backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={BOTTOM_BAR_HEIGHT}
    >
      {/* HEADER */}
      <AppGradientHeader
        title={title}
        onBack={() => navigation.goBack()}
        right={
          isGroup ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("Conference", { chatId })}
              style={{ padding: 8 }}
            >
              <Ionicons name="videocam" size={20} color={T.isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* LIST */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          padding: 12,
          paddingBottom:
            BOTTOM_BAR_HEIGHT +
            COMPOSER_HEIGHT +
            20 +
            (replyTo || editingId ? 52 : 0),
        }}
        renderItem={({ item }) => (
          <MessageRow
            item={item}
            isHighlighted={false}
            onOpenMedia={() => {}}
            onOpenActions={openActions}
            onSwipeReply={onSwipeReply}
            onPressReplyBanner={() => {}}
            activeAudioId={activeAudioId}
            playing={playing}
            togglePlay={togglePlay}
            toggleSpeed={toggleSpeed}
          />
        )}
      />

      {/* COMPOSER */}
      <View
        style={[
          styles.composer,
          { borderColor: T.border, backgroundColor: T.cardBg },
        ]}
      >
        <TouchableOpacity onPress={() => setComposerOpen(true)}>
          <Ionicons name="add" size={20} color={T.textColor} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          multiline
          placeholder={
            editingId
              ? "Mesajını düzenle…"
              : replyTo
              ? "Yanıt yaz…"
              : "Mesaj yaz…"
          }
          placeholderTextColor={T.mutedText}
          style={[styles.input, { color: T.textColor }]}
        />

        <View {...panResponder.panHandlers}>
          <TouchableOpacity
            onPress={() => (recording ? stopRecording(true) : startRecording())}
          >
            <Ionicons
              name={recording ? "stop" : "mic"}
              size={20}
              color={recording ? C.danger : T.textColor}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={sendText}>
          <Ionicons
            name={editingId ? "checkmark" : "send"}
            size={20}
            color={T.accent}
          />
        </TouchableOpacity>
      </View>

      <ChatComposerSheet
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSelect={handleComposerSelect}
      />

      <ChatMessageActionsSheet
        visible={actionsOpen}
        message={selected}
        onClose={() => setActionsOpen(false)}
        onReply={handleReplyFromActions}
        onForward={() => setActionsOpen(false)}
        onCopy={() => setActionsOpen(false)}
        onEdit={handleEditFromActions}
        onDeleteForMe={() => {
          if (selected?.id) {
            setMessages((p) => p.filter((m) => m.id !== selected.id));
            if (editingId === selected.id) cancelEdit();
            if (replyTo?.id === selected.id) clearReply();
          }
          setActionsOpen(false);
        }}
        onDeleteForEveryone={() => setActionsOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES (🔒)                                                         */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 2,
    flex: 1,
  },
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: BOTTOM_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 96,
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontWeight: "700",
  },
});