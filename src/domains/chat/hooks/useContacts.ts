import { useEffect, useState } from "react";
import type { Contact, ContactsPermission } from "../types/chat.types";

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type SyncState = "idle" | "loading" | "ready";

/**
 * ContactsSource
 * - UI-only (mock)
 * - Native (expo-contacts)
 * - Backend
 *
 * Şu an SADECE mock kullanılıyor.
 */
type ContactsSource = "mock";

/* ------------------------------------------------------------------ */
/* MOCK DATA (UI-ONLY)                                                 */
/* ------------------------------------------------------------------ */

const MOCK_CONTACTS: Contact[] = [
  {
    id: "c1",
    displayName: "Ahmet Yılmaz",
    phoneNumber: "+905551112233",
    userId: "user_1",
  },
  {
    id: "c2",
    displayName: "Ayşe Demir",
    phoneNumber: "+905551114455",
  },
  {
    id: "c3",
    displayName: "Mehmet Kaya",
    phoneNumber: "+905551119988",
    userId: "user_3",
  },
];

/* ------------------------------------------------------------------ */
/* ADAPTER (UI-ONLY)                                                   */
/* ------------------------------------------------------------------ */

async function loadFromMock(): Promise<Contact[]> {
  // async simülasyon (network / native)
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_CONTACTS;
}

/* ------------------------------------------------------------------ */
/* useContacts                                                         */
/* ------------------------------------------------------------------ */

/**
 * useContacts
 *
 * - Chat domain'e ÖZEL
 * - Tek veri kaynağı
 * - UI-only (şu an mock)
 * - Native / backend geldiğinde sadece adapter değişir
 */
export function useContacts() {
  const [state, setState] = useState<SyncState>("idle");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [source] = useState<ContactsSource>("mock");

  /**
   * permission
   * - Şimdilik mock: granted
   * - Native geldiğinde burada gerçek izin akışı yönetilecek
   */
  const [permission, setPermission] = useState<ContactsPermission>("granted");

  /* ----------------------------- */
  /* LOAD                          */
  /* ----------------------------- */

  async function loadContacts() {
    // mock modda izin her zaman var; gelecekte native izin akışı buraya bağlanacak
    if (permission === "denied") {
      setState("ready");
      setContacts([]);
      return;
    }

    setState("loading");

    try {
      let data: Contact[] = [];

      if (source === "mock") {
        data = await loadFromMock();
      }

      setContacts(data);
      setState("ready");
    } catch {
      // hata durumunda bile UI çökmez
      setContacts([]);
      setState("ready");
    }
  }

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------- */
  /* DERIVED DATA                  */
  /* ----------------------------- */

  const matched = contacts.filter((c: Contact) => Boolean(c.userId));

  const unmatched = contacts.filter((c: Contact) => !c.userId);

  /* ----------------------------- */
  /* API                           */
  /* ----------------------------- */

  return {
    permission, // notAsked | granted | denied (UI-only)
    state, // idle | loading | ready
    contacts, // tüm rehber
    matched, // uygulamada olanlar
    unmatched, // uygulamada olmayanlar
    reload: async () => {
      // "İzin ver" butonu için UI-only davranış
      if (permission === "notAsked") setPermission("granted");
      await loadContacts();
    },
    source, // debug / future use
  };
}