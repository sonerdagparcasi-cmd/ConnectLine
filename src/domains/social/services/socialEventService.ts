// src/domains/social/services/socialEventService.ts
// 🔒 SOCIAL EVENT SERVICE (UI-ONLY)
// UPDATE:
// - Event Cover Photo
// - Event Invite System
import { emitSocialEvent } from "./socialFeedStateService";
import type {
  SocialEvent,
  SocialEventParticipant as ModelParticipant,
  SocialEventRole,
} from "../types/social.types";

export type Role = "OWNER" | "MEMBER";

export interface Participant {
  userId: string;
  role: Role;
}

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

export type UiSocialEvent = {
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

const mockEvents: UiSocialEvent[] = [
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
let events: SocialEvent[] = [];
const normalizeParticipants = (event: SocialEvent): ModelParticipant[] => {
  const safe = Array.isArray((event as any).participants)
    ? ([...(event as any).participants] as ModelParticipant[])
    : [];

  const exists = safe.some((participant) => participant.userId === event.createdBy);

  if (!exists && event.createdBy) {
    safe.unshift({
      userId: event.createdBy,
      role: "OWNER",
    });
  }

  return safe;
};

const normalizeEvent = (event: SocialEvent): SocialEvent => {
  return {
    ...event,
    participants: normalizeParticipants(event),
    createdAt: event.createdAt || Date.now(),
  };
};
type EventInvite = {
  id: string;
  eventId: string;
  fromUserId: string;
  toUserId: string;
  createdAt: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
};
let invites: EventInvite[] = [];
type AdminInvite = {
  eventId: string;
  userId: string;
  invitedBy: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};
let adminInvites: AdminInvite[] = [];

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const socialEventService = {
  async getEvents(): Promise<UiSocialEvent[]> {
    return Promise.resolve([...mockEvents]);
  },

  /** Events where user is host or in participantList (for profile stats + Events tab) */
  async getEventsByUser(userId: string): Promise<UiSocialEvent[]> {
    const events = await this.getEvents();
    return events.filter(
      (e) =>
        e.hostId === userId ||
        e.participantList.some((p) => p.userId === userId)
    );
  },

  async getEventById(id: string): Promise<UiSocialEvent | null> {
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
    const newEvent: UiSocialEvent = {
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

  isOwner(event: UiSocialEvent) {
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
const getUserRole = (event: SocialEvent, userId: string) => {
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
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;

  const event = normalizeEvent(events[eventIndex]);
  if (event.createdBy === userId) {
    return event;
  }
  const existing = event.participants.find((participant) => participant.userId === userId);

  if (existing) {
    return event;
  }

  event.participants.push({
    userId,
    role: "PENDING",
  });
  events[eventIndex] = event;
  return event;
};

/**
 * 🔥 APPROVE (OWNER + ADMIN)
 */
export const approveParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;
  const event = normalizeEvent(events[eventIndex]);

  const manager = getMyRole(eventId, managerId);
  if (manager !== "OWNER" && manager !== "ADMIN") {
    return event;
  }

  event.participants = event.participants.map((participant) =>
    participant.userId === targetUserId
      ? { ...participant, role: "MEMBER" }
      : participant
  );
  events[eventIndex] = event;
  return event;
};

/**
 * 🔥 REJECT (tek kişi yeterli)
 */
export const rejectParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;
  const event = normalizeEvent(events[eventIndex]);

  const manager = getMyRole(eventId, managerId);
  if (manager !== "OWNER" && manager !== "ADMIN") return event;

  event.participants = event.participants.map((participant) =>
    participant.userId === targetUserId
      ? { ...participant, role: "REJECTED" }
      : participant
  );
  events[eventIndex] = event;
  return event;
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
  const role = getMyRole(eventId, userId);
  if (role === "OWNER") return true;
  return role === "ADMIN" || role === "MEMBER";
};

export const canViewParticipants = (eventId: string, userId: string) => {
  const role = getMyRole(eventId, userId);
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
};

export const canManageEvent = (eventId: string, userId: string) => {
  const role = getMyRole(eventId, userId);
  return role === "OWNER" || role === "ADMIN";
};

/**
 * 🔥 MANAGER KONTROL
 */
export const kickParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;
  const event = normalizeEvent(events[eventIndex]);
  const managerRole = getMyRole(eventId, managerId);

  if (managerRole !== "OWNER" && managerRole !== "ADMIN") return event;
  if (targetUserId === event.createdBy) return event;

  event.participants = event.participants.filter(
    (participant) => participant.userId !== targetUserId
  );
  events[eventIndex] = event;
  return event;
};

/**
 * 🔥 BAN (katılım + chat engel)
 */
export const banParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;
  const event = normalizeEvent(events[eventIndex]);
  const managerRole = getMyRole(eventId, managerId);

  if (managerRole !== "OWNER" && managerRole !== "ADMIN") return event;
  if (targetUserId === event.createdBy) return event;

  event.participants = event.participants.map((participant) =>
    participant.userId === targetUserId
      ? { ...participant, role: "BANNED" }
      : participant
  );
  events[eventIndex] = event;
  return event;
};

/**
 * 🔥 MUTE (sadece chat engel)
 */
export const muteParticipant = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;
  const event = normalizeEvent(events[eventIndex]);
  const managerRole = getMyRole(eventId, managerId);

  if (managerRole !== "OWNER" && managerRole !== "ADMIN") return event;
  if (targetUserId === event.createdBy) return event;

  event.participants = event.participants.map((participant) =>
    participant.userId === targetUserId
      ? { ...participant, role: "REJECTED" }
      : participant
  );
  events[eventIndex] = event;
  return event;
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
  event: Omit<SocialEvent, "participants" | "createdAt"> & {
    admins?: string[];
  }
) => {
  const adminIds = Array.isArray(event.admins) ? event.admins.slice(0, 2) : [];

  const participants: ModelParticipant[] = [
    {
      userId: event.createdBy,
      role: "OWNER",
    },
    ...adminIds
      .filter((userId) => userId && userId !== event.createdBy)
      .map((userId) => ({
        userId,
        role: "ADMIN" as SocialEventRole,
      })),
  ];

  const newEvent: SocialEvent = {
    ...event,
    participants,
    createdAt: Date.now(),
  };

  events.unshift(newEvent);
  return newEvent;
};

export const getEventById = (eventId: string) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return undefined;

  const safeParticipants = Array.isArray(event.participants)
    ? [...event.participants]
    : [];

  if (
    event.createdBy &&
    !safeParticipants.some((p) => p.userId === event.createdBy)
  ) {
    safeParticipants.unshift({
      userId: event.createdBy,
      role: "OWNER",
    });
  }

  return {
    ...event,
    participants: safeParticipants,
  };
};

export const updateEvent = (
  eventId: string,
  payload: Partial<
    Pick<SocialEvent, "title" | "description" | "date" | "time" | "location">
  > & { coverImage?: string }
) => {
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;

  const event = events[eventIndex];
  const updated: SocialEvent = {
    ...event,
    ...payload,
  };

  events[eventIndex] = normalizeEvent(updated);
  return events[eventIndex];
};

export const joinEvent = (eventId: string, userId: string) => {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  const exists = event.participants.find((p) => p.userId === userId);
  if (exists) return;

  event.participants.push({
    userId,
    role: "MEMBER",
  });

  return event;
};

export const leaveEvent = (eventId: string, userId: string) => {
  const eventIndex = events.findIndex((item) => item.id === eventId);
  if (eventIndex === -1) return;
  const event = normalizeEvent(events[eventIndex]);

  if (event.createdBy === userId) return event;

  event.participants = event.participants.filter(
    (participant) => participant.userId !== userId
  );
  events[eventIndex] = event;
  return event;
};

export const getMyRole = (
  eventId: string,
  userId: string
): SocialEventRole | null => {
  const event = getEventById(eventId);
  if (!event) return null;

  if (event.createdBy === userId) return "OWNER";

  return (
    event.participants.find((participant) => participant.userId === userId)?.role ||
    null
  );
};

/**
 * 🔥 EVENT SCORE (growth motoru)
 */
const calculateEventScore = (event: SocialEvent) => {
  const participantCount = event.participants.length;

  const recencyScore =
    Date.now() - event.createdAt < 1000 * 60 * 60 * 24 ? 50 : 10;

  const activityScore = participantCount * 5;

  return recencyScore + activityScore;
};

/**
 * 🔥 TRENDING EVENTS
 */
export const getTrendingEvents = () => {
  return [...events]
    .sort((a, b) => calculateEventScore(b) - calculateEventScore(a))
    .slice(0, 10);
};

/**
 * 🔥 DISCOVER EVENTS
 */
export const getDiscoverEvents = (userId: string) => {
  return events
    .filter((e) => {
      const joined = e.participants.find((p) => p.userId === userId);
      return !joined;
    })
    .sort((a, b) => calculateEventScore(b) - calculateEventScore(a));
};

export const getPersonalizedEvents = (userId: string) => {
  return events
    .map((event) => {
      let score = calculateEventScore(event);

      // Ayni sehir bonusu (mock; event modelinde location yoksa no-op)
      if ((event as any).location?.includes?.("İstanbul")) score += 20;

      const friendJoined = event.participants.some((p) =>
        p.userId.startsWith("user_")
      );

      if (friendJoined) score += 30;

      return { event, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((e) => e.event);
};

export const inviteAdmin = (
  eventId: string,
  managerId: string,
  targetUserId: string
) => {
  adminInvites.push({
    eventId,
    userId: targetUserId,
    invitedBy: managerId,
    status: "PENDING",
  });
};

export const acceptAdminInvite = (eventId: string, userId: string) => {
  const event = getEventById(eventId);
  if (!event) return;

  adminInvites = adminInvites.map((i) =>
    i.eventId === eventId && i.userId === userId
      ? { ...i, status: "ACCEPTED" }
      : i
  );

  const exists = event.participants.find((p) => p.userId === userId);
  if (exists) {
    event.participants = event.participants.map((p) =>
      p.userId === userId ? { ...p, role: "ADMIN" } : p
    );
    return;
  }

  event.participants.push({
    userId,
    role: "ADMIN",
  });
};

export const getMyAdminInvites = (userId: string) => {
  return adminInvites.filter((i) => i.userId === userId && i.status === "PENDING");
};

/**
 * 🔥 EVENT SHARE LINK
 */
export const generateEventLink = (eventId: string) => {
  return `connectline://event/${eventId}`;
};

/**
 * 🔥 DAVET GÖNDER
 */
export const sendEventInvite = (
  eventId: string,
  fromUserId: string,
  toUserId: string
) => {
  invites.unshift({
    id: Math.random().toString(),
    eventId,
    fromUserId,
    toUserId,
    createdAt: Date.now(),
    status: "PENDING",
  });
};

/**
 * 🔥 DAVETLERİ GETİR
 */
export const getMyEventInvites = (userId: string) => {
  return invites.filter((i) => i.toUserId === userId && i.status === "PENDING");
};

/**
 * 🔥 DAVET KABUL
 */
export const acceptEventInvite = (inviteId: string) => {
  const invite = invites.find((i) => i.id === inviteId);
  if (!invite) return;

  invite.status = "ACCEPTED";
  requestToJoin(invite.eventId, invite.toUserId);
};

/**
 * 🔥 DAVET RED
 */
export const declineEventInvite = (inviteId: string) => {
  const invite = invites.find((i) => i.id === inviteId);
  if (!invite) return;

  invite.status = "DECLINED";
};

export const boostEventScore = (eventId: string) => {
  const event = getEventById(eventId);
  if (!event) return;

  const inviteCount = invites.filter((i) => i.eventId === eventId).length;
  return inviteCount * 10;
};