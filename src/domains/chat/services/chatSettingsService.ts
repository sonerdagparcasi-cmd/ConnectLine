import type { ChatSettings, UserId } from "../types/chat.types";

let settings: ChatSettings = {
  showReadReceipts: true,
  showOnline: true,
  showLastSeen: true,
  notificationsEnabled: true,
  notificationSound: true,
  notificationVibration: true,
  autoPlayVoice: true,
  autoDownloadMedia: true,
  fontSize: "medium",
  wallpaper: "none",
  blockedUsers: [],
  mutedUsers: [],
};

export const chatSettingsService = {
  getSettings() {
    return settings;
  },

  updateSettings(next: Partial<ChatSettings>) {
    settings = {
      ...settings,
      ...next,
    };
  },

  blockUser(userId: UserId) {
    if (!settings.blockedUsers.includes(userId)) {
      settings.blockedUsers.push(userId);
    }
  },

  unblockUser(userId: UserId) {
    settings.blockedUsers = settings.blockedUsers.filter(
      (id) => id !== userId
    );
  },

  isBlocked(userId: UserId) {
    return settings.blockedUsers.includes(userId);
  },

  muteUser(userId: UserId) {
    if (!settings.mutedUsers.includes(userId)) {
      settings.mutedUsers.push(userId);
    }
  },

  unmuteUser(userId: UserId) {
    settings.mutedUsers = settings.mutedUsers.filter((id) => id !== userId);
  },

  isMuted(userId: UserId) {
    return settings.mutedUsers.includes(userId);
  },
};
