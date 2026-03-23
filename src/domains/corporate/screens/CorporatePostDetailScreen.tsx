// src/domains/corporate/screens/CorporatePostDetailScreen.tsx
// 🔒 Post detay — corporateFeedStateService tek kaynak

import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppGradientHeader from "../../../shared/components/AppGradientHeader";
import { t } from "../../../shared/i18n/t";
import { useAppTheme } from "../../../shared/theme/appTheme";

import CommentDrawer from "../feed/components/CommentDrawer";
import CorporateFeedMedia from "../feed/components/CorporateFeedMedia";
import FeedReactionBar from "../feed/components/FeedReactionBar";
import FeedShareSheet, {
  FeedSharePayload,
} from "../feed/components/FeedShareSheet";
import { useCompany } from "../hooks/useCompany";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CorporateStackParamList } from "../navigation/CorporateNavigator";
import {
  addComment,
  deleteCorporateComment,
  getCorporateComments,
  getCorporatePostById,
  isCorporatePostSaved,
  subscribeCorporateFeed,
  toggleLike,
  toggleSave,
} from "../services/corporateFeedStateService";
import { refreshCorporateUnreadSubscribers } from "../services/corporateNotificationService";
import {
  getCorporateActorUserId,
  syncCorporateViewerFromCompanyRole,
} from "../services/corporateViewerIdentity";
import { getCorporateCaption } from "../utils/corporatePostNormalize";

type RouteProps = RouteProp<
  CorporateStackParamList,
  "CorporatePostDetail"
>;

type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

export default function CorporatePostDetailScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();

  const { postId, companyName } = route.params;

  const [feedEpoch, setFeedEpoch] = useState(0);

  const livePost = getCorporatePostById(postId);
  const companyId = livePost?.companyId ?? "c1";
  const { isOwner } = useCompany(companyId);

  useEffect(() => {
    syncCorporateViewerFromCompanyRole(isOwner, companyId);
    refreshCorporateUnreadSubscribers();
  }, [isOwner, companyId]);

  useEffect(() => {
    const unsub = subscribeCorporateFeed(() => setFeedEpoch((n) => n + 1));
    return unsub;
  }, [postId]);

  const comments = getCorporateComments(postId);
  const saved = isCorporatePostSaved(postId);

  const [shareOpen, setShareOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  useEffect(() => {
    if (!getCorporatePostById(postId)) {
      navigation.goBack();
    }
  }, [postId, navigation, feedEpoch]);

  const drawerComments = useMemo(() => {
    const actor = getCorporateActorUserId();
    return comments.map((c) => ({
      id: c.id,
      author:
        c.authorUserId === actor
          ? t("corporate.comments.you")
          : t("corporate.comments.authorNetwork"),
      body: c.text,
      createdAt: new Date(c.createdAt).toISOString(),
      canDelete:
        c.authorUserId === actor ||
        (isOwner && livePost?.companyId === companyId),
    }));
  }, [comments, isOwner, companyId, livePost?.companyId]);

  const sharePayload: FeedSharePayload = {
    postId,
    companyName,
  };

  function openMedia(index: number) {
    if (!livePost?.media?.length) return;
    navigation.navigate("CorporateMediaPreview", {
      media: livePost.media,
      overlays: livePost.overlays,
      initialIndex: index,
    });
  }

  function handleAddComment(text: string) {
    if (!livePost) return;
    addComment(livePost.id, text);
  }

  function handleDeleteComment(commentId: string) {
    deleteCorporateComment(postId, commentId);
  }

  function onPressComment() {
    if (!livePost) return;
    if (livePost.commentsDisabled) {
      Alert.alert(
        t("corporate.comments.disabledTitle"),
        t("corporate.comments.disabledBody")
      );
      return;
    }
    setCommentOpen(true);
  }

  if (!livePost) {
    return (
      <View style={[styles.root, { backgroundColor: T.backgroundColor }]} />
    );
  }

  const caption = getCorporateCaption(livePost);

  return (
    <View style={[styles.root, { backgroundColor: T.backgroundColor }]}>
      <AppGradientHeader
        title={t("corporate.postDetail.title")}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
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
                {new Date(livePost.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {livePost.media && livePost.media.length > 0 && (
            <View style={styles.mediaBlock}>
              <CorporateFeedMedia
                media={livePost.media}
                overlays={livePost.overlays}
                onPress={openMedia}
                isVisible
                onDoubleTapLike={() => toggleLike(livePost.id)}
              />
            </View>
          )}

          {!!caption && (
            <Text style={[styles.text, { color: T.textColor }]}>
              {caption}
            </Text>
          )}

          {!livePost.likeCountHidden && livePost.likeCount > 0 ? (
            <Text style={[styles.meta, { color: T.mutedText }]}>
              {livePost.likeCount} {t("corporate.postDetail.likes")}
            </Text>
          ) : null}

          <View style={{ paddingHorizontal: 16 }}>
            <FeedReactionBar
              liked={!!livePost.likedByMe}
              likes={livePost.likeCount}
              comments={livePost.commentCount}
              onLike={() => toggleLike(livePost.id)}
              onComment={onPressComment}
              onShare={() => setShareOpen(true)}
              likeCountHidden={!!livePost.likeCountHidden}
              showSave
              saved={saved}
              onSave={() => toggleSave(livePost.id)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <FeedShareSheet
        visible={shareOpen}
        payload={sharePayload}
        onClose={() => setShareOpen(false)}
        onCopy={() => setShareOpen(false)}
        onSendInbox={() => setShareOpen(false)}
        onExternal={() => setShareOpen(false)}
      />

      <CommentDrawer
        visible={commentOpen}
        comments={drawerComments}
        onClose={() => setCommentOpen(false)}
        onAdd={handleAddComment}
        inputDisabled={!!livePost.commentsDisabled}
        inputDisabledMessage={t("corporate.comments.disabledBody")}
        onDeleteComment={handleDeleteComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
