// src/domains/corporate/announcements/types/announcement.types.ts

export type AnnouncementType = "announcement" | "event";

export type CorporateAnnouncement = {
  id: string;
  companyId: string;
  companyName: string;

  type: AnnouncementType;

  title: string;
  description: string;

  // EVENT only
  eventDate?: number;
  location?: string;
  isOnline?: boolean;

  createdAt: number;
};