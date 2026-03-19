// src/domains/corporate/hooks/useEvents.ts

import { useEffect, useState } from "react";
import { eventAnnouncementService } from "../services/eventAnnouncementService";
import {
    Announcement,
    CorporateEvent,
} from "../types/eventAnnouncement.types";

export function useEvents(companyId: string) {
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    eventAnnouncementService.getEvents(companyId).then(setEvents);
    eventAnnouncementService
      .getAnnouncements(companyId)
      .then(setAnnouncements);
  }, [companyId]);

  async function addEvent(e: CorporateEvent) {
    await eventAnnouncementService.createEvent(e);
    setEvents((p) => [e, ...p]);
  }

  async function addAnnouncement(a: Announcement) {
    await eventAnnouncementService.createAnnouncement(a);
    setAnnouncements((p) => [a, ...p]);
  }

  return { events, announcements, addEvent, addAnnouncement };
}