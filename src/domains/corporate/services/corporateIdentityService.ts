import { CorporateContext } from "../types/corporate.types";

type StoredCorporateContext = CorporateContext & { updatedAt: number };

// Basit in-memory mock. İstersen sonra AsyncStorage’a taşırız (core’a değil, corporate domain içinde).
let memory: StoredCorporateContext | null = null;

class CorporateIdentityService {
  getActiveContext(): CorporateContext | null {
    return memory;
  }

  setActiveContext(ctx: CorporateContext) {
    memory = { ...ctx, updatedAt: Date.now() };
  }

  clear() {
    memory = null;
  }

  // Demo: ilk açılışta kullanıcı yoksa bireysel döndür
  ensureDefault(): CorporateContext {
    if (memory) return memory;
    const def: CorporateContext = {
      kind: "individual",
      individualProfileId: "ind_1",
      displayName: "Ben",
      title: "Kurumsal Profil",
      activeApplicationsCount: 0,
      profileCompleteness: 35,
    };
    this.setActiveContext(def);
    return def;
  }
}

export const corporateIdentityService = new CorporateIdentityService();