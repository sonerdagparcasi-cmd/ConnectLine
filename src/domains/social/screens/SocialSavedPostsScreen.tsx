// src/domains/social/screens/SocialSavedPostsScreen.tsx
// 🔒 SOCIAL SAVED POSTS – STABLE
// UPDATED:
// - Global SocialHeader
// - SafeArea + Layout uyumu

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { t } from "../../../shared/i18n/t";

import SocialPostCard from "../components/SocialPostCard";
import SocialScreenLayout from "../components/SocialScreenLayout";

import type { SocialStackParamList } from "../navigation/SocialNavigator";

import {
  getAllPosts,
  getSavedPosts,
  isSaved,
  subscribeFeed,
  toggleLikeForUser,
  toggleSaveForUser,
} from "../services/socialFeedStateService";
import { getCurrentSocialUserId, subscribeFollow } from "../services/socialFollowService";

import type { SocialPost } from "../types/social.types";

/* ------------------------------------------------------------------ */

type Nav = NativeStackNavigationProp<SocialStackParamList>;

/* ------------------------------------------------------------------ */

export default function SocialSavedPostsScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();
  const currentUserId = getCurrentSocialUserId();

  const [posts, setPosts] = useState<SocialPost[]>((() => getSavedPosts()) as any);

  /* ------------------------------------------------------------------ */
  /* FEED STATE SYNC                                                    */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const sync = () =>
      setPosts(
        getAllPosts().filter((p) => isSaved(currentUserId, p.id))
      );
    sync();
    const u1 = subscribeFeed(sync);
    const u2 = subscribeFollow(sync);
    return () => {
      u1();
      u2();
    };
  }, [currentUserId]);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  function removeSaved(postId: string) {
    toggleSaveForUser(currentUserId, postId);
  }

  const isEmpty = useMemo(() => posts.length === 0, [posts]);

  /* ------------------------------------------------------------------ */

  return (
    <SocialScreenLayout title={t("social.saved.title")} scroll={false}>
      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: T.mutedText }]}>
            {t("social.saved.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SocialPostCard
              post={item}
              saved={isSaved(currentUserId, item.id)}
              onPressPost={() =>
                navigation.navigate("SocialPostDetail", {
                  postId: item.id,
                })
              }
              onPressMedia={(index) =>
                navigation.navigate("SocialMediaPreview", {
                  media: item.media,
                  initialIndex: index,
                })
              }
              onToggleLike={() => toggleLikeForUser(currentUserId, item.id)}
              onPressComments={() =>
                navigation.navigate("SocialPostDetail", {
                  postId: item.id,
                })
              }
              onPressMenu={() => {}}
              onPressShare={() => {}}
              onToggleSave={() => removeSaved(item.id)}
            />
          )}
        />
      )}
    </SocialScreenLayout>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  list: {
    paddingBottom: 40,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "700",
  },
});