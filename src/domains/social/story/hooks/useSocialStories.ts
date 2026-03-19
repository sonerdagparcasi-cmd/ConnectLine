// src/domains/social/story/hooks/useSocialStories.ts

import { useMemo } from "react";

import { useSocialProfile } from "../../hooks/useSocialProfile";
import { groupStoriesByUser } from "../services/socialStoryGroupService";
import {
  addStory,
  deleteStory,
  getStories,
  markStorySeen,
  markStoryViewed,
  toggleLike,
} from "../services/socialStoryStateService";

export function useSocialStories() {
  const { profile } = useSocialProfile();
  const stories = useMemo(() => getStories(), []);
  const groups = useMemo(
    () => groupStoriesByUser(stories, profile.userId),
    [stories, profile.userId]
  );

  return {
    stories,
    groups,

    getStories,
    addStory,
    deleteStory,
    markStoryViewed,
    markStorySeen,
    toggleLike,
  };
}

