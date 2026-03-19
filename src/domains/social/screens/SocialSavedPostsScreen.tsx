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
  getSavedPosts,
  isPostSaved,
  subscribeFeed,
  toggleLike,
  toggleSavedPost,
} from "../services/socialFeedStateService";

import type { SocialPost } from "../types/social.types";

/* ------------------------------------------------------------------ */

type Nav = NativeStackNavigationProp<SocialStackParamList>;

/* ------------------------------------------------------------------ */

export default function SocialSavedPostsScreen() {
  const T = useAppTheme();
  const navigation = useNavigation<Nav>();

  const [posts, setPosts] = useState<SocialPost[]>((() => getSavedPosts()) as any);

  /* ------------------------------------------------------------------ */
  /* FEED STATE SYNC                                                    */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    setPosts(getSavedPosts());

    const unsubscribe = subscribeFeed(() => {
      setPosts(getSavedPosts());
    });

    return unsubscribe;
  }, []);

  /* ------------------------------------------------------------------ */
  /* ACTIONS                                                            */
  /* ------------------------------------------------------------------ */

  function removeSaved(postId: string) {
    toggleSavedPost(postId);
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
              saved={isPostSaved(item.id)}
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
              onToggleLike={() => toggleLike(item.id)}
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