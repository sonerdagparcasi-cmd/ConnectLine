// src/domains/corporate/feed/screens/CorporateFeedScreen.tsx
// 🔒 ADIM 5–9 + FAZ 8B + FAZ 10C + FAZ 12 — FEED + ARCHIVE ACTIVE

import { useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";

/* UI */
import CorporateTopBar from "../../components/CorporateTopBar";
import CorporateFeedItem from "../components/CorporateFeedItem";
import FeedShareSheet, { FeedSharePayload } from "../components/FeedShareSheet";

/* Hooks */
import { useCompany } from "../../hooks/useCompany";
import { useCorporateFeed } from "../../hooks/useCorporateFeed";

/* Types */
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  CorporatePostDetailPayload,
  CorporateStackParamList,
} from "../../navigation/CorporateNavigator";
import type { CorporateFeedPost } from "../../types/feed.types";

/* ------------------------------------------------------------------ */

type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

export default function CorporateFeedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();

  const companyId = "c1";

  const { company, isOwner, visibility } = useCompany(companyId);

  const companyName = useMemo(() => {
    const name = company?.name;
    return typeof name === "string" && name.trim().length > 0
      ? name.trim()
      : "Corporate";
  }, [company?.name]);

  const isFeedBlockedForVisitor =
    !isOwner && (visibility === "limited" || visibility === "private");

  const { posts, loading, toggleLike } = useCorporateFeed(companyId);

  const [sharePayload, setSharePayload] =
    useState<FeedSharePayload | null>(null);

  const [archivedPostIds, setArchivedPostIds] = useState<
    Record<string, true>
  >({});

  const listRef = useRef<FlatList<any>>(null);

  const isEmptyFeed = !loading && (!posts || posts.length === 0);

  /* ------------------------------------------------------------------ */
  /* UI COUNTER MAPPER                                                  */
  /* ------------------------------------------------------------------ */

  const mapToUiPost = useCallback(
    (p: CorporateFeedPost) => {
      const anyP: any = p as any;

      const likesRaw =
        anyP.likes ?? anyP.likeCount ?? anyP.like_count ?? 0;

      const commentsRaw =
        anyP.comments ??
        anyP.commentCount ??
        anyP.comment_count ??
        0;

      const likedRaw =
        anyP.liked ?? anyP.isLiked ?? anyP.is_liked ?? false;

      const archived = !!archivedPostIds[p.id];

      return {
        ...p,
        likes: Number.isFinite(likesRaw) ? likesRaw : 0,
        comments: Number.isFinite(commentsRaw) ? commentsRaw : 0,
        liked: !!likedRaw,
        archived,
      };
    },
    [archivedPostIds]
  );

  /* ------------------------------------------------------------------ */
  /* DTO BUILDER                                                        */
  /* ------------------------------------------------------------------ */

  const buildPostDetailPayload = useCallback(
    (post: CorporateFeedPost): CorporatePostDetailPayload => {
      const anyP: any = post as any;

      return {
        id: post.id,
        content: anyP.text ?? anyP.content ?? "",
        createdAt: post.createdAt,
        media: Array.isArray(post.media) ? post.media : [],
        likeCount:
          Number.isFinite(anyP.likeCount) ? anyP.likeCount : 0,
        isLiked: !!(anyP.liked ?? anyP.isLiked),
      };
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /* NAVIGATION                                                         */
  /* ------------------------------------------------------------------ */

  const openPostDetail = useCallback(
    (post: CorporateFeedPost) => {
      navigation.navigate("CorporatePostDetail", {
        post: buildPostDetailPayload(post),
        companyName,
      });
    },
    [navigation, companyName, buildPostDetailPayload]
  );

  const openMediaPreview = useCallback(
    (post: CorporateFeedPost, index: number) => {
      if (!post.media?.length) return;

      navigation.navigate("CorporateMediaPreview", {
        media: post.media,
        initialIndex: index,
      });
    },
    [navigation]
  );

  const openShare = useCallback(
    (post: CorporateFeedPost) => {
      if (!isOwner && visibility !== "public") return;

      setSharePayload({
        postId: post.id,
        companyName,
      });
    },
    [companyName, isOwner, visibility]
  );

  const canShare =
    !!sharePayload && (isOwner || visibility === "public");

  /* ------------------------------------------------------------------ */
  /* ARCHIVE                                                            */
  /* ------------------------------------------------------------------ */

  const archivePost = useCallback((postId: string) => {
    setArchivedPostIds((prev) => {
      if (prev[postId]) return prev;
      return { ...prev, [postId]: true };
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <View style={{ flex: 1, backgroundColor: T.backgroundColor }}>
      <CorporateTopBar title={t("corporate.feed.title")} />

      {isFeedBlockedForVisitor ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              color: T.mutedText,
              fontSize: 13,
              fontWeight: "700",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            Bu kurum paylaşımlarını yalnızca sınırlı kişilerle paylaşıyor.
          </Text>
        </View>
      ) : isEmptyFeed ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              color: T.mutedText,
              fontSize: 13,
              fontWeight: "700",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            Bu kurum henüz paylaşım yapmamış.
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={72}
        >
          <FlatList
            ref={listRef}
            data={posts}
            refreshing={loading}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 28 }}
            renderItem={({ item }) => {
              const uiPost = mapToUiPost(item);

              return (
                <CorporateFeedItem
                  post={uiPost}
                  companyId={companyId}
                  companyName={companyName}
                  onPressMedia={(index) =>
                    openMediaPreview(item, index)
                  }
                  onLike={() => toggleLike(item.id)}
                  onComment={() => openPostDetail(item)}
                  onShare={() => openShare(item)}
                  onArchive={() => archivePost(item.id)}
                  onOpenJob={undefined}
                />
              );
            }}
          />
        </KeyboardAvoidingView>
      )}

      <FeedShareSheet
        visible={canShare}
        payload={sharePayload ?? { postId: "", companyName }}
        onClose={() => setSharePayload(null)}
        onCopy={() => setSharePayload(null)}
        onSendInbox={() => setSharePayload(null)}
        onExternal={() => setSharePayload(null)}
      />
    </View>
  );
}