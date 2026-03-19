import AsyncStorage from "@react-native-async-storage/async-storage";

export type CorporateProfileDraft = {
  avatarUri?: string | null;

  /** shared */
  about?: string;
  career?: string;

  /** individual extended */
  country?: string;
  city?: string;
  school?: string;
  currentCompany?: string;
  currentRole?: string;
  portfolioUrl?: string;

  focusAreas?: string[];
  highlights?: string[];

  /** 🔒 ACTIVE PROFILE MODE */
  activeProfile?: "company" | "individual";

  /** 🔒 UI-ONLY */
  updatedAt?: number;
};

const KEY_PREFIX = "corporate.profileDraft.v2";

function key(companyId: string) {
  return `${KEY_PREFIX}:${companyId}`;
}

/* ------------------------------------------------ */
/* SAFE HELPERS                                     */
/* ------------------------------------------------ */

function safeArray(v: unknown): string[] | undefined {
  if (v === undefined) return undefined;

  if (!Array.isArray(v)) return [];

  return v
    .map((x) => String(x).trim())
    .filter(Boolean)
    .slice(0, 24);
}

function safeString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;

  const clean = v.trim();

  if (!clean) return "";

  return clean.slice(0, 240);
}

function safeParseJSON(raw: string | null) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ------------------------------------------------ */
/* SANITIZER                                        */
/* ------------------------------------------------ */

function sanitizeDraft(input: CorporateProfileDraft): CorporateProfileDraft {
  const clean: CorporateProfileDraft = {};

  if (input.avatarUri === null || typeof input.avatarUri === "string") {
    clean.avatarUri = input.avatarUri;
  }

  const about = safeString(input.about);
  if (about !== undefined) clean.about = about;

  const career = safeString(input.career);
  if (career !== undefined) clean.career = career;

  const country = safeString(input.country);
  if (country !== undefined) clean.country = country;

  const city = safeString(input.city);
  if (city !== undefined) clean.city = city;

  const school = safeString(input.school);
  if (school !== undefined) clean.school = school;

  const currentCompany = safeString(input.currentCompany);
  if (currentCompany !== undefined) clean.currentCompany = currentCompany;

  const currentRole = safeString(input.currentRole);
  if (currentRole !== undefined) clean.currentRole = currentRole;

  const portfolioUrl = safeString(input.portfolioUrl);
  if (portfolioUrl !== undefined) clean.portfolioUrl = portfolioUrl;

  const focus = safeArray(input.focusAreas);
  if (focus !== undefined) clean.focusAreas = focus;

  const highlights = safeArray(input.highlights);
  if (highlights !== undefined) clean.highlights = highlights;

  if (
    input.activeProfile === "company" ||
    input.activeProfile === "individual"
  ) {
    clean.activeProfile = input.activeProfile;
  }

  if (typeof input.updatedAt === "number") {
    clean.updatedAt = input.updatedAt;
  }

  return clean;
}

/* ------------------------------------------------ */
/* STORAGE                                          */
/* ------------------------------------------------ */

class CorporateProfileDraftStorage {
  async get(companyId: string): Promise<CorporateProfileDraft | null> {
    try {
      const raw = await AsyncStorage.getItem(key(companyId));

      const parsed = safeParseJSON(raw);

      if (!parsed) return null;

      return sanitizeDraft(parsed);
    } catch {
      return null;
    }
  }

  async set(companyId: string, draft: CorporateProfileDraft) {
    const clean = sanitizeDraft({
      ...draft,
      updatedAt: Date.now(),
    });

    await AsyncStorage.setItem(key(companyId), JSON.stringify(clean));
  }

  async patch(companyId: string, patch: CorporateProfileDraft) {
    try {
      const current = (await this.get(companyId)) ?? {};

      const merged: CorporateProfileDraft = {
        ...current,
        ...patch,

        activeProfile:
          patch.activeProfile ??
          current.activeProfile ??
          "company",

        updatedAt: Date.now(),
      };

      const clean = sanitizeDraft(merged);

      await AsyncStorage.setItem(
        key(companyId),
        JSON.stringify(clean)
      );
    } catch {}
  }

  async remove(companyId: string) {
    await AsyncStorage.removeItem(key(companyId));
  }
}

export const corporateProfileDraftStorage =
  new CorporateProfileDraftStorage();