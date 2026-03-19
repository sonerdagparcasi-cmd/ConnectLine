// src/domains/chat/screens/ChatConversationScreen.tsx
// Production-level conversation UI: inverted FlatList, date separators, composer, typing

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "../../../shared/i18n/t";
import { useChat } from "../hooks/useChat";
import { useChatMessageSearch } from "../hooks/useChatMessageSearch";
import { useChatPinnedMessage } from "../hooks/useChatPinnedMessage";
import { useChatReply } from "../hooks/useChatReply";
import { useChatPresence } from "../hooks/useChatPresence";
import { useChatSettings } from "../hooks/useChatSettings";
import { useTypingSimulation } from "../hooks/useTypingSimulation";
import { useChatForward } from "../hooks/useChatReplyForward";

import * as Clipboard from "expo-clipboard";
import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";
import ChatEmptyState from "../components/ChatEmptyState";
import ChatMessageActionsSheet, {
  type QuickReactionEmoji,
} from "../components/ChatMessageActionsSheet";
import {
  AttachmentType,
  ChatComposer,
  ComposerSelectPayload,
} from "../components/composer";
import IncomingCallBanner from "../components/IncomingCallBanner";
import {
  MessageAudio,
  MessageBubble,
  MessageContact,
  MessageFile,
  MessageImage,
  MessageLocation,
  MessageReminder,
  MessageSkeletonList,
  MessageText,
  MessageVideo,
  type ReactionEmoji,
  TypingIndicator,
} from "../components/message";
import type { MessageReplyMeta } from "../components/message/message.types";
import { CHAT_SPACING } from "../config/chatSpacing";
import { CONVERSATION_FLATLIST } from "../config/flatListConfig";
import { ChatStackParamList } from "../navigation/ChatNavigator";
import { chatAudioRecorder } from "../services/chatAudioRecorder";
import { chatMediaPicker } from "../services/chatMediaPicker";
import { chatMediaService } from "../services/chatMediaService";
import { chatService } from "../services/chatService";
import {
  getReactionsForMessage,
  initReactionService,
  removeReaction,
  setReaction,
  toggleReaction,
} from "../services/reactionService";
import {
  type UiMessage,
  buildReplyMeta,
  createAudioMessage,
  createForwardedMessage,
  createMediaMessage,
  createReminderMessage,
  createStoryReplyMessage,
  createTextMessage,
} from "../services/chatMessageFactory";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type LocalMessage = UiMessage & {
  editedAt?: number;
  reactions?: { emoji: string; userId: string; createdAt?: number }[];
};

type ListItem =
  | { id: string; type: "date"; dateLabel: string }
  | { id: string; type: "message"; message: LocalMessage };

const TAB_BAR_HEIGHT = 70;
const LOADING_DELAY_MS = 400;
const HEADER_HEIGHT = 56;

function formatDateHeader(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t("chat.date.today");
  if (d.toDateString() === yesterday.toDateString()) return t("chat.date.yesterday");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function buildListData(messages: LocalMessage[]): ListItem[] {
  const out: ListItem[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const dateLabel = formatDateHeader(m.createdAt);
    const nextMessage = i > 0 ? messages[i - 1] : null;
    const showDate =
      !nextMessage ||
      formatDateHeader(m.createdAt) !== formatDateHeader(nextMessage.createdAt);
    if (showDate) {
      out.push({ id: `date-${m.createdAt}`, type: "date", dateLabel });
    }
    out.push({ id: m.id, type: "message", message: m });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* MESSAGE ROW (MEMOIZED)                                              */
/* ------------------------------------------------------------------ */

type MessageRowProps = {
  item: LocalMessage;
  onLongPress: () => void;
  onPressMedia: () => void;
  onPressReply: (reply: MessageReplyMeta) => void;
  onTogglePlay: () => void;
  onToggleSpeed: () => void;
  onRetry: () => void;
  onRetryMedia?: () => void;
  activeAudioId: string | null;
  playing: boolean;
  peerName?: string;
  peerAvatar?: string;
  highlightQuery?: string;
  messageDeleted?: boolean;
  reactionEntries?: { emoji: string; userId: string }[];
  currentUserId?: string;
  onReactionPress?: (emoji: ReactionEmoji) => void;
  /** Swipe right to reply (no sheet). */
  onSwipeReply?: () => void;
  /** When true, message is selected (e.g. actions sheet open). */
  isSelected?: boolean;
  /** Bottom margin (8pt grid: same sender 4, user switch 12, default 8). */
  rowMarginBottom?: number;
  bodyFontSize?: number;
};

const SWIPE_REPLY_THRESHOLD = 56;
const SWIPE_REPLY_MAX = 72;

const ConversationMessageRow = React.memo(function ConversationMessageRow({
  item,
  onLongPress,
  onPressMedia,
  onPressReply,
  onTogglePlay,
  onToggleSpeed,
  onRetry,
  onRetryMedia,
  activeAudioId,
  playing,
  peerName,
  peerAvatar,
  highlightQuery,
  messageDeleted,
  reactionEntries,
  currentUserId,
  onReactionPress,
  onSwipeReply,
  isSelected,
  rowMarginBottom = CHAT_SPACING.messageGap,
  bodyFontSize = 15,
}: MessageRowProps) {
  const T = useAppTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeResponder = useMemo(
    () =>
      onSwipeReply
        ? PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) =>
              Math.abs(g.dx) > 8 && Math.abs(g.dy) < 10,
            onPanResponderMove: (_, g) => {
              if (g.dx > 0) {
                const c = Math.min(g.dx, SWIPE_REPLY_MAX);
                translateX.setValue(c);
              }
            },
            onPanResponderRelease: (_, g) => {
              if (g.dx > SWIPE_REPLY_THRESHOLD) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onSwipeReply();
              }
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 120,
                friction: 14,
              }).start();
            },
          })
        : null,
    [onSwipeReply, translateX]
  );

  const replyMeta: MessageReplyMeta | undefined = item.replyTo
    ? {
        messageId: item.replyTo.messageId,
        preview: item.replyTo.preview,
        mine: item.replyTo.mine,
        senderName: item.replyTo.mine ? undefined : peerName,
      }
    : undefined;

  const textColor = T.textColor;

  const content = (
    <>
      {item.text != null && item.text !== "" && (
        <MessageText
          text={item.text}
          isMine={item.mine}
          textColor={textColor}
          highlight={highlightQuery}
          fontSize={bodyFontSize}
        />
      )}
      {item.media?.kind === "image" && item.media.uri && (
        <MessageImage
          uri={item.media.uri}
          onPress={onPressMedia}
          uploadStatus={item.media.uploadStatus}
          downloadStatus={item.media.downloadStatus}
          onRetry={onRetryMedia}
        />
      )}
      {item.media?.kind === "video" && item.media.uri && (
        <MessageVideo uri={item.media.uri} onPress={onPressMedia} />
      )}
      {item.media?.kind === "file" && (
        <MessageFile
          fileName={item.media.fileName}
          isMine={item.mine}
          onPress={onPressMedia}
        />
      )}
      {item.media?.kind === "contact" && (
        <MessageContact
          contactName={item.media.contactName ?? ""}
          contactPhone={item.media.contactPhone}
          isMine={item.mine}
          onPress={onPressMedia}
        />
      )}
      {item.media?.kind === "location" && (
        <MessageLocation
          label={item.media.locationLabel}
          lat={item.media.locationLat}
          lng={item.media.locationLng}
          isMine={item.mine}
          onPress={onPressMedia}
        />
      )}
      {item.reminder && (
        <MessageReminder
          note={item.reminder.note}
          date={item.reminder.date}
          time={item.reminder.time}
          isMine={item.mine}
        />
      )}
      {item.audio && (
        <MessageAudio
          uri={item.audio.uri}
          isMine={item.mine}
          isPlaying={activeAudioId === item.id && playing}
          speed={item.audio.speed}
          durationSec={item.audio.durationSec}
          progress={0}
          onTogglePlay={onTogglePlay}
          onToggleSpeed={onToggleSpeed}
        />
      )}
    </>
  );

  const bubble = (
    <MessageBubble
      isMine={item.mine}
      status={item.status}
      createdAt={item.createdAt}
      editedAt={item.editedAt}
      forwarded={item.forwarded}
      replyTo={replyMeta}
      senderName={peerName}
      senderAvatarUri={item.mine ? undefined : peerAvatar}
      onLongPress={onLongPress}
      onPressReply={onPressReply}
      onRetry={onRetry}
      isRead={item.status === "seen"}
      messageDeleted={messageDeleted}
      reactionEntries={reactionEntries}
      currentUserId={currentUserId}
      onReactionPress={onReactionPress}
      isSelected={isSelected}
      rowMarginBottom={rowMarginBottom}
      children={content}
    />
  );

  if (swipeResponder) {
    return (
      <Animated.View style={{ transform: [{ translateX }] }} {...swipeResponder.panHandlers}>
        {bubble}
      </Animated.View>
    );
  }
  return bubble;
});

/* ------------------------------------------------------------------ */
/* SCREEN                                                              */
/* ------------------------------------------------------------------ */

type NavProp = NativeStackNavigationProp<ChatStackParamList, "ChatRoom">;

export default function ChatConversationScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { chatId, peerName } = route.params ?? {};
  const isGroup = typeof chatId === "string" && chatId.startsWith("group_");

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<LocalMessage[]>([]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const base = getMockMessages(peerName);
      const queued = chatId ? (chatService.consumePendingMessages(chatId) as LocalMessage[]) : [];
      setMessages([...base, ...queued]);
      setLoading(false);
    }, LOADING_DELAY_MS);
    return () => clearTimeout(t);
  }, [peerName, chatId]);
  const [text, setText] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<LocalMessage | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [deleteVersion, setDeleteVersion] = useState(0);

  const listRef = useRef<FlatList<ListItem>>(null);
  const { replyTo, activateReply: setReplyTarget, clearReply } = useChatReply<LocalMessage>({
    messages,
    listRef: listRef as React.RefObject<FlatList<LocalMessage> | null>,
  });
  const { forwardMessage } = useChatForward();
  const { togglePin } = useChatPinnedMessage<LocalMessage>(
    messages,
    listRef as React.RefObject<FlatList<LocalMessage> | null>,
    isGroup ?? false
  );

  const { chat, markSeen } = useChat(chatId);
  const peerId = chat?.participantIds?.find((id) => id !== "me");

  useFocusEffect(
    useCallback(() => {
      if (chatId) markSeen();
    }, [chatId, markSeen])
  );
  const presence = useChatPresence(isGroup ? undefined : peerId);
  const { settings } = useChatSettings();
  const bodyFontSize = settings.fontSize === "small" ? 14 : settings.fontSize === "large" ? 16 : 15;
  const wallpaper = settings.wallpaper;
  const bgColor =
    !wallpaper || wallpaper === "none"
      ? T.backgroundColor
      : "transparent";
  const { isTyping: simulatedTyping } = useTypingSimulation(chatId);

  React.useEffect(() => {
    setTyping(simulatedTyping);
  }, [simulatedTyping]);
  const [playing, setPlaying] = useState(false);

  const insets = useSafeAreaInsets();
  const inputRef = useRef<any>(null);
  const atBottomRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);
  const [newMessagesBelow, setNewMessagesBelow] = useState(0);

  const visibleMessages = useMemo(
    () =>
      messages.filter(
        (m) => !chatId || !chatService.isHiddenForMe(chatId, m.id)
      ),
    [messages, chatId, deleteVersion]
  );
  const listData = useMemo(() => buildListData(visibleMessages), [visibleMessages]);

  React.useEffect(() => {
    initReactionService({
      getMessageReactions: (id) =>
        messages.find((m) => m.id === id)?.reactions ?? [],
      setMessageReactions: (id, reactions) =>
        setMessages((p) =>
          p.map((m) => (m.id === id ? { ...m, reactions } : m))
        ),
    });
  }, [messages]);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    const y = e.nativeEvent.contentOffset.y;
    atBottomRef.current = y < 60;
    if (atBottomRef.current) setNewMessagesBelow(0);
  }, []);

  React.useEffect(() => {
    const prev = prevMessageCountRef.current;
    if (messages.length > prev && !atBottomRef.current) {
      const newIncoming = messages
        .slice(prev)
        .filter((m) => !m.mine).length;
      if (newIncoming > 0) setNewMessagesBelow((n) => n + newIncoming);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, messages]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    setNewMessagesBelow(0);
  }, []);

  React.useEffect(() => {
    const event = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(event, () => {
      scrollToBottom();
    });
    return () => sub.remove();
  }, [scrollToBottom]);

  React.useEffect(() => {
    if (messages.length === 0) return;
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    atBottomRef.current = true;
    setNewMessagesBelow(0);
  }, [messages.length]);

  const getScrollIndex = useCallback(
    (msgIdx: number) => {
      const msg = messages[msgIdx];
      if (!msg) return -1;
      return listData.findIndex((x) => x.type === "message" && x.message.id === msg.id);
    },
    [messages, listData]
  );

  const search = useChatMessageSearch(messages, listRef, { getScrollIndex });

  const title = peerName ?? (isGroup ? "Group" : "Chat");

  useFocusEffect(
    useCallback(() => {
      const params = route.params as any;
      const pending = params?.pendingMedia;
      if (!pending?.uri || !pending?.type) return;
      const media = createMediaMessage({
        type: pending.type,
        uri: pending.uri,
        caption: pending.caption,
        replyTo: pending.replyTo,
        uploadStatus: "uploaded",
      }) as LocalMessage;
      setMessages((p) => [...p, media]);
      navigation.setParams({ pendingMedia: undefined } as any);
    }, [route.params, navigation])
  );

  useFocusEffect(
    useCallback(() => {
      const params = route.params as any;
      const pending = params?.pendingStoryReply;
      if (!pending?.text || !pending?.storyId || !pending?.storyOwnerId) return;

      const txt = pending.text.trim();
      if (!txt) {
        navigation.setParams({ pendingStoryReply: undefined } as any);
        return;
      }

      const msg = createStoryReplyMessage({
        text: txt,
        storyId: pending.storyId,
        storyOwnerId: pending.storyOwnerId,
        storyMediaUri: pending.storyMediaUri ?? null,
        status: "sending",
      }) as LocalMessage;

      setMessages((p) => [...p, msg]);
      navigation.setParams({ pendingStoryReply: undefined } as any);

      // simulate delivery
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, status: "delivered" as const } : m
          )
        );
      }, 800);
    }, [route.params, navigation])
  );

  // Mock: simulate one incoming message so "new message" banner can appear when scrolled up
  React.useEffect(() => {
    const t = setTimeout(() => {
      const incoming: LocalMessage = {
        id: `mock-incoming-${Date.now()}`,
        mine: false,
        status: "delivered",
        createdAt: Date.now(),
        text: "Hey, just checking in!",
      };
      setMessages((p) => [...p, incoming]);
    }, 22000);
    return () => clearTimeout(t);
  }, []);

  const handleSend = useCallback(() => {
    const v = text.trim();
    if (!v) return;
    if (editingId) {
      const patch = chatService.editMessage(editingId, v);
      if (patch) {
        setMessages((p) =>
          p.map((m) =>
            m.id === editingId ? { ...m, text: patch.text, editedAt: patch.editedAt } : m
          )
        );
        setEditingId(null);
        setText("");
        clearReply();
      }
      return;
    }
    const newMsg = createTextMessage({
      text: v,
      replyTo: replyTo ? buildReplyMeta(replyTo) : undefined,
      status: "sending",
    }) as LocalMessage;
    setMessages((p) => [...p, newMsg]);
    setText("");
    clearReply();
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: "delivered" as const } : m
        )
      );
    }, 800);
  }, [text, editingId, replyTo]);

  const handleComposerSelect = useCallback(
    (type: AttachmentType, payload?: ComposerSelectPayload) => {
      setComposerOpen(false);
      if (editingId) setEditingId(null);
      const pay = payload as any;
      if (type === "image" || type === "video") {
        if (pay?.uri && chatId) {
          navigation.navigate("ChatMediaPreview", {
            uri: pay.uri,
            type,
            chatId,
            peerName,
            replyTo: replyTo ? buildReplyMeta(replyTo) : undefined,
          });
        }
        clearReply();
        return;
      }
      if (type === "file" && pay?.uri) {
        const replyMeta = replyTo ? buildReplyMeta(replyTo) : undefined;
        const media = createMediaMessage({
          type: "file",
          uri: pay.uri,
          fileName: pay.fileName,
          replyTo: replyMeta,
          uploadStatus: "uploading",
        }) as LocalMessage;
        setMessages((p) => [...p, media]);
        clearReply();
        chatMediaService.upload({ uri: pay.uri, type: "file", fileName: pay.fileName, onProgress: () => {} }).then((r) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === media.id && m.media
                ? { ...m, media: { ...m.media, uploadStatus: r.success ? "uploaded" : "failed" } }
                : m
            )
          );
        });
        return;
      }
      if (type === "contact" && pay?.name) {
        const replyMeta = replyTo ? buildReplyMeta(replyTo) : undefined;
        const msg = createMediaMessage({
          type: "contact",
          contactName: pay.name,
          contactPhone: pay.phone,
          replyTo: replyMeta,
        }) as LocalMessage;
        setMessages((p) => [...p, msg]);
        clearReply();
        return;
      }
      if (type === "location" && pay?.lat != null && pay?.lng != null) {
        const replyMeta = replyTo ? buildReplyMeta(replyTo) : undefined;
        const msg = createMediaMessage({
          type: "location",
          locationLat: pay.lat,
          locationLng: pay.lng,
          locationLabel: pay.label,
          replyTo: replyMeta,
        }) as LocalMessage;
        setMessages((p) => [...p, msg]);
        clearReply();
        return;
      }
      if (type === "reminder" && pay?.reminderId != null) {
        const replyMeta = replyTo ? buildReplyMeta(replyTo) : undefined;
        const msg = createReminderMessage({
          reminderId: pay.reminderId,
          note: pay.note ?? "",
          date: pay.date ?? "",
          time: pay.time ?? "",
          targetUserIds: pay.targetUserIds ?? [],
          replyTo: replyMeta,
        }) as LocalMessage;
        setMessages((p) => [...p, msg]);
        clearReply();
        return;
      }
    },
    [editingId, replyTo, chatId, peerName, navigation]
  );

  const handleAttachMedia = useCallback(
    async (
      asset?: ComposerSelectPayload | { uri: string; type?: string | null },
      type?: AttachmentType
    ) => {
      if (type === "image" && (!asset || !("uri" in asset) || !asset.uri)) {
        const picked = await chatMediaPicker.pickImageFromGallery();
        if (picked) {
          handleComposerSelect("image", {
            kind: "image",
            uri: picked.uri,
            width: picked.width,
            height: picked.height,
            mimeType: picked.mimeType,
            fileName: picked.fileName,
          } as ComposerSelectPayload);
        }
        return;
      }

      if (type != null && asset != null) {
        handleComposerSelect(type, asset as ComposerSelectPayload);
        return;
      }

      if (asset && typeof asset === "object" && "uri" in asset) {
        const mediaType =
          "type" in asset && asset.type === "video"
            ? "video"
            : "image";

        handleComposerSelect(
          mediaType,
          {
            kind: mediaType,
            uri: asset.uri,
          } as ComposerSelectPayload
        );
      }
    },
    [handleComposerSelect]
  );

  const handleStartVoice = useCallback(async () => {
    await chatAudioRecorder.start();
  }, []);

  const handleStopVoice = useCallback(
    async (cancel: boolean, durationSec?: number) => {
      if (cancel) {
        await chatAudioRecorder.cancel();
        return;
      }

      const result = await chatAudioRecorder.stop();
      if (!result?.uri) return;

      const replyMeta = replyTo ? buildReplyMeta(replyTo) : undefined;
      const msg = createAudioMessage({
        uri: result.uri,
        replyTo: replyMeta,
      }) as LocalMessage;
      const sec =
        durationSec ?? (result.durationMillis ? result.durationMillis / 1000 : 0);
      if (msg.audio) {
        msg.audio = { ...msg.audio, durationSec: Math.round(sec * 10) / 10 };
      }
      setMessages((p) => [...p, msg]);
      clearReply();
    },
    [replyTo]
  );

  const openActions = useCallback((m: LocalMessage) => {
    setSelectedMessage(m);
    setActionsOpen(true);
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const activateReply = useCallback((m: LocalMessage) => {
    setReplyTarget(m);
    setEditingId(null);
    requestAnimationFrame(() => inputRef.current?.focus?.());
  }, [setReplyTarget]);

  const handlePressReply = useCallback(
    (reply: MessageReplyMeta) => {
      const msg = messages.find((m) => m.id === reply.messageId);
      if (msg) activateReply(msg);
    },
    [messages, activateReply]
  );

  const handleReplyFromActions = useCallback(() => {
    if (selectedMessage) activateReply(selectedMessage);
    setActionsOpen(false);
  }, [selectedMessage, activateReply]);

  const handleCopyFromActions = useCallback(async () => {
    if (selectedMessage?.text) {
      await Clipboard.setStringAsync(selectedMessage.text);
    }
    setActionsOpen(false);
  }, [selectedMessage]);

  const handleForwardFromActions = useCallback(() => {
    if (selectedMessage) {
      forwardMessage(selectedMessage, (msg) => {
        setMessages((p) => [...p, { ...msg, id: `fwd-${Date.now()}` } as LocalMessage]);
      });
    }
    setActionsOpen(false);
  }, [selectedMessage, forwardMessage]);

  const handleDeleteForMe = useCallback(() => {
    if (selectedMessage?.id && chatId) {
      chatService.deleteForMe(chatId, selectedMessage.id);
      setDeleteVersion((v) => v + 1);
      if (editingId === selectedMessage.id) setEditingId(null);
      if (replyTo?.id === selectedMessage.id) clearReply();
    }
    setActionsOpen(false);
  }, [selectedMessage, chatId, editingId, replyTo, clearReply]);

  const handleDeleteForEveryone = useCallback(() => {
    if (selectedMessage?.id && chatId) {
      chatService.deleteForEveryone(chatId, selectedMessage.id);
      setDeleteVersion((v) => v + 1);
      if (editingId === selectedMessage.id) setEditingId(null);
      if (replyTo?.id === selectedMessage.id) clearReply();
    }
    setActionsOpen(false);
  }, [selectedMessage, chatId, editingId, replyTo, clearReply]);

  const handlePinMessage = useCallback(() => {
    if (selectedMessage) togglePin(selectedMessage);
    setActionsOpen(false);
  }, [selectedMessage, togglePin]);

  const handleQuickReaction = useCallback(
    (emoji: QuickReactionEmoji) => {
      if (!selectedMessage?.id) {
        setActionsOpen(false);
        return;
      }
      const cur = getReactionsForMessage(selectedMessage.id);
      if (cur.some((r) => r.userId === "me" && r.emoji === emoji)) {
        removeReaction(selectedMessage.id, emoji, "me");
      } else {
        setReaction(selectedMessage.id, emoji, "me");
      }
      setActionsOpen(false);
    },
    [selectedMessage]
  );

  const handleRetryMedia = useCallback((m: LocalMessage) => {
    if (!m.media?.uri) return;
    setMessages((p) =>
      p.map((msg) =>
        msg.id === m.id && msg.media
          ? { ...msg, media: { ...msg.media, uploadStatus: "uploading" as const } }
          : msg
      )
    );
    chatMediaService.upload({ uri: m.media.uri, type: m.media.kind as "image" | "video" | "file", fileName: m.media.fileName }).then((r) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === m.id && msg.media
            ? { ...msg, media: { ...msg.media, uploadStatus: r.success ? "uploaded" : "failed" } }
            : msg
        )
      );
    });
  }, []);

  const handleEditFromActions = useCallback(() => {
    if (
      selectedMessage &&
      chatService.canEditMessageForUI(selectedMessage, "me")
    ) {
      setEditingId(selectedMessage.id);
      setText(selectedMessage.text ?? "");
      clearReply();
      setActionsOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus?.());
    }
  }, [selectedMessage, clearReply]);

  const handleLongPressMessage = useCallback((m: LocalMessage) => {
    setSelectedMessage(m);
    setActionsOpen(true);
  }, []);

  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      if (item.type === "date") {
        return (
          <View style={[styles.dateWrap, { backgroundColor: T.backgroundColor }]}>
            <Text style={[styles.dateText, { color: T.mutedText }]}>
              {item.dateLabel}
            </Text>
          </View>
        );
      }
      const m = item.message;
      const nextItem = listData[index + 1];
      const rowMarginBottom =
        nextItem?.type === "message"
          ? nextItem.message.mine === m.mine
            ? CHAT_SPACING.sameSenderGap
            : CHAT_SPACING.userSwitchGap
          : CHAT_SPACING.messageGap;
      return (
        <ConversationMessageRow
          item={m}
          rowMarginBottom={rowMarginBottom}
          onLongPress={() => handleLongPressMessage(m)}
          onPressMedia={() => {}}
          onPressReply={handlePressReply}
          onTogglePlay={() => {
            if (activeAudioId === m.id) {
              setPlaying((p) => !p);
            } else {
              setActiveAudioId(m.id);
              setPlaying(true);
            }
          }}
          onToggleSpeed={() => {
            setMessages((p) =>
              p.map((msg) =>
                msg.id === m.id && msg.audio
                  ? { ...msg, audio: { ...msg.audio, speed: (msg.audio.speed === 2 ? 1 : ((msg.audio.speed ?? 1) + 0.5)) as 1 | 1.5 | 2 } }
                  : msg
              )
            );
          }}
          onRetry={() => {}}
          onRetryMedia={() => handleRetryMedia(m)}
          activeAudioId={activeAudioId}
          playing={playing}
          peerName={peerName}
          highlightQuery={search.open && search.query.trim() ? search.query.trim() : undefined}
          messageDeleted={chatId ? chatService.isDeletedForEveryone(m.id) : false}
          reactionEntries={m.reactions?.map((r) => ({ emoji: r.emoji, userId: r.userId })) ?? []}
          currentUserId="me"
          onReactionPress={(emoji) => {
            const cur = getReactionsForMessage(m.id);
            if (cur.some((r) => r.userId === "me" && r.emoji === emoji)) {
              removeReaction(m.id, emoji, "me");
            } else {
              setReaction(m.id, emoji, "me");
            }
          }}
          isSelected={actionsOpen && selectedMessage?.id === m.id}
          onSwipeReply={
            chatId && !chatService.isDeletedForEveryone(m.id)
              ? () => activateReply(m)
              : undefined
          }
          bodyFontSize={bodyFontSize}
        />
      );
    },
    [T, chatId, listData, actionsOpen, selectedMessage?.id, handleLongPressMessage, handlePressReply, handleRetryMedia, activeAudioId, playing, peerName, search.open, search.query, bodyFontSize]
  );

  return (
    <View style={styles.container}>
      {wallpaper && wallpaper !== "none" && "type" in wallpaper && wallpaper.type === "color" && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: wallpaper.value }]} />
      )}
      {wallpaper && wallpaper !== "none" && "type" in wallpaper && wallpaper.type === "image" && (
        <Image source={{ uri: wallpaper.uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      )}
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor, flex: 1 }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top + 20}
    >
      <IncomingCallBanner />
      <AppGradientHeader
        title={search.open ? t("chat.search.placeholder") : title}
        onBack={() => (search.open ? search.closeSearch() : navigation.goBack())}
      />

      {search.open && (
        <View style={[styles.searchBar, { backgroundColor: T.cardBg, borderColor: T.border }]}>
          <TextInput
            value={search.query}
            onChangeText={search.setQuery}
            placeholder={t("chat.search.placeholder")}
            placeholderTextColor={T.mutedText}
            style={[styles.searchInput, { color: T.textColor, backgroundColor: T.cardBg }]}
            autoFocus
          />
          <Text style={[styles.searchResults, { color: T.mutedText }]}>
            {search.matches.length > 0
              ? `${search.matchIndex + 1}/${search.matches.length}`
              : "0"}
          </Text>
          <TouchableOpacity onPress={search.prev} style={styles.headerBtn} disabled={search.matches.length === 0}>
            <Ionicons name="chevron-up" size={22} color={T.textColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={search.next} style={styles.headerBtn} disabled={search.matches.length === 0}>
            <Ionicons name="chevron-down" size={22} color={T.textColor} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.mainContent}>
        <FlatList
          ref={listRef}
          style={styles.list}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onScroll={handleScroll}
          scrollEventThrottle={100}
          inverted
          windowSize={CONVERSATION_FLATLIST.windowSize}
          maxToRenderPerBatch={CONVERSATION_FLATLIST.maxToRenderPerBatch}
          initialNumToRender={CONVERSATION_FLATLIST.initialNumToRender}
          removeClippedSubviews={CONVERSATION_FLATLIST.removeClippedSubviews}
          updateCellsBatchingPeriod={50}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
          typing ? (
            <TypingIndicator
              label={t("chat.presence.typingLabel").replace("{{name}}", peerName ?? "") || t("chat.inbox.typing")}
            />
          ) : null
        }
        ListHeaderComponentStyle={styles.typingWrap}
        ListEmptyComponent={
          messages.length === 0 ? (
            loading ? (
              <MessageSkeletonList loadingLabel={t("chat.loading.messages")} />
            ) : (
              <ChatEmptyState
                icon="chatbubble-outline"
                title={t("chat.conversation.emptyTitle")}
                description={t("chat.conversation.emptyDesc")}
              />
            )
          ) : null
        }
        />

       <View
  style={[
    styles.composerWrap,
    {
      backgroundColor: "transparent",
      borderTopColor: "transparent",
      paddingBottom: insets.bottom + 14,
    },
  ]}
>
          <ChatComposer
            value={text}
            onChangeText={setText}
            onSend={handleSend}
            onAttachMedia={handleAttachMedia}
            onStartVoiceRecording={handleStartVoice}
            onStopVoiceRecording={handleStopVoice}
            isEditing={!!editingId}
            isReply={!!replyTo}
            onEmojiPress={() => {}}
          />
        </View>
      </View>

      {newMessagesBelow > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={scrollToBottom}
          style={[styles.newMessagesBanner, { backgroundColor: T.accent, shadowColor: T.border }]}
        >
          <Ionicons name="chevron-down" size={18} color={T.textColor} />
          <Text style={[styles.newMessagesBannerText, { color: T.textColor }]}>
            {newMessagesBelow === 1
              ? t("chat.conversation.newMessage")
              : t("chat.conversation.newMessages").replace("{{count}}", String(newMessagesBelow))}
          </Text>
        </TouchableOpacity>
      )}

      <ChatMessageActionsSheet
        visible={actionsOpen}
        message={selectedMessage as any}
        onClose={() => setActionsOpen(false)}
        onReply={handleReplyFromActions}
        onForward={handleForwardFromActions}
        onCopy={handleCopyFromActions}
        onEdit={handleEditFromActions}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
        onPinMessage={handlePinMessage}
        onQuickReaction={handleQuickReaction}
        canEditOverride={
          selectedMessage
            ? !chatService.isDeletedForEveryone(selectedMessage.id) &&
              chatService.canEditMessageForUI(selectedMessage, "me")
            : false
        }
        isDeletedForEveryone={
          selectedMessage
            ? chatService.isDeletedForEveryone(selectedMessage.id)
            : false
        }
        isSystemMessage={
          selectedMessage
            ? chatService.isDeletedForEveryone(selectedMessage.id)
            : false
        }
      />
    </KeyboardAvoidingView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* MOCK DATA                                                           */
/* ------------------------------------------------------------------ */

function getMockMessages(peerName?: string): LocalMessage[] {
  const now = Date.now();
  return [
    {
      id: "1",
      mine: false,
      status: "seen",
      createdAt: now - 86400000 * 2,
      text: "Hello! This is a sample conversation.",
      senderName: peerName,
    } as LocalMessage,
    {
      id: "2",
      mine: true,
      status: "delivered",
      createdAt: now - 86400000 * 2 + 60000,
      text: "Hi there! How are you?",
    } as LocalMessage,
    {
      id: "3",
      mine: false,
      status: "seen",
      createdAt: now - 3600000,
      text: "I'm good, thanks. Just testing the new chat UI.",
    } as LocalMessage,
    {
      id: "4",
      mine: true,
      status: "seen",
      createdAt: now - 1800000,
      text: "Looks great with bubbles, replies and reactions.",
    } as LocalMessage,
  ];
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchResults: { fontSize: 12, marginRight: 4 },
  mainContent: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: CHAT_SPACING.screenEdge,
    paddingTop: 8,
    paddingBottom: 12,
  },
  dateWrap: {
    alignSelf: "center",
    paddingTop: CHAT_SPACING.daySeparatorTop,
    paddingBottom: CHAT_SPACING.daySeparatorBottom,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dateText: { fontSize: 12, fontWeight: "600" },
  typingWrap: { marginBottom: 8 },
  composerWrap: {
    borderTopWidth: 0,
  },
  reactionOverlay: {
    position: "absolute",
    bottom: 80,
    left: CHAT_SPACING.screenEdge,
    zIndex: 10,
  },
  newMessagesBanner: {
    position: "absolute",
    left: CHAT_SPACING.screenEdge,
    right: CHAT_SPACING.screenEdge,
    bottom: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    zIndex: 8,
    shadowColor: undefined,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  newMessagesBannerText: { fontSize: 14, fontWeight: "700" },
});