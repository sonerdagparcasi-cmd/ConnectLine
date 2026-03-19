// src/domains/chat/hooks/useChatReadReceipts.ts

import { useMemo } from "react";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

type MessageLike = {
  id: string;
  mine: boolean;
};

type ReadUser = {
  id: string;
  name: string;
};

type ReadReceipt = {
  messageId: string;
  readers: ReadUser[];
};

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI-ONLY, 🔒)                                             */
/* ------------------------------------------------------------------ */

// birebir
const MOCK_PEER: ReadUser = {
  id: "u2",
  name: "Karşı Taraf",
};

// grup
const MOCK_GROUP_USERS: ReadUser[] = [
  { id: "u2", name: "Ayşe" },
  { id: "u3", name: "Mehmet" },
  { id: "u4", name: "Elif" },
];

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

export function useChatReadReceipts<T extends MessageLike>(
  messages: T[],
  isGroup: boolean
) {
  /* ---------------- BUILD RECEIPTS ---------------- */

  const receipts = useMemo<ReadReceipt[]>(() => {
    return messages
      .filter((m) => m.mine)
      .map((m, idx) => {
        // UI-only deterministic mock:
        // yeni mesaj → daha az kişi görmüş
        const seenCount = Math.max(
          0,
          Math.min(isGroup ? MOCK_GROUP_USERS.length : 1, idx)
        );

        return {
          messageId: m.id,
          readers: isGroup
            ? MOCK_GROUP_USERS.slice(0, seenCount)
            : seenCount > 0
            ? [MOCK_PEER]
            : [],
        };
      });
  }, [messages, isGroup]);

  /* ---------------- HELPERS ---------------- */

  function getReaders(messageId: string): ReadUser[] {
    return (
      receipts.find((r) => r.messageId === messageId)?.readers ?? []
    );
  }

  function isRead(messageId: string): boolean {
    return getReaders(messageId).length > 0;
  }

  function readCount(messageId: string): number {
    return getReaders(messageId).length;
  }

  function readLabel(messageId: string): string {
    const count = readCount(messageId);

    if (!count) return "Okunmadı";

    if (!isGroup) return "Görüldü";

    return `${count} kişi gördü`;
  }

  /* ------------------------------------------------------------------ */

  return {
    getReaders,   // detay drawer için
    isRead,       // status icon logic
    readCount,    // badge / text
    readLabel,    // UI string
  };
}