// src/domains/corporate/onboarding/services/corporateOnboardingService.ts
// 🔒 STABLE SERVICE (UI-only)
// FIX:
// - JSON.parse bozuk veride patlamasın
// - Bozuk veri yakalanırsa reset + güvenli default
// - Role validasyonu (company/individual dışı değerleri yok say)

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "corporate_onboarding";

export type CorporateRole = "company" | "individual";

export type CorporateOnboardingState = {
  completed: boolean;
  role?: CorporateRole;
};

function isRole(v: any): v is CorporateRole {
  return v === "company" || v === "individual";
}

class CorporateOnboardingService {
  async get(): Promise<CorporateOnboardingState> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return { completed: false };

      const parsed = JSON.parse(raw);

      const completed = !!parsed?.completed;
      const role = isRole(parsed?.role) ? (parsed.role as CorporateRole) : undefined;

      return { completed, role };
    } catch {
      // Bozuk storage → temizle + güvenli state dön
      try {
        await AsyncStorage.removeItem(KEY);
      } catch {
        // sessiz
      }
      return { completed: false };
    }
  }

  async complete(role: CorporateRole): Promise<CorporateOnboardingState> {
    const safeRole: CorporateRole = isRole(role) ? role : "individual";

    const state: CorporateOnboardingState = {
      completed: true,
      role: safeRole,
    };

    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // sessiz (UI-only)
    }

    return state;
  }

  async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      // sessiz
    }
  }
}

export const corporateOnboardingService = new CorporateOnboardingService();