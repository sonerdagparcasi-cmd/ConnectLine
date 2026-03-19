import { useEffect, useState } from "react";
import { chatContactsService, DeviceContact } from "../services/chatContactsService";

export function useDeviceContacts() {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatContactsService.getContacts().then((c) => {
      setContacts(c);
      setLoading(false);
    });
  }, []);

  return { contacts, loading };
}