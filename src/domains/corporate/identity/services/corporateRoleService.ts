// src/domains/corporate/identity/services/corporateRoleService.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CorporateRole } from "../types/corporateRole.types";

const KEY = "corporate_role";

class CorporateRoleService {
  async get(): Promise<CorporateRole | null> {
    const r = await AsyncStorage.getItem(KEY);
    return r as CorporateRole | null;
  }

  async set(role: CorporateRole) {
    await AsyncStorage.setItem(KEY, role);
    return role;
  }

  async clear() {
    await AsyncStorage.removeItem(KEY);
  }
}

export const corporateRoleService =
  new CorporateRoleService();