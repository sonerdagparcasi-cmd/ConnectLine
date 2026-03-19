// src/domains/corporate/screens/CorporatePostDetailScreen.tsx
// 🔒 POST DETAIL + NAV (STABİL)

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { useAppTheme } from "../../../shared/theme/appTheme";

/* UI */
import CommentDrawer from "../feed/components/CommentDrawer";
import CorporateFeedMedia from "../feed/components/CorporateFeedMedia";
import FeedReactionBar from "../feed/components/FeedReactionBar";
import FeedShareSheet, {
  FeedSharePayload,
} from "../feed/components/FeedShareSheet";

/* Types */
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CorporateFeedComment } from "../feed/types/feed.types";
import type { CorporateStackParamList } from "../navigation/CorporateNavigator";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

type RouteProps = RouteProp<
  CorporateStackParamList,
  "CorporatePostDetail"
>;

type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

/* ------------------------------------------------------------------ */
/* SCREEN                                                             */
/* ------------------------------------------------------------------ */

export default function CorporatePostDetailScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const { post, companyName } = route.params;

  const [shareOpen, setShareOpen] = React.useState(false);
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [comments, setComments] = React.useState<CorporateFeedComment[]>([]);

  /* ------------------------------------------------------------------ */
  /* MEDIA NAVIGATION (KİLİTLİ)                                         */
  /* ------------------------------------------------------------------ */

  function openMedia(index: number) {
    if (!post.media || post.media.length === 0) return;

    navigation.navigate("CorporateMediaPreview", {
      media: post.media,
      initialIndex: index,
    });
  }

  /* ------------------------------------------------------------------ */
  /* COMMENTS (UI ONLY)                                                 */
  /* ------------------------------------------------------------------ */

  function handleAddComment(text: string) {
    const newComment: CorporateFeedComment = {
      id: `${Date.now()}`,
      postId: post.id,
      authorId: "me",
      authorName: "Sen",
      content: text,
      createdAt: new Date().toISOString(),
      likeCount: 0,
    };

    setComments((prev) => [newComment, ...prev]);
  }

  const sharePayload: FeedSharePayload = {
    postId: post.id,
    companyName,
  };

  const drawerComments = comments.map((c) => ({
    id: c.id,
    author: c.authorName,
    body: c.content,
    createdAt: c.createdAt,
  }));

  /* ------------------------------------------------------------------ */
  /* RENDER                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      {/* ================= HEADER ================= */}
      <AppGradientHeader title="Paylaşım" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* ================= AUTHOR ================= */}
          <View style={styles.authorRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: T.cardBg, borderColor: T.border },
              ]}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={T.textColor}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[styles.companyName, { color: T.textColor }]}
                numberOfLines={1}
              >
                {companyName}
              </Text>

              <Text style={[styles.time, { color: T.mutedText }]}>
                {new Date(post.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* ================= MEDIA ================= */}
          {post.media && post.media.length > 0 && (
            <View style={styles.mediaBlock}>
              <CorporateFeedMedia
                media={post.media}
                onPress={openMedia}
              />
            </View>
          )}

          {/* ================= TEXT ================= */}
          {!!post.content && (
            <Text style={[styles.text, { color: T.textColor }]}>
              {post.content}
            </Text>
          )}

          {/* ================= META ================= */}
          {post.likeCount > 0 && (
            <Text style={[styles.meta, { color: T.mutedText }]}>
              {post.likeCount} beğeni
            </Text>
          )}

          {/* ================= ACTIONS ================= */}
          <FeedReactionBar
            liked={!!post.isLiked}
            likes={post.likeCount}
            comments={comments.length}
            onLike={() => {}}
            onComment={() => setCommentOpen(true)}
            onShare={() => setShareOpen(true)}
          />
        </View>
      </KeyboardAvoidingView>

      {/* ================= SHARE ================= */}
      <FeedShareSheet
        visible={shareOpen}
        payload={sharePayload}
        onClose={() => setShareOpen(false)}
        onCopy={() => setShareOpen(false)}
        onSendInbox={() => setShareOpen(false)}
        onExternal={() => setShareOpen(false)}
      />

      {/* ================= COMMENTS ================= */}
      <CommentDrawer
        visible={commentOpen}
        comments={drawerComments}
        onClose={() => setCommentOpen(false)}
        onAdd={handleAddComment}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  container: {
    paddingTop: 14,
    paddingBottom: 24,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  companyName: {
    fontSize: 15,
    fontWeight: "900",
  },

  time: {
    fontSize: 12,
    marginTop: 2,
  },

  mediaBlock: {
    marginTop: 12,
  },

  text: {
    marginTop: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 21,
  },

  meta: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
  },
});