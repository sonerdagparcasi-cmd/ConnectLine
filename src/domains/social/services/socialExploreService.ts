// src/domains/social/services/socialExploreService.ts
// 🔒 Explore: kendi postları hariç, etkileşim + rastgele skor ile sıralama

export type ExplorePostInput = {
  userId: string;
  likeCount?: number;
  commentCount?: number;
};

export function generateExploreFeed<T extends ExplorePostInput>(
  posts: T[],
  currentUserId: string
): (T & { exploreScore: number })[] {
  return posts
    .filter((p) => p.userId !== currentUserId)
    .map((p) => ({
      ...p,
      exploreScore:
        Math.random() * 2 +
        (p.likeCount || 0) * 0.5 +
        (p.commentCount || 0) * 0.8,
    }))
    .sort((a, b) => b.exploreScore - a.exploreScore);
}
