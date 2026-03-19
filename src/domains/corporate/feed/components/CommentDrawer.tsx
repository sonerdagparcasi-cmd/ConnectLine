import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type DrawerComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  media?: {
    type: "image" | "video";
    uri: string;
  };
};

type MentionUser = {
  id: string;
  username: string;
};

type Props = {
  visible: boolean;
  comments: DrawerComment[];
  onClose: () => void;
  onAdd: (text: string) => void;
};

/**
 * 🔒 CommentDrawer (E8 – PIN + LIKE + MEDIA + MENTION)
 *
 * Kurallar:
 * - UI only
 * - Navigation YOK
 * - State tamamen LOCAL
 * - Feed / PostDetail etkilenmez
 */

/* ------------------------------------------------------------------ */
/* MOCK USERS (UI ONLY)                                                */
/* ------------------------------------------------------------------ */

const MOCK_USERS: MentionUser[] = [
  { id: "1", username: "soner" },
  { id: "2", username: "connectline" },
  { id: "3", username: "corporate" },
  { id: "4", username: "product" },
  { id: "5", username: "design" },
];

export default function CommentDrawer({
  visible,
  comments,
  onClose,
  onAdd,
}: Props) {
  const T = useAppTheme();

  const translateY = useRef(new Animated.Value(520)).current;
  const [text, setText] = useState("");

  /* ------------------------------------------------------------------ */
  /* LIKE STATE (UI ONLY)                                               */
  /* ------------------------------------------------------------------ */

  const [likes, setLikes] = useState<
    Record<string, { liked: boolean; count: number }>
  >({});

  useEffect(() => {
    const initial: Record<string, { liked: boolean; count: number }> = {};
    comments.forEach((c) => {
      initial[c.id] = initial[c.id] ?? { liked: false, count: 0 };
    });
    setLikes(initial);
  }, [comments]);

  function toggleLike(id: string) {
    setLikes((prev) => {
      const current = prev[id] ?? { liked: false, count: 0 };
      return {
        ...prev,
        [id]: {
          liked: !current.liked,
          count: current.liked
            ? Math.max(0, current.count - 1)
            : current.count + 1,
        },
      };
    });
  }

  /* ------------------------------------------------------------------ */
  /* PINNED COMMENT (UI ONLY)                                           */
  /* ------------------------------------------------------------------ */

  const [pinnedId, setPinnedId] = useState<string | null>(null);

  function togglePin(id: string) {
    setPinnedId((prev) => (prev === id ? null : id));
  }

  const orderedComments = pinnedId
    ? [
        ...comments.filter((c) => c.id === pinnedId),
        ...comments.filter((c) => c.id !== pinnedId),
      ]
    : comments;

  /* ------------------------------------------------------------------ */
  /* MENTION (@) LOGIC (UI ONLY)                                        */
  /* ------------------------------------------------------------------ */

  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  function handleTextChange(value: string) {
    setText(value);

    const match = value.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }

  function selectMention(username: string) {
    const updated = text.replace(/@\w*$/, `@${username} `);
    setText(updated);
    setShowMentions(false);
  }

  const filteredUsers = MOCK_USERS.filter((u) =>
    u.username.toLowerCase().startsWith(mentionQuery.toLowerCase())
  );

  /* ------------------------------------------------------------------ */
  /* ANIMATION                                                          */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 520,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  function submit() {
    const value = text.trim();
    if (!value) return;

    onAdd(value);
    setText("");
    setShowMentions(false);
    Keyboard.dismiss();
  }

  if (!visible) return null;

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <View style={styles.overlay}>
      {/* BACKDROP */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: T.cardBg,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* HANDLE */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: T.border }]} />
        </View>

        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: T.border }]}>
          <Text style={{ color: T.textColor, fontWeight: "900" }}>
            Yorumlar
          </Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={T.mutedText} />
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <ScrollView
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {orderedComments.map((c) => {
            const likeState = likes[c.id] ?? { liked: false, count: 0 };
            const isPinned = c.id === pinnedId;

            return (
              <View
                key={c.id}
                style={[
                  styles.commentRow,
                  isPinned && { backgroundColor: T.backgroundColor },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: T.border }]}>
                  <Ionicons name="person" size={14} color={T.textColor} />
                </View>

                <View style={{ flex: 1 }}>
                  {/* AUTHOR + PIN */}
                  <View style={styles.authorRow}>
                    <Text style={{ color: T.textColor, fontWeight: "800" }}>
                      {c.author}
                    </Text>

                    <TouchableOpacity
                      onPress={() => togglePin(c.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isPinned ? "pin" : "pin-outline"}
                        size={14}
                        color={isPinned ? T.accent : T.mutedText}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: T.textColor, marginTop: 2 }}>
                    {c.body}
                  </Text>

                  {/* MEDIA */}
                  {c.media && (
                    <View style={[styles.mediaBox, { borderColor: T.border }]}>
                      {c.media.type === "image" ? (
                        <Image
                          source={{ uri: c.media.uri }}
                          style={styles.media}
                          resizeMode="cover"
                        />
                      ) : (
                        <Video
                          source={{ uri: c.media.uri }}
                          style={styles.media}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={false}
                          isMuted
                          useNativeControls
                        />
                      )}
                    </View>
                  )}

                  {/* META */}
                  <View style={styles.metaRow}>
                    <Text style={{ color: T.mutedText, fontSize: 11 }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </Text>

                    <TouchableOpacity
                      onPress={() => toggleLike(c.id)}
                      style={styles.likeBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={likeState.liked ? "heart" : "heart-outline"}
                        size={14}
                        color={likeState.liked ? T.accent : T.mutedText}
                      />
                      {likeState.count > 0 && (
                        <Text style={styles.likeCount}>
                          {likeState.count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* INPUT + MENTIONS */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {showMentions && filteredUsers.length > 0 && (
            <View style={[styles.mentionBox, { borderColor: T.border }]}>
              {filteredUsers.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => selectMention(u.username)}
                  style={styles.mentionRow}
                >
                  <Text style={{ color: T.textColor }}>@{u.username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.inputRow, { borderTopColor: T.border }]}>
            <TextInput
              value={text}
              onChangeText={handleTextChange}
              placeholder="Yorum yaz…"
              placeholderTextColor={T.mutedText}
              style={[
                styles.input,
                {
                  color: T.textColor,
                  backgroundColor: T.backgroundColor,
                  borderColor: T.border,
                },
              ]}
              multiline
            />

            <TouchableOpacity
              onPress={submit}
              disabled={!text.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: text.trim() ? T.accent : T.border,
                },
              ]}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "82%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  handleWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
  },
  header: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  list: {
    paddingHorizontal: 16,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 8,
    borderRadius: 12,
  },
  authorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaBox: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  media: {
    width: "100%",
    height: 160,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 11,
    color: "#999",
  },
  mentionBox: {
    maxHeight: 120,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mentionRow: {
    paddingVertical: 6,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 96,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});