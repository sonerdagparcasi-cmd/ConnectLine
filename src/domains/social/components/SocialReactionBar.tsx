// src/domains/social/components/SocialReactionBar.tsx
// 🔒 SOCIAL REACTION BAR – LIKE + COMMENT + SHARE + SAVE (THEME AWARE)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";

type Props = {
  liked: boolean;
  likeCount: number;
  commentCount: number;

  saved?: boolean;

  /** false: beğeni sayısı gösterilmez (ikon kalır) */
  showLikeCount?: boolean;
  /** false: yorum satırı pasif */
  commentsEnabled?: boolean;

  onToggleLike: () => void;
  onPressComments: () => void;
  onPressShare?: () => void;
  onToggleSave?: () => void;
};

export default function SocialReactionBar({
  liked,
  likeCount,
  commentCount,
  saved,
  showLikeCount = true,
  commentsEnabled = true,
  onToggleLike,
  onPressComments,
  onPressShare,
  onToggleSave,
}: Props) {
  const T = useAppTheme();
  const likeColor = T.isDark ? "#1834ae" : "#00bfff";
  const likeIconAndCountColor = liked ? likeColor : T.textColor;

  return (
    <View style={styles.row}>
      {/* LIKE */}

      <TouchableOpacity
        onPress={onToggleLike}
        activeOpacity={0.85}
        style={styles.btn}
      >
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={20}
          color={likeIconAndCountColor}
        />

        {showLikeCount ? (
          <Text
            style={[
              styles.txt,
              { color: likeIconAndCountColor },
            ]}
          >
            {likeCount}
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* COMMENT */}

      {commentsEnabled ? (
        <TouchableOpacity
          onPress={onPressComments}
          activeOpacity={0.85}
          style={styles.btn}
        >
          <Ionicons
            name="chatbubble-outline"
            size={19}
            color={T.textColor}
          />

          <Text style={[styles.txt, { color: T.textColor }]}>{commentCount}</Text>
        </TouchableOpacity>
      ) : null}

      {/* SHARE */}

      {onPressShare && (
        <TouchableOpacity
          onPress={onPressShare}
          activeOpacity={0.85}
          style={styles.btn}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color={T.textColor}
          />
        </TouchableOpacity>
      )}

      <View style={{ flex: 1 }} />

      {/* SAVE */}

      {onToggleSave && (
        <TouchableOpacity
          onPress={onToggleSave}
          activeOpacity={0.85}
          style={styles.btn}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={T.textColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 10,
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },

  txt: {
    fontWeight: "800",
  },
});