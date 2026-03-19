type SocialMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: "text" | "story_reply";
  storyId?: string;
  createdAt: string;
};

let MESSAGES: SocialMessage[] = [];

export function sendSocialMessage(message: SocialMessage) {
  MESSAGES.unshift(message);
}

export function getSocialMessages(userId: string) {
  return MESSAGES.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );
}
