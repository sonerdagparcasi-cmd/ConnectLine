// src/domains/corporate/feed/components/CorporateFeedItem.tsx
// 🔒 Kurumsal feed satırı — medya, overlay, sahip menüsü, çift dokunuş beğeni

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { t } from "../../../../shared/i18n/t";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCompany } from "../../hooks/useCompany";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import {
  deletePost,
  isCorporatePostSaved,
  subscribeCorporateFeed,
  toggleComments,
  toggleLike,
  toggleLikeVisibility,
  toggleSave,
} from "../../services/corporateFeedStateService";
import type { CorporatePost } from "../../types/feed.types";
import { getCorporateCaption } from "../../utils/corporatePostNormalize";
import CorporateFeedMedia from "./CorporateFeedMedia";
import FeedReactionBar from "./FeedReactionBar";

type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

type UiCounters = {
  likes?: number;
  comments?: number;
};

type Props = {
  post: CorporatePost &
    UiCounters & {
      type?: "post" | "job";
      job?: {
        jobId: string;
        title: string;
        location: string;
      };
      liked?: boolean;
      archived?: boolean;
    };

  companyId: string;
  companyName: string;
  isMediaVisible?: boolean;

  onPressMedia: (index: number) => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onArchive?: (postId: string) => void;
  onOpenJob?: (jobId: string) => void;
};

export default function CorporateFeedItem({
  post,
  companyId,
  companyName,
  isMediaVisible = false,
  onPressMedia,
  onLike,
  onComment,
  onShare,
  onArchive,
  onOpenJob,
}: Props) {
  const T = useAppTheme();
  const navigation = useNavigation<NavProp>();
  const { isOwner, visibility } = useCompany(companyId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(() => isCorporatePostSaved(post.id));

  useEffect(() => {
    setSaved(isCorporatePostSaved(post.id));
    const unsub = subscribeCorporateFeed(() => {
      setSaved(isCorporatePostSaved(post.id));
    });
    return unsub;
  }, [post.id]);

  if (post.archived && !isOwner) return null;

  const job = post.type === "job" && post.job ? post.job : null;
  const isJobPost = !!job;

  const canLike = isOwner || visibility === "public";
  const canComment = isOwner || visibility === "public";
  const canShare = isOwner || visibility === "public";

  const likeHint = t("corporate.feed.hint.likeRestricted");
  const commentHint = t("corporate.feed.hint.commentRestricted");
  const shareHint = t("corporate.feed.hint.shareRestricted");

  const safeLikes =
    Number.isFinite(post.likes) && (post.likes as number) >= 0
      ? (post.likes as number)
      : post.likeCount;

  const safeComments =
    Number.isFinite(post.comments) && (post.comments as number) >= 0
      ? (post.comments as number)
      : post.commentCount;

  const likedUi = post.liked ?? post.likedByMe;

  const createdAt = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  const hasMedia = !!post.media && post.media.length > 0;
  const caption = getCorporateCaption(post);

  const handleArchive = () => {
    if (!isOwner) return;
    onArchive?.(post.id);
  };

  const onToggleSave = () => {
    toggleSave(post.id);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    deletePost(post.id);
  };

  const handleToggleComments = () => {
    toggleComments(post.id);
    setMenuOpen(false);
  };

  const handleToggleLikeVis = () => {
    toggleLikeVisibility(post.id);
    setMenuOpen(false);
  };

  const openEdit = () => {
    setMenuOpen(false);
    navigation.navigate("CorporateCreateEditPost", {
      companyId,
      postId: post.id,
    });
  };

  return (
    <View style={[styles.container, { borderBottomColor: T.border }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("CorporateProfile", { companyId })
        }
        style={styles.header}
      >
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={[styles.companyName, { color: T.textColor }]}
              numberOfLines={1}
            >
              {companyName}
            </Text>
            {post.isAnnouncement ? (
              <View style={[styles.pill, { borderColor: T.border }]}>
                <Text style={[styles.pillText, { color: T.mutedText }]}>
                  {t("corporate.post.badge.announcement")}
                </Text>
              </View>
            ) : null}
            {post.isHiring ? (
              <View style={[styles.pill, { borderColor: T.border }]}>
                <Text style={[styles.pillText, { color: T.mutedText }]}>
                  {t("corporate.post.badge.hiring")}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={[styles.time, { color: T.mutedText }]}>
            {createdAt}
          </Text>
        </View>

        {isOwner ? (
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity onPress={() => setMenuOpen(true)} hitSlop={10}>
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={T.mutedText}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleArchive}>
              <Ionicons
                name="archive-outline"
                size={18}
                color={T.mutedText}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={T.mutedText}
          />
        )}
      </TouchableOpacity>

      {isJobPost && job ? (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => onOpenJob?.(job.jobId)}
          style={[
            styles.jobCard,
            { backgroundColor: T.cardBg, borderColor: T.border },
          ]}
        >
          <View style={styles.jobRow}>
            <Ionicons name="briefcase" size={20} color={T.accent} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: T.textColor,
                  fontWeight: "900",
                  fontSize: 15,
                }}
                numberOfLines={1}
              >
                {job.title}
              </Text>
              <Text
                style={{
                  color: T.mutedText,
                  marginTop: 2,
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {companyName} • {job.location}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}

      {!isJobPost && hasMedia ? (
        <View style={styles.mediaBlock}>
          <CorporateFeedMedia
            media={post.media}
            overlays={post.overlays}
            onPress={onPressMedia}
            isVisible={isMediaVisible}
            onDoubleTapLike={canLike ? () => toggleLike(post.id) : undefined}
          />
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 16 }}>
        <FeedReactionBar
          liked={!!likedUi}
          likes={safeLikes}
          comments={safeComments}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          likeCountHidden={!!post.likeCountHidden}
          showSave
          saved={saved}
          onSave={onToggleSave}
          canLike={canLike}
          canComment={canComment}
          canShare={canShare}
          likeHint={likeHint}
          commentHint={commentHint}
          shareHint={shareHint}
          showInlineHint={!isOwner}
        />
      </View>

      {caption ? (
        <Text style={[styles.text, { color: T.textColor }]}>{caption}</Text>
      ) : null}

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <View
            style={[styles.menuCard, { backgroundColor: T.cardBg, borderColor: T.border }]}
          >
            <TouchableOpacity style={styles.menuRow} onPress={openEdit}>
              <Ionicons name="create-outline" size={20} color={T.textColor} />
              <Text style={[styles.menuLabel, { color: T.textColor }]}>
                {t("corporate.post.menu.edit")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={T.accent} />
              <Text style={[styles.menuLabel, { color: T.accent }]}>
                {t("corporate.post.menu.delete")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={handleToggleComments}>
              <Ionicons name="chatbubbles-outline" size={20} color={T.textColor} />
              <Text style={[styles.menuLabel, { color: T.textColor }]}>
                {post.commentsDisabled
                  ? t("corporate.post.menu.commentsOn")
                  : t("corporate.post.menu.commentsOff")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={handleToggleLikeVis}>
              <Ionicons name="eye-outline" size={20} color={T.textColor} />
              <Text style={[styles.menuLabel, { color: T.textColor }]}>
                {post.likeCountHidden
                  ? t("corporate.post.menu.showLikes")
                  : t("corporate.post.menu.hideLikes")}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
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
    flexShrink: 1,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  jobCard: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  jobRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  mediaBlock: {
    marginTop: 12,
  },
  text: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 21,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    padding: 20,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
