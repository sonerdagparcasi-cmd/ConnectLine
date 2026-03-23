// src/domains/corporate/feed/screens/CorporateFeedScreen.tsx

import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";

import CorporateTopBar from "../../components/CorporateTopBar";
import CorporateFeedItem from "../components/CorporateFeedItem";
import FeedShareSheet, { FeedSharePayload } from "../components/FeedShareSheet";

import { useCompany } from "../../hooks/useCompany";
import { useCorporateFeed } from "../../hooks/useCorporateFeed";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import type { CorporateFeedPost } from "../../types/feed.types";
import { refreshCorporateUnreadSubscribers } from "../../services/corporateNotificationService";
import { syncCorporateViewerFromCompanyRole } from "../../services/corporateViewerIdentity";

type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

export default function CorporateFeedScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();

  const companyId = "c1";

  const { company, isOwner, visibility } = useCompany(companyId);

  useEffect(() => {
    syncCorporateViewerFromCompanyRole(isOwner, companyId);
    refreshCorporateUnreadSubscribers();
  }, [isOwner, companyId]);

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

  const listRef = useRef<FlatList<CorporateFeedPost>>(null);

  const [primaryVisiblePostId, setPrimaryVisiblePostId] = useState<
    string | null
  >(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems.find(
        (v) => v.isViewable && v.item && typeof v.item === "object"
      );
      const id =
        first && "id" in (first.item as object)
          ? String((first.item as CorporateFeedPost).id)
          : null;
      setPrimaryVisiblePostId(id);
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 55,
  }).current;

  const isEmptyFeed = !loading && (!posts || posts.length === 0);

  const mapToUiPost = useCallback(
    (p: CorporateFeedPost) => {
      const archived = !!archivedPostIds[p.id];
      return {
        ...p,
        likes: p.likeCount,
        comments: p.commentCount,
        liked: p.likedByMe,
        archived,
      };
    },
    [archivedPostIds]
  );

  const openPostDetail = useCallback(
    (post: CorporateFeedPost) => {
      navigation.navigate("CorporatePostDetail", {
        postId: post.id,
        companyName,
      });
    },
    [navigation, companyName]
  );

  const openMediaPreview = useCallback(
    (post: CorporateFeedPost, index: number) => {
      if (!post.media?.length) return;

      navigation.navigate("CorporateMediaPreview", {
        media: post.media,
        overlays: post.overlays,
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

  const archivePost = useCallback((postId: string) => {
    setArchivedPostIds((prev) => {
      if (prev[postId]) return prev;
      return { ...prev, [postId]: true };
    });
  }, []);

  const openCreate = useCallback(() => {
    navigation.navigate("CorporateCreateEditPost", { companyId });
  }, [navigation, companyId]);

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
            {t("corporate.feed.visitorBlocked")}
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
            {t("corporate.feed.empty")}
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
            contentContainerStyle={{ paddingBottom: 88 }}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            renderItem={({ item }) => {
              const uiPost = mapToUiPost(item);

              return (
                <CorporateFeedItem
                  post={uiPost}
                  companyId={companyId}
                  companyName={companyName}
                  isMediaVisible={primaryVisiblePostId === item.id}
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

      {isOwner && !isFeedBlockedForVisitor ? (
        <TouchableOpacity
          onPress={openCreate}
          activeOpacity={0.9}
          style={{
            position: "absolute",
            right: 20,
            bottom: 28,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: T.textColor,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text style={{ color: T.backgroundColor, fontSize: 28, fontWeight: "300" }}>
            +
          </Text>
        </TouchableOpacity>
      ) : null}

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
