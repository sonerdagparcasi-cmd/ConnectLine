// src/domains/chat/hooks/useChatHeader.ts

import { useMemo } from "react";
import { t } from "../../../shared/i18n/t";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type HeaderMenuItem =
  | "search"
  | "group-info"
  | "mute"
  | "clear-chat";

type Params = {
  chatId?: string;
  peerName?: string;
};

/* ------------------------------------------------------------------ */
/* MOCKS (UI-ONLY, 🔒)                                                 */
/* ------------------------------------------------------------------ */

const MOCK_ONLINE = true;

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatHeader({ chatId, peerName }: Params) {
  const isGroup =
    typeof chatId === "string" && chatId.startsWith("group_");

  /* ---------------- TITLE ---------------- */

  const title = useMemo(() => {
    if (peerName) return peerName;
    return isGroup ? t("chat.group") : t("chat.chat");
  }, [peerName, isGroup]);

  /* ---------------- SUBTITLE ---------------- */

  const subtitle = useMemo(() => {
    if (isGroup) return t("chat.groupChat");
    return MOCK_ONLINE ? t("chat.online") : t("chat.offline");
  }, [isGroup]);

  /* ---------------- MENU ---------------- */

  const menuItems = useMemo<HeaderMenuItem[]>(() => {
    const base: HeaderMenuItem[] = ["search"];

    if (isGroup) {
      base.push("group-info");
    }

    base.push("mute");
    base.push("clear-chat");

    return base;
  }, [isGroup]);

  /* ------------------------------------------------------------------ */

  return {
    isGroup,
    title,
    subtitle,
    menuItems,
  };
}
