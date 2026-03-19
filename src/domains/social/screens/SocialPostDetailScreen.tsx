// src/domains/social/screens/SocialPostDetailScreen.tsx
// 🔒 SOCIAL – POST DETAIL (UI-ONLY, STABLE)
// UPDATED:
// - Global Header
// - SafeArea uyumu
// - Layout sistemi

import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { RouteProp } from "@react-navigation/native";
import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

import SocialScreenLayout from "../components/SocialScreenLayout";

import type { SocialStackParamList } from "../navigation/SocialNavigator";

import {
  addComment,
  canAddComment,
  getComments,
  getPostById,
  isPostSaved,
  subscribeFeed,
  toggleLike as toggleLikePost,
  toggleSavedPost,
} from "../services/socialFeedStateService";

import { addNotification } from "../services/socialNotificationService";

import type { SocialComment, SocialPost } from "../types/social.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type Route = RouteProp<SocialStackParamList, "SocialPostDetail">;


/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SocialPostDetailScreen() {
  const T = useAppTheme();
  const route = useRoute<Route>();

  const { postId } = route.params;

  const [post, setPost] = useState<SocialPost | undefined>(() =>
    getPostById(postId)
  );
  const [comments, setComments] = useState<SocialComment[]>(() =>
    getComments(postId)
  );
  const [input, setInput] = useState("");

  useEffect(() => {
    setPost(getPostById(postId));
    setComments(getComments(postId));
    const unsub = subscribeFeed(() => {
      setPost(getPostById(postId));
      setComments(getComments(postId));
    });
    return unsub;
  }, [postId]);

  const saved = post ? isPostSaved(post.id) : false;
  const liked = post?.likedByMe ?? false;

  function handleToggleLike() {
    if (!post) return;
    toggleLikePost(post.id);
  }

  function handleToggleSave() {
    if (!post) return;
    toggleSavedPost(post.id);
  }

  function toggleCommentLike(id: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, likedByMe: !c.likedByMe } : c
      )
    );
  }

  function openPostMenu() {
    Alert.alert(
      t("social.postDetail.title"),
      `${t("social.feed.edit")} / ${t("social.feed.hide")} (UI-only)`
    );
  }

  function openCommentMenu() {
    Alert.alert(
      t("social.postDetail.comment"),
      `${t("social.feed.edit")} / ${t("social.feed.hide")} (UI-only)`
    );
  }

  function submitComment() {
    if (!input.trim() || !post) return;
    if (!canAddComment(post.id)) {
      Alert.alert(t("social.notifications"), t("social.restricted"));
      return;
    }
    addComment(post.id, {
      userId: "me",
      username: "Ben",
      text: input.trim(),
    });
    addNotification({
      id: `comment_${Date.now()}`,
      type: "comment",
      actorUserId: "me",
      actorUsername: "Ben",
      targetUserId: post.userId,
      postId: post.id,
      text: "yorum yaptı",
      createdAt: new Date().toISOString(),
      read: false,
    });
    setComments(getComments(post.id));
    setInput("");
  }

  if (!post) {
    return (
      <SocialScreenLayout title={t("social.postDetail.title")}>
        <View style={[styles.header, { borderBottomColor: T.border }]}>
          <Text style={{ color: T.mutedText }}>
            {t("social.postDetail.title")} bulunamadı
          </Text>
        </View>
      </SocialScreenLayout>
    );
  }

  const heartColor = liked ? T.accent : T.textColor;

  return (
    <SocialScreenLayout title={t("social.postDetail.title")}>
      {/* ================= POST HEADER ================= */}

      <View style={[styles.header, { borderBottomColor: T.border }]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          {post.userAvatarUri ? (
            <Image
              source={{ uri: post.userAvatarUri }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <Ionicons name="person" size={18} color={T.textColor} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: T.textColor, fontWeight: "900" }}>
            {post.username}
          </Text>

          <Text style={{ color: T.mutedText, fontSize: 12 }}>
            {post.caption ? `${post.caption.slice(0, 40)}…` : postId}
          </Text>
        </View>

        <TouchableOpacity onPress={handleToggleSave} style={{ marginRight: 8 }}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={T.textColor}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={openPostMenu}>
          <Ionicons name="ellipsis-horizontal" size={18} color={T.mutedText} />
        </TouchableOpacity>
      </View>

      {/* ================= POST ACTIONS ================= */}

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleToggleLike} style={styles.actionBtn}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={heartColor}
          />

          <Text
            style={{
              marginLeft: 6,
              color: heartColor,
              fontWeight: "900",
            }}
          >
            {t("social.postDetail.like")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              t("social.postDetail.comment"),
              "Yorum ekleme (UI-only)"
            )
          }
          style={styles.actionBtn}
        >
          <Ionicons name="chatbubble-outline" size={20} color={T.textColor} />

          <Text style={{ marginLeft: 6, color: T.textColor, fontWeight: "900" }}>
            {t("social.postDetail.comment")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= COMMENT INPUT ================= */}

      <View
        style={[
          styles.commentInputRow,
          { borderTopColor: T.border, borderBottomColor: T.border },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t("social.postDetail.commentPlaceholder")}
          placeholderTextColor={T.mutedText}
          style={[styles.input, { color: T.textColor }]}
        />

        <TouchableOpacity onPress={submitComment}>
          <Ionicons name="send" size={20} color={T.accent} />
        </TouchableOpacity>
      </View>

      {/* ================= COMMENTS ================= */}

      <FlatList
        data={comments}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={[styles.commentRow, { borderBottomColor: T.border }]}>
            <View
              style={[
                styles.commentAvatar,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <Ionicons name="person" size={14} color={T.textColor} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: T.textColor, fontWeight: "900" }}>
                {item.username}
              </Text>

              <Text style={{ color: T.textColor, marginTop: 2 }}>
                {item.text}
              </Text>

              <View style={styles.commentActions}>
                <TouchableOpacity
                  onPress={() => toggleCommentLike(item.id)}
                  style={styles.commentActionBtn}
                >
                  <Ionicons
                    name={item.likedByMe ? "heart" : "heart-outline"}
                    size={14}
                    color={item.likedByMe ? T.accent : T.mutedText}
                  />

                  <Text
                    style={{
                      marginLeft: 4,
                      color: item.likedByMe ? T.accent : T.mutedText,
                      fontWeight: "800",
                      fontSize: 12,
                    }}
                  >
                    {t("social.postDetail.like")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openCommentMenu}
                  style={styles.commentActionBtn}
                >
                  <Text
                    style={{
                      color: T.mutedText,
                      fontWeight: "800",
                      fontSize: 12,
                    }}
                  >
                    ⋯
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SocialScreenLayout>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
  },

  commentRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  commentActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 6,
  },

  commentActionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
});