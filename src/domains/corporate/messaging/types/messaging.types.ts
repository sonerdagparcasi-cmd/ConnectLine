// src/domains/corporate/messaging/types/messaging.types.ts

/* ------------------------------------------------------------------ */
/* CORE ENUM-LIKE TYPES                                                */
/* ------------------------------------------------------------------ */

/**
 * Mesajı gönderen taraf
 * - company: şirket / recruiter paneli
 * - candidate: aday
 */
export type CorporateSender = "company" | "candidate";

/**
 * Mesaj türü
 * - text: normal yazı
 * - file: dosya / ek
 * - system: sistem bildirimi (okundu, görüşme, vb.)
 */
export type CorporateMessageType =
  | "text"
  | "file"
  | "system";

/* ------------------------------------------------------------------ */
/* MESSAGE                                                             */
/* ------------------------------------------------------------------ */

export type CorporateMessage = {
  id: string;
  conversationId: string;

  sender: CorporateSender;
  type: CorporateMessageType;

  /** text & system mesajlar */
  text?: string;

  /** file mesajlar */
  fileName?: string;
  fileUri?: string;

  /** epoch ms */
  createdAt: number;
};

/* ------------------------------------------------------------------ */
/* CONVERSATION                                                        */
/* ------------------------------------------------------------------ */

export type CorporateConversation = {
  id: string;

  /* Bağlam (backend ile kesinleşir) */
  jobId?: string;
  applicationId?: string;

  /* Görünen başlık bilgileri */
  candidateName: string;
  companyName: string;

  /* Liste özet bilgileri */
  lastMessageText?: string;
  lastMessageAt: number;

  /** şirkete göre unread sayısı */
  unreadCount: number;
};