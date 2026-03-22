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
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import {
  addComment,
  getComments,
  subscribeComments,
} from "../services/socialCommentService";
import {
  blockUser,
  getCurrentSocialUserId,
  isUserBlocked,
  subscribeFollow,
} from "../services/socialFollowService";
import { REPORT_REASONS, reportPost } from "../services/socialReportService";

import type { SocialComment, SocialPost } from "../types/social.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type Route = RouteProp<SocialStackParamList, "SocialPostDetail">;
type Nav = NativeStackNavigationProp<SocialStackParamList>;

/** Yorum çubuğu yüksekliği (padding + tek satır input) — liste alt boşluğu için */
const COMMENT_INPUT_BAR_HEIGHT = 56;

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function SocialPostDetailScreen() {
  const T = useAppTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  const { postId } = route.params;

  const [post, setPost] = useState<SocialPost | undefined>(() =>
    getPostById(postId)
  );
  const [comments, setComments] = useState<SocialComment[]>(() =>
    getComments(postId)
  );
  const [commentText, setCommentText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<SocialComment>>(null);
  /** Engelle / takip grafik güncellemelerinde yeniden çizim */
  const [, setGraphTick] = useState(0);

  useEffect(() => {
    const syncPost = () => {
      setPost(getPostById(postId));
    };
    syncPost();
    const unsubFeed = subscribeFeed(syncPost);
    const unsubFollow = subscribeFollow(() => {
      syncPost();
      setGraphTick((n) => n + 1);
    });
    return () => {
      unsubFeed();
      unsubFollow();
    };
  }, [postId]);

  useEffect(() => {
    const unsub = subscribeComments(() => {
      setComments(getComments(postId));
    });
    return unsub;
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

  function openPostMenu() {
    Alert.alert(
      t("social.postDetail.title"),
      `${t("social.feed.edit")} / ${t("social.feed.hide")} (UI-only)`
    );
  }

  function openReportPost() {
    if (!post) return;
    Alert.alert(
      "Bildir",
      undefined,
      [
        ...REPORT_REASONS.map((r) => ({
          text: r.labelTr,
          onPress: () => {
            reportPost(post.id, r.value);
            Alert.alert("", "Bildirimin alındı");
          },
        })),
        { text: "İptal", style: "cancel" },
      ]
    );
  }

  function handleBlockAuthor() {
    if (!post) return;
    blockUser(post.userId);
    Alert.alert("", "Kullanıcı engellendi");
    navigation.goBack();
  }

  function submitComment() {
    if (!commentText.trim() || !post) return;
    if ((post.settings?.commentsEnabled ?? post.settings?.comments) === false) {
      Alert.alert(t("social.notifications"), "Bu gönderide yorumlar kapalı.");
      return;
    }
    if (!canAddComment(post.id)) {
      Alert.alert(t("social.notifications"), t("social.restricted"));
      return;
    }
    addComment(post.id, commentText);
    setCommentText("");
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
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

  if (!isOwner && isUserBlocked(post.userId)) {
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

  const likeColor = T.isDark ? "#1834ae" : "#00bfff";
  const heartColor = liked ? likeColor : T.textColor;
  const canEdit = isOwner && !post.event;

  const sendDisabled = !commentsOpen || !commentText.trim();

  const listBottomPad =
    (commentsOpen ? COMMENT_INPUT_BAR_HEIGHT + 10 + insets.bottom : 0) + 100;

  return (
    <SocialScreenLayout title={t("social.postDetail.title")} scroll={false}>
      <KeyboardAvoidingView
        style={styles.kavRoot}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
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

      {!isOwner ? (
        <View style={[styles.modRow, { borderBottomColor: T.border }]}>
          <TouchableOpacity onPress={openReportPost} hitSlop={8}>
            <Text style={[styles.modLink, { color: T.mutedText }]}>Bildir</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBlockAuthor} hitSlop={8}>
            <Text style={[styles.modLink, { color: T.mutedText }]}>Engelle</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ================= COMMENTS ================= */}

      <FlatList
        ref={listRef}
        style={styles.commentList}
        data={comments}
        keyExtractor={(i) => i.id}
        contentContainerStyle={
          comments.length === 0
            ? [styles.commentListEmpty, { paddingBottom: listBottomPad }]
            : { paddingTop: 8, paddingBottom: listBottomPad }
        }
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.emptyComments, { color: T.mutedText }]}>
            Henüz yorum yok. İlk yorumu siz yazın.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.commentRow,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: T.border,
              },
            ]}
          >
            <Text style={{ color: T.textColor, fontWeight: "600" }}>
              {item.username}
            </Text>
            <Text style={{ color: T.textColor, marginTop: 2 }}>{item.text}</Text>
          </View>
        )}
      />

      {/* ================= COMMENT INPUT ================= */}

      {!commentsOpen ? (
        <Text style={[styles.commentsClosedHint, { color: T.mutedText, opacity: 0.6 }]}>
          Yorumlar kapalı
        </Text>
      ) : null}

      {commentsOpen ? (
        <View
          style={[
            styles.commentInputBar,
            {
              backgroundColor: T.cardBg,
              borderTopColor: T.border,
              paddingBottom: 10 + insets.bottom,
            },
          ]}
        >
          <View style={styles.commentInputRowInner}>
            <TextInput
              ref={inputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Yorum yaz..."
              placeholderTextColor={T.mutedText}
              style={[
                styles.input,
                {
                  color: T.textColor,
                  backgroundColor: T.cardBg,
                  padding: 10,
                },
              ]}
            />

            <TouchableOpacity
              onPress={submitComment}
              disabled={sendDisabled}
              hitSlop={8}
            >
              <Text
                style={{
                  color: sendDisabled ? T.mutedText : T.accent,
                  fontWeight: "700",
                }}
              >
                Gönder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
        </View>
      </KeyboardAvoidingView>
    </SocialScreenLayout>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  kavRoot: {
    flex: 1,
    minHeight: 0,
  },
  screenBody: {
    flex: 1,
    minHeight: 0,
    position: "relative",
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

  modRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  modLink: {
    fontSize: 13,
    fontWeight: "600",
  },

  commentInputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentInputRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
  },

  commentRow: {
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
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