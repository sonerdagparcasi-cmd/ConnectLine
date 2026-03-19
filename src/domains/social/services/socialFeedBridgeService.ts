// src/domains/social/services/socialFeedBridgeService.ts
// 🔒 Story → Feed bridge (signals only; feed tüketicisi ayrı)

import type { SocialStory } from "../types/social.types";

export type FeedInteractionType = "reply" | "reaction" | "view";

export type StoryFeedInteraction = {
  userId: string;
  type: FeedInteractionType;
};

export type StoryFeedSignal = {
  userId: string;
  storyOwnerId: string;
  type: FeedInteractionType;
  weight: number;
  createdAt: number;
};

export function mapStoryToFeedSignal(
  story: SocialStory,
  interaction: StoryFeedInteraction
): StoryFeedSignal {
  return {
    userId: interaction.userId,
    storyOwnerId: story.userId,
    type: interaction.type,
    weight:
      interaction.type === "reply"
        ? 3
        : interaction.type === "reaction"
          ? 2
          : 1,
    createdAt: Date.now(),
  };
}

let FEED_SIGNALS: StoryFeedSignal[] = [];

export function pushFeedSignal(signal: StoryFeedSignal) {
  FEED_SIGNALS.push(signal);
}

export function getFeedSignals(): StoryFeedSignal[] {
  return FEED_SIGNALS;
}
