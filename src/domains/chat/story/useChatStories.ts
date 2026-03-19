// src/domains/chat/story/useChatStories.ts

import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

import { useChatProfile } from "../profile/useChatProfile";
import { ChatStory, ChatStoryGroup, ChatStoryMedia } from "./chatStory.types";
import { storySeenService } from "./storySeenService";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                           */
/* ------------------------------------------------------------------ */

const DAY_24 = 24 * 60 * 60 * 1000;

const STORIES_KEY = "chat_stories_v1";
const SEEN_KEY = "chat_story_seen_v1";

/* ------------------------------------------------------------------ */
/* LOCAL STORE (UI-ONLY)                                               */
/* ------------------------------------------------------------------ */

let STORIES: ChatStory[] = [];
let SEEN_IDS = new Set<string>();

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

function isActive(story: ChatStory) {
  return Date.now() - story.createdAt < DAY_24;
}

function groupByOwner(stories: ChatStory[]): ChatStoryGroup[] {
  const map = new Map<string, ChatStoryGroup>();

  stories.forEach((story) => {
    if (!map.has(story.ownerId)) {
      map.set(story.ownerId, {
        ownerId: story.ownerId,
        ownerName: story.ownerName,
        stories: [],
      });
    }

    map.get(story.ownerId)!.stories.push(story);
  });

  return Array.from(map.values());
}

const CURRENT_USER_ID = "me";

function isGroupSeen(group: ChatStoryGroup): boolean {
  if (group.stories.length === 0) return false;
  return group.stories.every((story) => SEEN_IDS.has(story.id));
}

/* ------------------------------------------------------------------ */
/* PERSISTENCE                                                         */
/* ------------------------------------------------------------------ */

async function save() {
  try {
    await SecureStore.setItemAsync(STORIES_KEY, JSON.stringify(STORIES));
    await SecureStore.setItemAsync(SEEN_KEY, JSON.stringify(Array.from(SEEN_IDS)));
  } catch {
    // UI-only → sessiz geç
  }
}

async function restore() {
  try {
    const rawStories = await SecureStore.getItemAsync(STORIES_KEY);
    const rawSeen = await SecureStore.getItemAsync(SEEN_KEY);

    if (rawStories) {
      STORIES = JSON.parse(rawStories);
    }

    if (rawSeen) {
      SEEN_IDS = new Set<string>(JSON.parse(rawSeen));
    }
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatStories() {
  const { profile } = useChatProfile();

  const [mine, setMine] = useState<ChatStoryGroup[]>([]);
  const [others, setOthers] = useState<ChatStoryGroup[]>([]);
  const [ready, setReady] = useState(false);

  /* ----------------------------- REFRESH ---------------------------- */

  function refresh() {
    const active = STORIES.filter(isActive);

    setMine(groupByOwner(active.filter((s) => s.ownerId === "me")));
    setOthers(groupByOwner(active.filter((s) => s.ownerId !== "me")));
  }

  /* ----------------------------- CREATE ----------------------------- */

  async function createStory(media: ChatStoryMedia, caption?: string) {
    const now = Date.now();

    STORIES.unshift({
      id: now.toString(),
      ownerId: "me",
      ownerName: profile.displayName,
      media,
      caption,
      createdAt: now,
    });

    await save();
    refresh();
  }

  /* ------------------------------ SEEN ------------------------------ */

  async function markSeen(storyId: string) {
    if (SEEN_IDS.has(storyId)) {
      // yine de seen list için güvenli olsun
      try {
        storySeenService.markSeen({
          storyId,
          userId: "me",
          userName: profile.displayName ?? "Sen",
          avatarUri: (profile as any)?.avatarUri,
          seenAt: Date.now(),
        });
      } catch {}
      return;
    }

    SEEN_IDS.add(storyId);

    // ✅ 12E.3 – Seen list datası (UI-only)
    try {
      storySeenService.markSeen({
        storyId,
        userId: "me",
        userName: profile.displayName ?? "Sen",
        avatarUri: (profile as any)?.avatarUri,
        seenAt: Date.now(),
      });
    } catch {
      // UI-only
    }

    await save();
    refresh();
  }

  function getSeenCount(storyId: string) {
    try {
      return storySeenService.getSeen(storyId).length;
    } catch {
      return 0;
    }
  }

  /** Group is seen only if all story ids in the group are in the local SEEN_IDS set. */
  const isSeenGroup = useCallback((group: ChatStoryGroup) => isGroupSeen(group), []);

  /* ----------------------------- EFFECT ----------------------------- */

  useEffect(() => {
    (async () => {
      await restore();

      if (STORIES.length === 0) {
        const now = Date.now();

        STORIES = [
          {
            id: "demo1",
            ownerId: "user_1",
            ownerName: "Ali",
            media: { type: "image", uri: "https://i.pravatar.cc/300?img=11" },
            createdAt: now - 10000,
          },
          {
            id: "demo2",
            ownerId: "user_2",
            ownerName: "Ayşe",
            media: { type: "image", uri: "https://i.pravatar.cc/300?img=12" },
            createdAt: now - 20000,
          },
          {
            id: "demo3",
            ownerId: "user_3",
            ownerName: "Mehmet",
            media: { type: "image", uri: "https://i.pravatar.cc/300?img=13" },
            createdAt: now - 30000,
          },
          {
            id: "demo4",
            ownerId: "user_4",
            ownerName: "Ebru",
            media: { type: "image", uri: "https://i.pravatar.cc/300?img=14" },
            createdAt: now - 40000,
          },
          {
            id: "demo5",
            ownerId: "user_5",
            ownerName: "Emre",
            media: { type: "image", uri: "https://i.pravatar.cc/300?img=15" },
            createdAt: now - 50000,
          },
          {
            id: "demo6",
            ownerId: "user_6",
            ownerName: "Zeynep",
            media: { type: "image", uri: "https://i.pravatar.cc/300?img=16" },
            createdAt: now - 60000,
          },
        ];

        SEEN_IDS.clear();
      }
      SEEN_IDS.forEach((storyId) => {
        try {
          storySeenService.markSeen({
            storyId,
            userId: CURRENT_USER_ID,
            userName: profile.displayName ?? "Sen",
            avatarUri: (profile as any)?.avatarUri,
            seenAt: Date.now(),
          });
        } catch {
          // ignore
        }
      });
      refresh();
      setReady(true);
    })();
  }, []);

  /* ------------------------------ API ------------------------------- */

  return {
    mine,
    others,
    ready,

    createStory,
    markSeen,
    getSeenCount,
    isSeenGroup,
    refresh,
  };
}
