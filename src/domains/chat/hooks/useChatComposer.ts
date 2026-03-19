// src/domains/chat/hooks/useChatComposer.ts

import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";

import type {
    AttachmentType,
    ComposerSelectPayload,
} from "../components/ChatComposerSheet";
import type { MessageStatus } from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* TYPES (🔒)                                                          */
/* ------------------------------------------------------------------ */

type MediaKind = "image" | "video" | "file" | "contact" | "location";

export type ReplyMeta = {
  messageId: string;
  preview: string;
  mine: boolean;
};

export type UiMessage = {
  id: string;
  mine: boolean;
  status: MessageStatus;
  createdAt: number;

  text?: string;

  audio?: {
    uri: string;
    speed?: 1 | 1.5 | 2;
  };

  media?: {
    kind: MediaKind;
    uri?: string;
    fileName?: string;
  };

  replyTo?: ReplyMeta;
  forwarded?: { fromLabel: string };
};

/* ------------------------------------------------------------------ */
/* HELPERS (🔒)                                                        */
/* ------------------------------------------------------------------ */

function makeId() {
  return Date.now().toString();
}

function clampText(s: string, max = 70) {
  const t = (s ?? "").trim();
  if (!t) return "—";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function getPreview(m: UiMessage) {
  if (m.text?.trim()) return clampText(m.text);
  if (m.audio) return "🎤 Sesli mesaj";
  if (m.media) {
    if (m.media.kind === "image") return "🖼️ Fotoğraf";
    if (m.media.kind === "video") return "🎬 Video";
    if (m.media.kind === "file") return "📎 Dosya";
    if (m.media.kind === "contact") return "👤 Kişi";
    if (m.media.kind === "location") return "📍 Konum";
  }
  return "—";
}

function isMediaAttachment(type: AttachmentType): type is MediaKind {
  return (
    type === "image" ||
    type === "video" ||
    type === "file" ||
    type === "contact" ||
    type === "location"
  );
}

/* ------------------------------------------------------------------ */
/* HOOK                                                                */
/* ------------------------------------------------------------------ */

type Params = {
  messages: UiMessage[];
  setMessages: React.Dispatch<React.SetStateAction<UiMessage[]>>;
};

export function useChatComposer({ messages, setMessages }: Params) {
  /* ---------------- TEXT ---------------- */

  const [text, setText] = useState("");

  /* ---------------- COMPOSER ---------------- */

  const [composerOpen, setComposerOpen] = useState(false);

  /* ---------------- REPLY ---------------- */

  const [replyTo, setReplyTo] = useState<UiMessage | null>(null);
  const replyRef = useRef<UiMessage | null>(null);

  useEffect(() => {
    replyRef.current = replyTo;
  }, [replyTo]);

  function startReply(target: UiMessage) {
    setReplyTo(target);
    Haptics.selectionAsync().catch(() => {});
  }

  function clearReply() {
    setReplyTo(null);
  }

  function buildReplyMeta(target: UiMessage): ReplyMeta {
    return {
      messageId: target.id,
      preview: getPreview(target),
      mine: target.mine,
    };
  }

  /* ---------------- SEND TEXT ---------------- */

  function sendText() {
    if (!text.trim()) return;

    const replyMeta = replyRef.current
      ? buildReplyMeta(replyRef.current)
      : undefined;

    setMessages((p) => [
      ...p,
      {
        id: makeId(),
        mine: true,
        status: "sent",
        createdAt: Date.now(),
        text: text.trim(),
        replyTo: replyMeta,
      },
    ]);

    setText("");
    setReplyTo(null);
  }

  /* ---------------- ATTACHMENT ---------------- */

  function handleSelectAttachment(
    type: AttachmentType,
    payload?: ComposerSelectPayload
  ) {
    setComposerOpen(false);

    const replyMeta = replyRef.current
      ? buildReplyMeta(replyRef.current)
      : undefined;

    if (!isMediaAttachment(type)) {
      // reminder / location vs. gibi UI-only text
      setMessages((p) => [
        ...p,
        {
          id: makeId(),
          mine: true,
          status: "sent",
          createdAt: Date.now(),
          text: "⏰ Hatırlatıcı eklendi",
          replyTo: replyMeta,
        },
      ]);
      setReplyTo(null);
      return;
    }

    setMessages((p) => [
      ...p,
      {
        id: makeId(),
        mine: true,
        status: "sent",
        createdAt: Date.now(),
        media: {
          kind: type,
          uri: (payload as any)?.uri,
          fileName: (payload as any)?.fileName,
        },
        replyTo: replyMeta,
      },
    ]);

    setReplyTo(null);
  }

  /* ---------------- RECORD (TRIGGER ONLY) ---------------- */

  function startRecordingTrigger() {
    Haptics.selectionAsync().catch(() => {});
    return true;
  }

  function stopRecordingTrigger() {
    return true;
  }

  /* ------------------------------------------------------------------ */

  return {
    // state
    text,
    setText,
    composerOpen,
    setComposerOpen,
    replyTo,

    // actions
    sendText,
    startReply,
    clearReply,
    handleSelectAttachment,

    // recording (logic only)
    startRecordingTrigger,
    stopRecordingTrigger,
  };
}