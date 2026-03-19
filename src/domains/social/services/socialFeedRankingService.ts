// src/domains/social/services/socialFeedRankingService.ts
// 🔒 Feed sıralama: story etkileşim sinyallerine göre skor

import { getFeedSignals } from "./socialFeedBridgeService";

export function rankFeedPosts<T extends { userId: string }>(
  posts: T[],
  _currentUserId: string
): (T & { score: number })[] {
  const signals = getFeedSignals();

  return posts
    .map((post) => {
      let score = 0;

      signals.forEach((s) => {
        if (s.storyOwnerId === post.userId) {
          score += s.weight;
        }
      });

      return {
        ...post,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}
