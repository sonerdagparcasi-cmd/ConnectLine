// src/domains/corporate/feed/components/CorporateFeedItem.tsx
// 🔒 FAZ 5 + FAZ 10D + FAZ 12 — Feed Item Action Enforcement + Archive

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import { useCompany } from "../../hooks/useCompany";
import type { CorporateStackParamList } from "../../navigation/CorporateNavigator";
import type { CorporateFeedPost } from "../../types/feed.types";
import CorporateFeedMedia from "./CorporateFeedMedia";
import FeedReactionBar from "./FeedReactionBar";

type NavProp = NativeStackNavigationProp<CorporateStackParamList>;

type UiCounters = {
  likes?: number;
  comments?: number;
};

type Props = {
  post: CorporateFeedPost &
    UiCounters & {
      type?: "post" | "job";
      job?: {
        jobId: string;
        title: string;
        location: string;
      };
      text?: string;
      liked?: boolean;
      archived?: boolean;
    };

  companyId: string;
  companyName: string;

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

  /* ------------------------------------------------------------------ */
  /* ARCHIVE FILTER                                                     */
  /* ------------------------------------------------------------------ */

  if (post.archived && !isOwner) return null;

  /* ------------------------------------------------------------------ */
  /* TYPE SAFE                                                          */
  /* ------------------------------------------------------------------ */

  const job = post.type === "job" && post.job ? post.job : null;
  const isJobPost = !!job;

  /* ------------------------------------------------------------------ */
  /* ACTION ENFORCEMENT                                                 */
  /* ------------------------------------------------------------------ */

  const canLike = isOwner || visibility === "public";
  const canComment = isOwner || visibility === "public";
  const canShare = isOwner || visibility === "public";

  const likeHint = "Bu paylaşım herkese açık değil.";
  const commentHint = "Yorum yapmak için profil herkese açık olmalı.";
  const shareHint = "Bu paylaşım paylaşıma kapalı.";

  /* ------------------------------------------------------------------ */
  /* SAFE UI VALUES                                                     */
  /* ------------------------------------------------------------------ */

  const safeLikes =
    Number.isFinite(post.likes) && (post.likes as number) > 0
      ? (post.likes as number)
      : 0;

  const safeComments =
    Number.isFinite(post.comments) && (post.comments as number) > 0
      ? (post.comments as number)
      : 0;

  const createdAt = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  const hasMedia = !!post.media && post.media.length > 0;

  const text = typeof post.text === "string" ? post.text : "";

  /* ------------------------------------------------------------------ */

  const handleArchive = () => {
    if (!isOwner) return;
    onArchive?.(post.id);
  };

  return (
    <View style={[styles.container, { borderBottomColor: T.border }]}>
      {/* HEADER */}

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
          <Text
            style={[styles.companyName, { color: T.textColor }]}
            numberOfLines={1}
          >
            {companyName}
          </Text>

          <Text style={[styles.time, { color: T.mutedText }]}>
            {createdAt}
          </Text>
        </View>

        {isOwner ? (
          <TouchableOpacity onPress={handleArchive}>
            <Ionicons
              name="archive-outline"
              size={18}
              color={T.mutedText}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={T.mutedText}
          />
        )}
      </TouchableOpacity>

      {/* JOB CARD */}

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

      {/* MEDIA */}

      {!isJobPost && hasMedia ? (
        <View style={styles.mediaBlock}>
          <CorporateFeedMedia
            media={post.media}
            onPress={(index) => onPressMedia(index)}
          />
        </View>
      ) : null}

      {/* ACTION BAR */}

      <View style={{ paddingHorizontal: 16 }}>
        <FeedReactionBar
          liked={!!post.liked}
          likes={safeLikes}
          comments={safeComments}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          canLike={canLike}
          canComment={canComment}
          canShare={canShare}
          likeHint={likeHint}
          commentHint={commentHint}
          shareHint={shareHint}
          showInlineHint={!isOwner}
        />
      </View>

      {text ? (
        <Text style={[styles.text, { color: T.textColor }]}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomWidth: 1,
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
});