// 🔒 FAZ 12 — Enforcement Feedback Aktivasyonu
// Rol: Feed aksiyonları + sessiz enforcement feedback (UI-only)
// Kurallar:
// - Enforcement kararı üst katmandan gelir
// - useCompany BURADA KULLANILMAZ
// - Alert / Toast / Navigation YOK
// - Disabled → long-press + micro hint

import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { t } from "../../../../shared/i18n/t";
import { useAppTheme } from "../../../../shared/theme/appTheme";
import EnforcementHint from "./EnforcementHint";

type Props = {
  liked: boolean;
  likes: number;
  comments: number;

  onLike: () => void;
  onComment: () => void;
  onShare: () => void;

  /** Post sahibi beğeni sayısını gizleyebilir */
  likeCountHidden?: boolean;

  /** Kaydet (opsiyonel) */
  showSave?: boolean;
  saved?: boolean;
  onSave?: () => void;

  /** Enforcement flags */
  canLike?: boolean;
  canComment?: boolean;
  canShare?: boolean;

  likeHint?: string;
  commentHint?: string;
  shareHint?: string;

  showInlineHint?: boolean;
};

export default function FeedReactionBar({
  liked,
  likes,
  comments,
  onLike,
  onComment,
  onShare,
  likeCountHidden = false,
  showSave = false,
  saved = false,
  onSave,
  canLike = true,
  canComment = true,
  canShare = true,
  likeHint,
  commentHint,
  shareHint,
  showInlineHint = false,
}: Props) {
  const T = useAppTheme();

  const safeLikes = Number.isFinite(likes) ? Math.max(0, likes) : 0;
  const safeComments = Number.isFinite(comments)
    ? Math.max(0, comments)
    : 0;

  /* ------------------------------------------------------------------ */
  /* INLINE MICRO HINT                                                  */
  /* ------------------------------------------------------------------ */

  let inlineHintText: string | null = null;

  if (showInlineHint) {
    if (!canLike && likeHint) inlineHintText = likeHint;
    else if (!canComment && commentHint) inlineHintText = commentHint;
    else if (!canShare && shareHint) inlineHintText = shareHint;
  }

  /* ------------------------------------------------------------------ */
  /* ACTION ITEM RENDER                                                 */
  /* ------------------------------------------------------------------ */

  const renderDisabledHint = (enabled: boolean, hint?: string) => {
    if (enabled) return null;
    if (!hint) return null;
    return <EnforcementHint text={hint} mode="overlay" />;
  };

  return (
    <View
      style={{
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: T.border,
      }}
    >
      {/* ================= ACTION BAR ================= */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {/* LIKE */}

        <Pressable
          onPress={canLike ? onLike : undefined}
          disabled={!canLike}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            opacity: canLike ? 1 : 0.45,
            minWidth: 56,
          }}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={18}
            color={liked && canLike ? T.accent : T.mutedText}
          />

          {!likeCountHidden ? (
            <Text
              style={{
                color: liked && canLike ? T.accent : T.mutedText,
                fontWeight: "800",
              }}
            >
              {safeLikes}
            </Text>
          ) : null}

          {renderDisabledHint(canLike, likeHint)}
        </Pressable>

        {/* COMMENT */}

        <Pressable
          onPress={canComment ? onComment : undefined}
          disabled={!canComment}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            opacity: canComment ? 1 : 0.45,
            minWidth: 56,
          }}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={T.mutedText}
          />

          <Text
            style={{
              color: T.mutedText,
              fontWeight: "800",
            }}
          >
            {safeComments}
          </Text>

          {renderDisabledHint(canComment, commentHint)}
        </Pressable>

        {showSave ? (
          <Pressable
            onPress={onSave}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              minWidth: 56,
            }}
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={saved ? T.accent : T.mutedText}
            />
            <Text
              style={{
                color: saved ? T.accent : T.mutedText,
                fontWeight: "800",
              }}
            >
              {t("corporate.feed.save")}
            </Text>
          </Pressable>
        ) : null}

        {/* SHARE */}

        <Pressable
          onPress={canShare ? onShare : undefined}
          disabled={!canShare}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            opacity: canShare ? 1 : 0.45,
            minWidth: 72,
          }}
        >
          <Ionicons
            name="share-outline"
            size={18}
            color={T.mutedText}
          />

          <Text
            style={{
              color: T.mutedText,
              fontWeight: "800",
            }}
          >
            {t("corporate.feed.share")}
          </Text>

          {renderDisabledHint(canShare, shareHint)}
        </Pressable>
      </View>

      {/* ================= INLINE MICRO HINT ================= */}

      {inlineHintText ? (
        <EnforcementHint text={inlineHintText} mode="inline" />
      ) : null}
    </View>
  );
}