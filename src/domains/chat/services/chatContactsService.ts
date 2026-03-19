import * as Contacts from "expo-contacts";

export type DeviceContact = {
  id: string;
  name: string;
  phone?: string;
  avatarUri?: string;
};

class ChatContactsService {
  async getContacts(): Promise<DeviceContact[]> {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") return [];

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Image,
      ],
    });

    return data.map((c) => ({
      id: c.id,
      name: c.name ?? "Bilinmeyen",
      phone: c.phoneNumbers?.[0]?.number,
      avatarUri: c.imageAvailable ? c.image?.uri : undefined,
    }));
  }
}

export const chatContactsService = new ChatContactsService();