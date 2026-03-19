// src/domains/corporate/announcements/hooks/useCorporateAnnouncements.ts

import { useEffect, useState } from "react";
import { corporateAnnouncementService } from "../services/corporateAnnouncementService";
import { CorporateAnnouncement } from "../types/announcement.types";

export function useCorporateAnnouncements() {
  const [items, setItems] = useState<CorporateAnnouncement[]>([]);

  async function refresh() {
    const list = await corporateAnnouncementService.list();
    setItems(list);
  }

  async function create(
    payload: Omit<CorporateAnnouncement, "id" | "createdAt">
  ) {
    await corporateAnnouncementService.create(payload);
    await refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  return { items, refresh, create };
}