// src/domains/corporate/types/eventAnnouncement.types.ts

export type CorporateEvent = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  date: string;
  location?: string; // online / fiziksel
  createdAt: number;
};

export type Announcement = {
  id: string;
  companyId: string;
  title: string;
  body: string;
  createdAt: number;
};