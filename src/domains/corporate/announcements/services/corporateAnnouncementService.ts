// src/domains/corporate/announcements/services/corporateAnnouncementService.ts

import { CorporateAnnouncement } from "../types/announcement.types";

function makeId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

const DATA: CorporateAnnouncement[] = [
  {
    id: "a1",
    companyId: "c1",
    companyName: "ConnectLine Tech",
    type: "announcement",
    title: "Yeni Staj Programı",
    description: "Yaz dönemi için staj başvuruları açıldı.",
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
  },
  {
    id: "e1",
    companyId: "c1",
    companyName: "ConnectLine Tech",
    type: "event",
    title: "Frontend Kariyer Günü",
    description: "Uzmanlarımızla canlı yayın.",
    eventDate: Date.now() + 5 * 24 * 60 * 60_000,
    isOnline: true,
    createdAt: Date.now() - 1 * 24 * 60 * 60_000,
  },
];

class CorporateAnnouncementService {
  async list(): Promise<CorporateAnnouncement[]> {
    return [...DATA].sort((a, b) => b.createdAt - a.createdAt);
  }

  async create(
    payload: Omit<CorporateAnnouncement, "id" | "createdAt">
  ): Promise<CorporateAnnouncement> {
    const item: CorporateAnnouncement = {
      ...payload,
      id: makeId(),
      createdAt: Date.now(),
    };
    DATA.unshift(item);
    return item;
  }
}

export const corporateAnnouncementService =
  new CorporateAnnouncementService();