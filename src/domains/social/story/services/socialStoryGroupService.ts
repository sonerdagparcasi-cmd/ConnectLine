// src/domains/social/story/services/socialStoryGroupService.ts
// 🔒 SOCIAL STORY GROUP SERVICE – UI-only grouping

import type { SocialStory } from "../../types/social.types";

export type SocialStoryGroupUI = {
  userId: string;
  username: string;
  avatarUri?: string | null;
  stories: SocialStory[];
};

function getCreatedAt(story: any): number {
  if (!story) return 0;
  const t = new Date(story.createdAt ?? 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function groupStoriesByUser(
  stories: SocialStory[],
  currentUserId: string
): SocialStoryGroupUI[] {
  if (!stories || stories.length === 0) return [];

  const map = new Map<string, SocialStoryGroupUI>();

  for (const story of stories) {
    const userId = (story?.userId ?? "").toString();
    if (!userId) continue;

    if (!map.has(userId)) {
      map.set(userId, {
        userId,
        username: story?.username ?? "User",
        avatarUri: story?.userAvatarUri ?? null,
        stories: [],
      });
    }

    map.get(userId)!.stories.push(story);
  }

  const groups = Array.from(map.values()).map((g) => ({
    ...g,
    stories: [...g.stories].sort((a, b) => getCreatedAt(a) - getCreatedAt(b)),
  }));

  groups.sort((a, b) => {
    const aLast = getCreatedAt(a.stories[a.stories.length - 1]);
    const bLast = getCreatedAt(b.stories[b.stories.length - 1]);
    return bLast - aLast;
  });

  groups.sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return 0;
  });

  return groups;
}

