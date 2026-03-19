// src/domains/chat/story/chatStoryStateService.ts
// 🔒 CHAT STORY STATE – VIEWED + STORY LIST (UI ONLY)

export type Story = {
  id: string;
  userId: string;
  username: string;
  userAvatarUri: string | null;
  mediaUri: string;
  createdAt: string; // ISO

  seenBy: string[];
  likedBy: string[];
};

export type StoryUserDisplay = {
  userId: string;
  username: string;
  avatarUri: string | null;
};

const STORY_LIFETIME = 24 * 60 * 60 * 1000;

export function isStoryExpired(createdAt: string) {
  const created = new Date(createdAt).getTime();
  return Date.now() - created > STORY_LIFETIME;
}

/* ------------------------------------------------------------------ */
/* VIEWED STORIES (for ring state)                                    */
/* ------------------------------------------------------------------ */

const viewedStories = new Set<string>();

export function markStoryViewed(storyId: string) {
  viewedStories.add(storyId);
}

export function isStoryViewed(storyId: string, userId?: string) {
  if (userId === "me") return true;
  return viewedStories.has(storyId);
}

/* ------------------------------------------------------------------ */
/* STORY LIST (single source: mock + user-provided)                    */
/* ------------------------------------------------------------------ */

const MOCK_STORIES: Story[] = [
  {
    id: "s1",
    userId: "u1",
    username: "Ali",
    userAvatarUri: "https://i.pravatar.cc/200?img=1",
    mediaUri: "https://picsum.photos/300/500?1",
    createdAt: new Date().toISOString(),
    seenBy: [],
    likedBy: [],
  },
  {
    id: "s2",
    userId: "u2",
    username: "Ayşe",
    userAvatarUri: "https://i.pravatar.cc/200?img=2",
    mediaUri: "https://picsum.photos/300/500?2",
    createdAt: new Date().toISOString(),
    seenBy: [],
    likedBy: [],
  },
  {
    id: "s3",
    userId: "u3",
    username: "Mehmet",
    userAvatarUri: "https://i.pravatar.cc/200?img=3",
    mediaUri: "https://picsum.photos/300/500?3",
    createdAt: new Date().toISOString(),
    seenBy: [],
    likedBy: [],
  },
  {
    id: "s4",
    userId: "u4",
    username: "Zeynep",
    userAvatarUri: "https://i.pravatar.cc/200?img=4",
    mediaUri: "https://picsum.photos/300/500?4",
    createdAt: new Date().toISOString(),
    seenBy: [],
    likedBy: [],
  },
  {
    id: "s5",
    userId: "u5",
    username: "Can",
    userAvatarUri: "https://i.pravatar.cc/200?img=5",
    mediaUri: "https://picsum.photos/300/500?5",
    createdAt: new Date().toISOString(),
    seenBy: [],
    likedBy: [],
  },
  {
    id: "s6",
    userId: "u6",
    username: "Elif",
    userAvatarUri: "https://i.pravatar.cc/200?img=6",
    mediaUri: "https://picsum.photos/300/500?6",
    createdAt: new Date().toISOString(),
    seenBy: [],
    likedBy: [],
  },
];

const ME_STORY: Story = {
  id: "me_empty",
  userId: "me",
  username: "Sen",
  userAvatarUri: "",
  mediaUri: "",
  createdAt: new Date().toISOString(),
  seenBy: [],
  likedBy: [],
};

let userStories: any[] = [];
const storyIdIndex = new Set<string>();

function upsertStory(list: Story[], story: Story) {
  if (storyIdIndex.has(story.id)) return list;
  storyIdIndex.add(story.id);
  return [story, ...list];
}

export function getStories() {
  const hasMe = userStories.some((s: any) => s.userId === "me");

  if (hasMe) {
    return [...MOCK_STORIES, ...userStories];
  }

  return [ME_STORY, ...MOCK_STORIES, ...userStories];
}

export function getStoriesByUserId(userId: string): Story[] {
  return getStories().filter((s: any) => s?.userId === userId);
}

export function getUserDisplay(userId: string): StoryUserDisplay {
  const u = (userId ?? "").toString();
  const stories = getStories();

  // Prefer latest story metadata for that user
  for (let i = stories.length - 1; i >= 0; i--) {
    const s: any = stories[i];
    if (s?.userId !== u) continue;
    const username = (s?.username ?? "").toString().trim() || (u === "me" ? "Sen" : "User");
    const avatarUri =
      typeof s?.userAvatarUri === "string" && s.userAvatarUri.trim()
        ? s.userAvatarUri.trim()
        : null;
    return { userId: u, username, avatarUri };
  }

  return {
    userId: u,
    username: u === "me" ? "Sen" : u,
    avatarUri:
      u && u !== "me"
        ? `https://i.pravatar.cc/200?u=${encodeURIComponent(u)}`
        : null,
  };
}

export function addStory(story: Omit<Story, "createdAt"> & { createdAt?: string }) {
  userStories = upsertStory(userStories, {
    ...story,
    createdAt: story.createdAt ?? new Date().toISOString(),
    seenBy: story.seenBy ?? [],
    likedBy: story.likedBy ?? [],
  });
}

export function markStorySeen(storyId: string, userId: string) {
  const story = getStories().find((s: any) => s.id === storyId) as any;
  if (!story) return;

  if (!Array.isArray(story.seenBy)) story.seenBy = [];
  if (!story.seenBy.includes(userId)) {
    story.seenBy.push(userId);
  }
}

export function toggleStoryLike(storyId: string, userId: string) {
  const story = getStories().find((s: any) => s.id === storyId) as any;
  if (!story) return;

  if (!Array.isArray(story.likedBy)) story.likedBy = [];
  if (story.likedBy.includes(userId)) {
    story.likedBy = story.likedBy.filter((id: string) => id !== userId);
  } else {
    story.likedBy.push(userId);
  }
}

export function deleteStory(storyId: string) {
  // only user-created stories are deletable in UI-only mode
  userStories = userStories.filter((s: any) => s?.id !== storyId);
  viewedStories.delete(storyId);
  storyIdIndex.delete(storyId);
}

