// src/domains/social/story/hooks/useSocialStories.ts

import { useEffect, useMemo, useState } from "react";

import { useSocialProfile } from "../../hooks/useSocialProfile";
import { groupStoriesByUser } from "../services/socialStoryGroupService";
import {
  addStory,
  deleteStory,
  getStories,
  markStorySeen,
  markStoryViewed,
  subscribeStories,
  toggleLike,
} from "../services/socialStoryStateService";

export function useSocialStories() {
  const { profile } = useSocialProfile();
  const [rev, setRev] = useState(0);

  useEffect(() => subscribeStories(() => setRev((n) => n + 1)), []);

  const stories = useMemo(() => getStories(), [rev]);
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
    subscribeStories,
  };
}

