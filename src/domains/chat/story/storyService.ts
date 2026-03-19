// src/domains/chat/story/storyService.ts

import { ChatStory } from "./chatStory.types";

const DAY_24 = 24 * 60 * 60 * 1000;

const stories: ChatStory[] = [];

class ChatStoryService {
  /* ------------------------------------------------------------------ */
  /* HELPERS                                                            */
  /* ------------------------------------------------------------------ */

  private isExpired(story: ChatStory) {
    return Date.now() - story.createdAt > DAY_24;
  }

  private clearExpired() {
    for (let i = stories.length - 1; i >= 0; i--) {
      if (this.isExpired(stories[i])) {
        stories.splice(i, 1);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* READ                                                               */
  /* ------------------------------------------------------------------ */

  getAll(): ChatStory[] {
    this.clearExpired();
    return [...stories];
  }

  getMine(): ChatStory[] {
    this.clearExpired();
    return stories.filter((s) => s.ownerId === "me");
  }

  getOthers(): ChatStory[] {
    this.clearExpired();
    return stories.filter((s) => s.ownerId !== "me");
  }

  /* ------------------------------------------------------------------ */
  /* WRITE                                                              */
  /* ------------------------------------------------------------------ */

  create(story: ChatStory) {
    stories.unshift(story);
  }

  clearAll() {
    stories.length = 0;
  }
}

export const chatStoryService = new ChatStoryService();

