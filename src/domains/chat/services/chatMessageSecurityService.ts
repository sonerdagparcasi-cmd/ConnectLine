import type { MessageIntegrityMeta, MessageIntegrityStatus } from "../types/chat.types";

const INTEGRITY_SALT = "connectline-chat-v1" as const;
const INTEGRITY_VERSION = 1 as const;
const INTEGRITY_ALGORITHM = "fnv1a-32" as const;

export type MessageIntegrityInput = {
  id: string;
  mine: boolean;
  createdAt: number;

  text?: string;

  audio?: {
    uri: string;
    speed?: 1 | 1.5 | 2;
    durationSec?: number;
  };

  media?: {
    kind: string;
    uri?: string;
    fileName?: string;
    caption?: string;
    contactName?: string;
    contactPhone?: string;
    locationLat?: number;
    locationLng?: number;
    locationLabel?: string;
  };

  reminder?: {
    reminderId: string;
    note: string;
    date: string;
    time: string;
    targetUserIds: string[];
  };

  replyTo?: {
    messageId: string;
    preview: string;
    mine: boolean;
  };

  forwarded?: {
    fromLabel: string;
  };

  integrity?: MessageIntegrityMeta;
};

type Primitive = string | number | boolean | null;
type Serializable =
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable };

function normalizeValue(value: unknown): Serializable {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value as Primitive;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === "object") {
    const out: Record<string, Serializable> = {};
    Object.keys(value as Record<string, unknown>)
      .sort()
      .forEach((key) => {
        const next = (value as Record<string, unknown>)[key];
        if (next !== undefined) {
          out[key] = normalizeValue(next);
        }
      });
    return out;
  }

  return String(value);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeValue(value));
}

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function buildIntegrityPayload(message: MessageIntegrityInput) {
  return {
    id: message.id,
    mine: message.mine,
    createdAt: message.createdAt,

    text: message.text ?? undefined,

    audio: message.audio
      ? {
          uri: message.audio.uri,
          durationSec: message.audio.durationSec,
        }
      : undefined,

    media: message.media
      ? {
          kind: message.media.kind,
          uri: message.media.uri,
          fileName: message.media.fileName,
          caption: message.media.caption,
          contactName: message.media.contactName,
          contactPhone: message.media.contactPhone,
          locationLat: message.media.locationLat,
          locationLng: message.media.locationLng,
          locationLabel: message.media.locationLabel,
        }
      : undefined,

    reminder: message.reminder
      ? {
          reminderId: message.reminder.reminderId,
          note: message.reminder.note,
          date: message.reminder.date,
          time: message.reminder.time,
          targetUserIds: [...message.reminder.targetUserIds].sort(),
        }
      : undefined,

    replyTo: message.replyTo
      ? {
          messageId: message.replyTo.messageId,
          preview: message.replyTo.preview,
          mine: message.replyTo.mine,
        }
      : undefined,

    forwarded: message.forwarded
      ? {
          fromLabel: message.forwarded.fromLabel,
        }
      : undefined,
  };
}

export function createMessageIntegrity(
  message: MessageIntegrityInput
): MessageIntegrityMeta {
  const payload = buildIntegrityPayload(message);
  const serialized = stableStringify(payload);
  const contentHash = fnv1a32(serialized);
  const signature = fnv1a32(
    `${INTEGRITY_SALT}:${contentHash}:${message.id}:${message.createdAt}`
  );

  return {
    version: INTEGRITY_VERSION,
    algorithm: INTEGRITY_ALGORITHM,
    salt: INTEGRITY_SALT,
    contentHash,
    signature,
    verifiedAt: Date.now(),
    status: "verified",
  };
}

export function verifyMessageIntegrity(
  message: MessageIntegrityInput
): MessageIntegrityMeta {
  const expected = createMessageIntegrity(message);
  const current = message.integrity;

  const status: MessageIntegrityStatus =
    current &&
    current.contentHash === expected.contentHash &&
    current.signature === expected.signature
      ? "verified"
      : "invalid";

  return {
    ...expected,
    verifiedAt: Date.now(),
    status,
  };
}

export function isMessageIntegrityVerified(
  message: MessageIntegrityInput
): boolean {
  return verifyMessageIntegrity(message).status === "verified";
}
