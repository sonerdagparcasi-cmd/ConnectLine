// src/domains/social/services/socialEventService.ts
// 🔒 SOCIAL EVENT SERVICE (UI-ONLY)
// UPDATE:
// - Event Cover Photo
// - Event Invite System
import { emitSocialEvent } from "./socialFeedStateService";
import type { SocialEvent as RoleSocialEvent } from "../types/social.types";

export type SocialEventParticipant = {
  userId: string;
  username: string;
  joinedAt: string;
};

/* ------------------------------------------------------------------ */
/* INVITE TYPE (NEW)                                                  */
/* ------------------------------------------------------------------ */

export type SocialEventInvite = {
  id: string;
  eventId: string;
  eventTitle: string;

  fromUserId: string;
  fromUsername: string;

  toUserId: string;
  toUsername: string;

  createdAt: string;
};

/* ------------------------------------------------------------------ */

export type SocialEvent = {
  id: string;

  title: string;
  description?: string;

  date: string;
  time?: string;

  location?: string;

  coverImage?: string;

  hostId: string;
  hostName: string;

  participants: number;

  participantList: SocialEventParticipant[];

  isJoined: boolean;
};

/* ------------------------------------------------------------------ */
/* MOCK USER                                                          */
/* ------------------------------------------------------------------ */

const CURRENT_USER = {
  userId: "u1",
  username: "Ben",
};

/* ------------------------------------------------------------------ */
/* INVITES STORAGE (NEW)                                              */
/* ------------------------------------------------------------------ */

let mockInvites: SocialEventInvite[] = [];

/* ------------------------------------------------------------------ */
/* MOCK EVENTS                                                        */
/* ------------------------------------------------------------------ */

const mockEvents: SocialEvent[] = [
  {
    id: "e1",
    title: "Topluluk Buluşması",
    description: "Sosyal kullanıcılar için tanışma etkinliği",
    date: "2026-03-01",
    time: "19:00",
    location: "İstanbul",
    coverImage:
      "https://images.unsplash.com/photo-1515169067868-5387ec356754",
    hostId: "u2",
    hostName: "Ali",
    participants: 2,
    participantList: [
      {
        userId: "u2",
        username: "Ali",
        joinedAt: "2026-02-20 18:20",
      },
      {
        userId: "u3",
        username: "Ayşe",
        joinedAt: "2026-02-21 09:12",
      },
    ],
    isJoined: false,
  },
  {
    id: "e2",
    title: "Networking Night",
    description: "Girişimciler ve geliştiriciler buluşuyor",
    date: "2026-03-10",
    time: "20:00",
    location: "Online",
    coverImage:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    hostId: "u3",
    hostName: "Ayşe",
    participants: 1,
    participantList: [
      {
        userId: "u3",
        username: "Ayşe",
        joinedAt: "2026-02-22 11:30",
      },
    ],
    isJoined: true,
  },
];
let events: RoleSocialEvent[] = [];

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const socialEventService = {
  async getEvents(): Promise<SocialEvent[]> {
    return Promise.resolve([...mockEvents]);
  },

  /** Events where user is host or in participantList (for profile stats + Events tab) */
  async getEventsByUser(userId: string): Promise<SocialEvent[]> {
    const events = await this.getEvents();
    return events.filter(
      (e) =>
        e.hostId === userId ||
        e.participantList.some((p) => p.userId === userId)
    );
  },

  async getEventById(id: string): Promise<SocialEvent | null> {
    return Promise.resolve(mockEvents.find((e) => e.id === id) ?? null);
  },

  async createEvent(payload: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
    coverImage?: string;
  }) {
    const newEvent: SocialEvent = {
      id: `e_${Date.now()}`,
      title: payload.title,
      description: payload.description,
      date: payload.date,
      time: payload.time,
      location: payload.location,
      coverImage: payload.coverImage,
      hostId: CURRENT_USER.userId,
      hostName: CURRENT_USER.username,
      participants: 1,
      participantList: [
        {
          userId: CURRENT_USER.userId,
          username: CURRENT_USER.username,
          joinedAt: new Date().toISOString(),
        },
      ],
      isJoined: true,
    };

    mockEvents.unshift(newEvent);
  },

  async updateEvent(
    id: string,
    payload: {
      title?: string;
      description?: string;
      date?: string;
      time?: string;
      location?: string;
      coverImage?: string;
    }
  ) {
    const e = mockEvents.find((x) => x.id === id);

    if (!e) return;
    if (e.hostId !== CURRENT_USER.userId) return;

    if (payload.title !== undefined) e.title = payload.title;
    if (payload.description !== undefined) e.description = payload.description;
    if (payload.date !== undefined) e.date = payload.date;
    if (payload.time !== undefined) e.time = payload.time;
    if (payload.location !== undefined) e.location = payload.location;
    if (payload.coverImage !== undefined) e.coverImage = payload.coverImage;
  },

  async deleteEvent(id: string) {
    const index = mockEvents.findIndex((x) => x.id === id);

    if (index === -1) return;

    const e = mockEvents[index];

    if (e.hostId !== CURRENT_USER.userId) return;

    mockEvents.splice(index, 1);
  },

  isOwner(event: SocialEvent) {
    return event.hostId === CURRENT_USER.userId;
  },

  async joinEvent(id: string) {
    const e = mockEvents.find((x) => x.id === id);

    if (!e) return;

    const already = e.participantList.find(
      (p) => p.userId === CURRENT_USER.userId
    );

    if (already) return;

    const participant: SocialEventParticipant = {
      userId: CURRENT_USER.userId,
      username: CURRENT_USER.username,
      joinedAt: new Date().toISOString(),
    };

    e.participantList.push(participant);

    e.participants = e.participantList.length;

    e.isJoined = true;
  },

  async leaveEvent(id: string) {
    const e = mockEvents.find((x) => x.id === id);

    if (!e) return;

    e.participantList = e.participantList.filter(
      (p) => p.userId !== CURRENT_USER.userId
    );

    e.participants = e.participantList.length;

    e.isJoined = false;
  },

  async getParticipants(id: string): Promise<SocialEventParticipant[]> {
    const e = mockEvents.find((x) => x.id === id);

    if (!e) return [];

    return [...e.participantList];
  },

  /* ------------------------------------------------------------------ */
  /* INVITE SYSTEM (NEW)                                                */
  /* ------------------------------------------------------------------ */

  async inviteUserToEvent(eventId: string, toUserId: string, toUsername: string) {
    const event = mockEvents.find((e) => e.id === eventId);

    if (!event) return;

    const invite: SocialEventInvite = {
      id: `inv_${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      fromUserId: CURRENT_USER.userId,
      fromUsername: CURRENT_USER.username,
      toUserId,
      toUsername,
      createdAt: new Date().toISOString(),
    };

    mockInvites.unshift(invite);
    emitSocialEvent({
      type: "EVENT_INVITE",
      userId: CURRENT_USER.userId,
      actorUsername: CURRENT_USER.username,
      targetUserId: toUserId,
      eventId: event.id,
      eventTitle: event.title,
    });
  },

  async getInvitesForUser(userId: string) {
    return mockInvites.filter((i) => i.toUserId === userId);
  },

  async acceptInvite(inviteId: string) {
    const invite = mockInvites.find((i) => i.id === inviteId);

    if (!invite) return;

    await this.joinEvent(invite.eventId);

    mockInvites = mockInvites.filter((i) => i.id !== inviteId);
  },

  async rejectInvite(inviteId: string) {
    mockInvites = mockInvites.filter((i) => i.id !== inviteId);
  },

  async getEventInvitedUsers(eventId: string) {
    return mockInvites.filter((i) => i.eventId === eventId);
  },
};

export const isValidTime = (value: string) => {
  // sadece HH:mm formatı
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(value);
};

export const isValidDate = (value: string) => {
  // YYYY-MM-DD format
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  if (!regex.test(value)) return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
};

export const isFutureDate = (value: string) => {
  const today = new Date();
  const input = new Date(value);

  today.setHours(0, 0, 0, 0);
  input.setHours(0, 0, 0, 0);

  return input >= today;
};

/**
 * 🔥 GET ROLE
 */
const getUserRole = (event: RoleSocialEvent, userId: string) => {
  return event.participants.find((p) => p.userId === userId)?.role;
};

/**
 * 🔥 JOIN REQUEST MODEL (çoklu onay)
 */
type JoinApproval = {
  userId: string; // başvuran kişi
  approvedBy: string[]; // kimler onayladı
};

const joinApprovals: Record<string, JoinApproval[]> = {};
// eventId → approvals list

/**
 * JOIN REQUEST (PENDING + approval başlat)
 */
export const requestToJoin = (eventId: string, userId: string) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  const exists = event.participants.find((p) => p.userId === userId);
  if (exists) return;

  event.participants.push({
    userId,
    role: "PENDING",
  });

  if (!joinApprovals[eventId]) {
    joinApprovals[eventId] = [];
  }

  joinApprovals[eventId].push({
    userId,
    approvedBy: [],
  });
};

/**
 * 🔥 APPROVE (OWNER + ADMIN)
 */
export const approveParticipant = (
  eventId: string,
  targetUserId: string,
  approverId: string
) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  const approver = event.participants.find((p) => p.userId === approverId);

  // sadece OWNER / ADMIN onaylayabilir
  if (!approver || (approver.role !== "OWNER" && approver.role !== "ADMIN")) {
    return;
  }

  const approvals = joinApprovals[eventId];
  if (!approvals) return;

  const record = approvals.find((a) => a.userId === targetUserId);
  if (!record) return;

  // aynı kişi 2 kere onaylayamaz
  if (record.approvedBy.includes(approverId)) return;

  record.approvedBy.push(approverId);

  /**
   * 🔥 GEREKLİ ONAY SAYISI
   * OWNER + ADMIN sayısı kadar
   */
  const requiredApprovals = event.participants.filter(
    (p) => p.role === "OWNER" || p.role === "ADMIN"
  ).length;

  if (record.approvedBy.length >= requiredApprovals) {
    // FULL APPROVED → MEMBER
    event.participants = event.participants.map((p) =>
      p.userId === targetUserId ? { ...p, role: "MEMBER" } : p
    );
  }
};

/**
 * 🔥 REJECT (tek kişi yeterli)
 */
export const rejectParticipant = (eventId: string, targetUserId: string) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  event.participants = event.participants.map((p) =>
    p.userId === targetUserId ? { ...p, role: "REJECTED" } : p
  );

  // approval kaydını sil
  if (joinApprovals[eventId]) {
    joinApprovals[eventId] = joinApprovals[eventId].filter(
      (a) => a.userId !== targetUserId
    );
  }
};

/**
 * 🔥 APPROVAL STATUS (UI için)
 */
export const getApprovalStatus = (eventId: string, userId: string) => {
  const approvals = joinApprovals[eventId];
  if (!approvals) return null;

  const record = approvals.find((a) => a.userId === userId);
  if (!record) return null;

  return {
    approvedCount: record.approvedBy.length,
  };
};

/**
 * 🔥 CHAT ACCESS CONTROL
 */
export const canAccessEventChat = (eventId: string, userId: string) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return false;

  const participant = event.participants.find((p) => p.userId === userId);
  if (!participant) return false;

  return (
    participant.role === "OWNER" ||
    participant.role === "ADMIN" ||
    participant.role === "MEMBER"
  );
};

/**
 * 🔥 CHAT ACCESS (KESİN KURAL)
 * SADECE OWNER / ADMIN / MEMBER mesaj atabilir
 * PENDING / REJECTED / BANNED → TAM ENGEL
 */
export const canSendEventMessage = (eventId: string, userId: string) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return false;

  const participant = event.participants.find((p) => p.userId === userId);
  if (!participant) return false;

  if (
    participant.role === "OWNER" ||
    participant.role === "ADMIN" ||
    participant.role === "MEMBER"
  ) {
    return true;
  }

  // 🔥 NET ENGEL
  return false;
};

/**
 * 🔥 YETKİ KONTROLÜ (OWNER / ADMIN)
 */
const isManager = (event: RoleSocialEvent, userId: string) => {
  const p = event.participants.find((x) => x.userId === userId);
  return p?.role === "OWNER" || p?.role === "ADMIN";
};

/**
 * 🔥 KULLANICIYI ETKİNLİKTEN AT (KICK)
 */
export const kickParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  if (!isManager(event, managerId)) return;

  // OWNER silinemez
  const target = event.participants.find((p) => p.userId === targetUserId);
  if (!target || target.role === "OWNER") return;

  event.participants = event.participants.filter((p) => p.userId !== targetUserId);
};

/**
 * 🔥 KULLANICIYI BANLA (CHAT + JOIN ENGEL)
 */
export const banParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  if (!isManager(event, managerId)) return;

  event.participants = event.participants.map((p) =>
    p.userId === targetUserId ? { ...p, role: "BANNED" } : p
  );
};

/**
 * 🔥 CHAT'TEN ENGELLE (sadece mesaj atamaz ama eventte kalır)
 */
export const muteParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  if (!isManager(event, managerId)) return;

  event.participants = event.participants.map((p) =>
    p.userId === targetUserId ? { ...p, role: "REJECTED" } : p
  );
};

/**
 * 🔥 ADD ADMIN (SADECE OWNER + MAX 2)
 */
export const addAdmin = (
  eventId: string,
  targetUserId: string,
  actorUserId: string
) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return { success: false, error: "EVENT_NOT_FOUND" as const };

  const actorRole = getUserRole(event, actorUserId);

  // ❗ sadece OWNER yetkili atayabilir
  if (actorRole !== "OWNER") {
    return { success: false, error: "NOT_ALLOWED" as const };
  }

  // ❗ max 2 admin
  const adminCount = event.participants.filter((p) => p.role === "ADMIN").length;
  if (adminCount >= 2) {
    return { success: false, error: "ADMIN_LIMIT" as const };
  }

  // ❗ kullanıcı event içinde mi
  const target = event.participants.find((p) => p.userId === targetUserId);
  if (!target) {
    return { success: false, error: "USER_NOT_IN_EVENT" as const };
  }

  // ❗ zaten admin mi
  if (target.role === "ADMIN") {
    return { success: false, error: "ALREADY_ADMIN" as const };
  }

  // ❗ OWNER admin yapılamaz (zaten en yüksek rol)
  if (target.role === "OWNER") {
    return { success: false, error: "INVALID_ROLE" as const };
  }

  // 🔥 ADMIN ATA
  event.participants = event.participants.map((p) =>
    p.userId === targetUserId ? { ...p, role: "ADMIN" } : p
  );

  return { success: true as const };
};

/**
 * 🔥 REMOVE ADMIN (geri MEMBER yap)
 */
export const removeAdmin = (
  eventId: string,
  targetUserId: string,
  actorUserId: string
) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  const actorRole = getUserRole(event, actorUserId);
  if (actorRole !== "OWNER") return;

  event.participants = event.participants.map((p) =>
    p.userId === targetUserId && p.role === "ADMIN"
      ? { ...p, role: "MEMBER" }
      : p
  );
};

export const createEvent = (
  event: RoleSocialEvent & { time: string; date: string }
) => {
  if (!isValidDate(event.date)) {
    throw new Error("INVALID_DATE");
  }

  if (!isValidTime(event.time)) {
    throw new Error("INVALID_TIME");
  }

  if (!isFutureDate(event.date)) {
    throw new Error("PAST_DATE");
  }

  events.unshift(event);
  return event;
};