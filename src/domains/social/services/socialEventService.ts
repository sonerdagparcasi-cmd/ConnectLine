// src/domains/social/services/socialEventService.ts
// 🔒 SOCIAL EVENT SERVICE (UI-ONLY)
// UPDATE:
// - Event Cover Photo
// - Event Invite System

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