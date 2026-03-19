// src/domains/corporate/services/eventAnnouncementService.ts

import {
    Announcement,
    CorporateEvent,
} from "../types/eventAnnouncement.types";

const EVENTS: CorporateEvent[] = [];
const ANNOUNCEMENTS: Announcement[] = [];

class EventAnnouncementService {
  async getEvents(companyId: string) {
    return EVENTS.filter((e) => e.companyId === companyId);
  }

  async createEvent(e: CorporateEvent) {
    EVENTS.unshift(e);
  }

  async getAnnouncements(companyId: string) {
    return ANNOUNCEMENTS.filter((a) => a.companyId === companyId);
  }

  async createAnnouncement(a: Announcement) {
    ANNOUNCEMENTS.unshift(a);
  }
}

export const eventAnnouncementService =
  new EventAnnouncementService();