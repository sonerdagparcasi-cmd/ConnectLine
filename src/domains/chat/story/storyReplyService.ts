import * as SecureStore from "expo-secure-store";

import { createStoryReplyMessage } from "../services/chatMessageFactory";
import { chatService } from "../services/chatService";

export interface StoryReply {
  id: string;
  storyId: string;
  fromUserId: string;
  text: string;
  createdAt: number;
}

const KEY = "chat_story_replies_v1";

let REPLIES: StoryReply[] = [];

async function save() {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(REPLIES));
  } catch {}
}

async function restore() {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (raw) REPLIES = JSON.parse(raw);
  } catch {}
}

class StoryReplyService {
  private ready = false;

  private async ensure() {
    if (!this.ready) {
      await restore();
      this.ready = true;
    }
  }

  async add(reply: StoryReply) {
    await this.ensure();
    REPLIES.push(reply);
    await save();
  }

  async getForStory(storyId: string) {
    await this.ensure();
    return REPLIES.filter((r) => r.storyId === storyId);
  }

  async clearForStory(storyId: string) {
    await this.ensure();
    REPLIES = REPLIES.filter((r) => r.storyId !== storyId);
    await save();
  }
}

export function sendStoryReplyAsMessage(params: {
  fromUserId: string;
  toUserId: string;
  text: string;
  storyId: string;
}) {
  const chatId = `direct_${params.toUserId}`;
  const msg = createStoryReplyMessage({
    text: params.text,
    storyId: params.storyId,
    storyOwnerId: params.toUserId,
    storyMediaUri: null,
    status: "sending",
  });

  chatService.getChat(chatId);
  chatService.enqueuePendingMessage(chatId, msg);
}

export const storyReplyService = new StoryReplyService();
