import { normalizePhone } from "../utils/phone";

export type DirectoryUser = {
  id: string;
  name: string;
  phone: string; // normalize edilmiş
  avatarUri?: string;
};

class ChatUserDirectoryService {
  // şimdilik mock. ileride backend’den gelir.
  private users: DirectoryUser[] = [
    { id: "u_1", name: "Ali", phone: normalizePhone("+90 555 111 22 33") },
  ];

  findByPhone(phoneRaw?: string) {
    const phone = normalizePhone(phoneRaw);
    return this.users.find((u) => u.phone === phone);
  }
}

export const chatUserDirectoryService = new ChatUserDirectoryService();