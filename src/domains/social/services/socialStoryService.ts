import type { SocialStory } from "../types/social.types";

let stories: SocialStory[] = [];

export const createStory = (story: SocialStory) => {
  stories.unshift(story);
  return story;
};

export const getStories = () => stories;

export const getStoriesWithPriority = () => {
  return [...stories].sort((a, b) => {
    if (a.eventId && !b.eventId) return -1;
    if (!a.eventId && b.eventId) return 1;
    const aTs =
      typeof a.createdAt === "number"
        ? a.createdAt
        : new Date(a.createdAt).getTime() || 0;
    const bTs =
      typeof b.createdAt === "number"
        ? b.createdAt
        : new Date(b.createdAt).getTime() || 0;
    return bTs - aTs;
  });
};
