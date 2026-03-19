import { StoryReaction } from "./storyReaction.types";

/**
 * StoryReactionService
 *
 * - UI-only
 * - Backend-ready
 * - Chat domain
 * - Tek type kaynağı: storyReaction.types.ts
 */

/* ------------------------------------------------------------------ */
/* LOCAL STORE (UI-ONLY)                                               */
/* ------------------------------------------------------------------ */

const REACTIONS: StoryReaction[] = [];

/* ------------------------------------------------------------------ */
/* SERVICE                                                             */
/* ------------------------------------------------------------------ */

class StoryReactionService {
  /**
   * ➕ Add reaction (or update if same user already reacted to this story)
   */
  add(reaction: StoryReaction) {
    const idx = REACTIONS.findIndex(
      (r) => r.storyId === reaction.storyId && r.fromUserId === reaction.fromUserId
    );
    if (idx >= 0) {
      REACTIONS[idx] = { ...reaction, createdAt: reaction.createdAt };
    } else {
      REACTIONS.push(reaction);
    }
  }

  /**
   * 📥 Get reactions for a story
   */
  getByStory(storyId: string): StoryReaction[] {
    return REACTIONS.filter((r) => r.storyId === storyId);
  }

  /**
   * 📊 Get total reaction count for a story
   */
  getCount(storyId: string): number {
    return REACTIONS.filter((r) => r.storyId === storyId).length;
  }

  /**
   * 📈 Get reaction distribution for a story (emoji -> count)
   */
  getReactionStats(storyId: string): Record<string, number> {
    const list = this.getByStory(storyId);
    const stats: Record<string, number> = {};
    for (const r of list) {
      stats[r.reaction] = (stats[r.reaction] ?? 0) + 1;
    }
    return stats;
  }

  /**
   * 🧹 Clear all reactions (debug / reset)
   */
  clear() {
    REACTIONS.length = 0;
  }
}

export const storyReactionService = new StoryReactionService();
