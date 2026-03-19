// src/domains/chat/story/chatStoryGroupService.ts
// 🔒 CHAT STORY GROUP SERVICE – Social mantığı ile aynı

import type { ChatStory } from "./chatStory.types";

export type ChatStoryGroupUI = {
  userId: string;
  username: string;
  avatarUri?: string | null;
  stories: ChatStory[];
};

function getCreatedAt(story: any): number {
  if (!story) return 0;
  if (typeof story.createdAt === "number") return story.createdAt;
  const t = new Date(story.createdAt ?? 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function groupStoriesByUser(stories: Array<ChatStory & any>): ChatStoryGroupUI[] {
  if (!stories || stories.length === 0) return [];

  const map = new Map<string, ChatStoryGroupUI>();

  for (const story of stories) {
    const userId: string | undefined =
      story?.ownerId ?? story?.userId ?? story?.id;
    if (!userId) continue;

    if (!map.has(userId)) {
      map.set(userId, {
        userId,
        username: story?.ownerName ?? story?.username ?? story?.name ?? "User",
        avatarUri: story?.avatarUri ?? story?.image ?? story?.userAvatarUri ?? null,
        stories: [],
      });
    }

    map.get(userId)!.stories.push(story);
  }

  const groups = Array.from(map.values()).map((group) => {
    const sortedStories = [...group.stories].sort((a, b) => getCreatedAt(a) - getCreatedAt(b));
    return { ...group, stories: sortedStories };
  });

  groups.sort((a, b) => {
    const aLast = getCreatedAt(a.stories[a.stories.length - 1]);
    const bLast = getCreatedAt(b.stories[b.stories.length - 1]);
    return bLast - aLast;
  });

  return groups;
}

