// src/domains/social/screens/SocialPostDetailScreen.tsx
// 🔒 SOCIAL – POST DETAIL (UI-ONLY, STABLE)
// UPDATED:
// - Global Header
// - SafeArea uyumu
// - Layout sistemi

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
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
  canAddComment,
  getPostById,
  isPostSaved,
  subscribeFeed,
  toggleLike as toggleLikePost,
  toggleSavedPost,
} from "../services/socialFeedStateService";
import { addComment, getComments } from "../services/socialCommentService";
import {
  getCurrentSocialUserId,
  isBlocked,
  subscribeFollow,
} from "../services/socialFollowService";

import { SOCIAL_LIKE_ACTIVE_COLOR } from "../constants/socialInteraction";
import type { SocialComment, SocialPost } from "../types/social.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type Route = RouteProp<SocialStackParamList, "SocialPostDetail">;
type Nav = NativeStackNavigationProp<SocialStackParamList>;


/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SocialPostDetailScreen() {
  const T = useAppTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  const { postId } = route.params;

  const [post, setPost] = useState<SocialPost | undefined>(() =>
    getPostById(postId)
  );
  const [comments, setComments] = useState<SocialComment[]>(() =>
    getComments(postId)
  );
  const [input, setInput] = useState("");
  const inputRef = useRef<TextInput>(null);
  /** Engelle / takip grafik güncellemelerinde yeniden çizim */
  const [, setGraphTick] = useState(0);

  useEffect(() => {
    const sync = () => {
      setPost(getPostById(postId));
      setComments(getComments(postId));
    };
    sync();
    const unsubFeed = subscribeFeed(sync);
    const unsubFollow = subscribeFollow(() => {
      sync();
      setGraphTick((n) => n + 1);
    });
    return () => {
      unsubFeed();
      unsubFollow();
    };
  }, [postId]);

  const saved = post ? isPostSaved(post.id) : false;
  const liked = post?.likedByMe ?? false;
  const commentsOpen =
    (post?.settings?.commentsEnabled ?? post?.settings?.comments) !== false;
  const likesVisible = post?.settings?.likesVisible !== false;

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
    if ((post.settings?.commentsEnabled ?? post.settings?.comments) === false) {
      Alert.alert(t("social.notifications"), "Bu gönderide yorumlar kapalı.");
      return;
    }
    if (!canAddComment(post.id)) {
      Alert.alert(t("social.notifications"), t("social.restricted"));
      return;
    }
    addComment(post.id, {
      userId: getCurrentSocialUserId(),
      username: "Ben",
      text: input.trim(),
    });
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

  const isOwner = post.userId === getCurrentSocialUserId();

  if (!isOwner && isBlocked(post.userId)) {
    return (
      <SocialScreenLayout title={t("social.postDetail.title")}>
        <View style={styles.archivedBox}>
          <Text style={[styles.archivedTitle, { color: T.textColor }]}>
            Bu kullanıcıyı engellediniz.
          </Text>
          <Text style={[styles.archivedSub, { color: T.mutedText }]}>
            Gönderi gizlendi. Engeli kaldırmak için profil ayarlarından yönetebilirsiniz.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.archivedBack}>
            <Text style={{ color: T.mutedText, fontSize: 14, fontWeight: "600" }}>Geri</Text>
          </TouchableOpacity>
        </View>
      </SocialScreenLayout>
    );
  }

  if (post.archived) {
    return (
      <SocialScreenLayout title={t("social.postDetail.title")}>
        <View style={styles.archivedBox}>
          <Text style={[styles.archivedTitle, { color: T.textColor }]}>
            Bu paylaşım arşivlendi.
          </Text>
          <Text style={[styles.archivedSub, { color: T.mutedText }]}>
            {isOwner
              ? "Düzenleyerek tekrar yayına alabilir veya silebilirsiniz."
              : "Bu içerik şu an görüntülenemiyor."}
          </Text>
          {isOwner ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("SocialEditPost", { postId: post.id })}
              style={styles.archivedAction}
              hitSlop={8}
            >
              <Text style={{ color: T.accent, fontSize: 15, fontWeight: "700" }}>Düzenle</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.archivedBack}>
            <Text style={{ color: T.mutedText, fontSize: 14, fontWeight: "600" }}>Geri</Text>
          </TouchableOpacity>
        </View>
      </SocialScreenLayout>
    );
  }

  const heartColor = liked ? SOCIAL_LIKE_ACTIVE_COLOR : T.textColor;
  const canEdit = isOwner && !post.event;

  const sendDisabled = !commentsOpen || !input.trim();

  return (
    <SocialScreenLayout title={t("social.postDetail.title")} scroll={false}>
      <View style={styles.screenBody}>
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

        {canEdit ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("SocialEditPost", { postId: post.id })}
            style={{ marginRight: 10 }}
            hitSlop={8}
          >
            <Text style={{ color: T.accent, fontSize: 14, fontWeight: "700" }}>Düzenle</Text>
          </TouchableOpacity>
        ) : null}

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

          {likesVisible ? (
            <Text
              style={{
                marginLeft: 6,
                color: heartColor,
                fontWeight: "900",
              }}
            >
              {t("social.postDetail.like")}
            </Text>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (commentsOpen) inputRef.current?.focus();
            else
              Alert.alert(
                t("social.notifications"),
                "Bu gönderide yorumlar kapalı."
              );
          }}
          style={styles.actionBtn}
        >
          <Ionicons name="chatbubble-outline" size={20} color={T.textColor} />

          <Text style={{ marginLeft: 6, color: T.textColor, fontWeight: "900" }}>
            {t("social.postDetail.comment")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= COMMENTS ================= */}

      <FlatList
        style={styles.commentList}
        data={comments}
        keyExtractor={(i) => i.id}
        contentContainerStyle={
          comments.length === 0
            ? styles.commentListEmpty
            : { paddingTop: 8, paddingBottom: 12 }
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.emptyComments, { color: T.mutedText }]}>
            Henüz yorum yok. İlk yorumu siz yazın.
          </Text>
        }
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

      {/* ================= COMMENT INPUT ================= */}

      {!commentsOpen ? (
        <Text style={[styles.commentsClosedHint, { color: T.mutedText }]}>
          Bu gönderide yorumlar kapalı.
        </Text>
      ) : null}

      <View
        style={[
          styles.commentInputRow,
          {
            borderTopColor: T.border,
            borderBottomColor: T.border,
            opacity: commentsOpen ? 1 : 0.55,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          editable={commentsOpen}
          placeholder={
            commentsOpen
              ? t("social.postDetail.commentPlaceholder")
              : "Yorumlar kapalı"
          }
          placeholderTextColor={T.mutedText}
          style={[
            styles.input,
            {
              color: T.textColor,
              backgroundColor: T.cardBg,
            },
          ]}
        />

        <TouchableOpacity
          onPress={submitComment}
          disabled={sendDisabled}
          hitSlop={8}
        >
          <Ionicons
            name="send"
            size={20}
            color={sendDisabled ? T.mutedText : T.accent}
          />
        </TouchableOpacity>
      </View>
      </View>
    </SocialScreenLayout>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
    minHeight: 0,
  },
  commentList: {
    flex: 1,
    minHeight: 120,
  },
  commentListEmpty: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyComments: {
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 16,
  },
  commentsClosedHint: {
    fontSize: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
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

  archivedBox: {
    padding: 24,
    gap: 12,
  },
  archivedTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  archivedSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  archivedAction: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  archivedBack: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
});