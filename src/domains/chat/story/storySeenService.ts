import { StorySeen } from "./storySeen.types";

const seenMap = new Map<string, StorySeen[]>();

class StorySeenService {
  markSeen(entry: StorySeen) {
    const list = seenMap.get(entry.storyId) ?? [];

    if (list.some((s) => s.userId === entry.userId)) return;

    list.push(entry);
    seenMap.set(entry.storyId, list);
  }

  getSeen(storyId: string): StorySeen[] {
    return seenMap.get(storyId) ?? [];
  }
}

export const storySeenService = new StorySeenService();
