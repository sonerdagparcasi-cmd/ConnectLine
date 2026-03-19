// src/domains/social/components/SocialSuggestedUserCard.tsx
// FAZ 4 – Suggested user card for Explore and Profile

import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

export type SuggestedUser = {
  userId: string;
  username: string;
  userAvatarUri?: string | null;
  mutualCount?: number;
};

type Props = {
  user: SuggestedUser;
  isFollowing: boolean;
  onFollow: () => void;
  onPress?: () => void;
};

export default function SocialSuggestedUserCard({
  user,
  isFollowing,
  onFollow,
  onPress,
}: Props) {
  const T = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.border }]}
    >
      <View style={[styles.avatarWrap, { borderColor: T.border }]}>
        {user.userAvatarUri ? (
          <Image source={{ uri: user.userAvatarUri }} style={styles.avatarImg} />
        ) : (
          <Ionicons name="person" size={28} color={T.mutedText} />
        )}
      </View>
      <Text
        style={[styles.displayName, { color: T.textColor }]}
        numberOfLines={1}
      >
        {user.username}
      </Text>
      {user.mutualCount != null && user.mutualCount > 0 && (
        <Text
          style={[styles.mutual, { color: T.mutedText }]}
          numberOfLines={1}
        >
          {user.mutualCount} {t("social.mutualConnections")}
        </Text>
      )}
      <TouchableOpacity
        onPress={(e) => {
          e?.stopPropagation?.();
          onFollow();
        }}
        style={[styles.followBtn, { backgroundColor: T.accent }]}
      >
        <Text style={[styles.followBtnText, { color: T.cardBg }]}>
          {isFollowing ? t("social.following") : t("social.follow")}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  displayName: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  mutual: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  followBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
