import { ChatStoryId, ChatUserId } from "./chatStory.types";

export interface StorySeen {
  storyId: ChatStoryId;
  userId: ChatUserId;
  userName: string;
  avatarUri?: string;
  seenAt: number;
}
