import { useState } from "react";
import { chatSettingsService } from "../services/chatSettingsService";
import { ChatSettings } from "../types/chat.types";

/**
 * useChatSettings
 * - UI sadece burayı kullanır
 */
export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(
    chatSettingsService.getSettings()
  );

  const update = (partial: Partial<ChatSettings>) => {
    chatSettingsService.updateSettings(partial);
    setSettings(chatSettingsService.getSettings());
  };

  return {
    settings,
    update,
  };
}
