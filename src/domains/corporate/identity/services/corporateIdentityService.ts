// src/domains/corporate/identity/services/corporateIdentityService.ts
// 🔒 Corporate Identity Storage (corporate-only)
// Identity ≠ Profile (LOCKED MIMARI)
// Avatar → SADECE Profile katmanında
//
// 🔒 ADIM 2 (KİLİTLİ):
// Kimlik tipi değişirse → veri karışması SIFIRLANIR
//
// STABLE FIXES:
// - AsyncStorage parse guard
// - type safe getType
// - profile ownerUserId guard
// - type change senkronizasyon güvenliği

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CorporateIdentity,
  CorporateIdentityType,
} from "../types/corporateIdentity.types";

/* ============================================================ */
/* STORAGE KEYS                                                 */
/* ============================================================ */

const KEY_TYPE = "@corporate_identity_type";
const KEY_IDENTITY = "@corporate_identity";
const KEY_PROFILE = "@corporate_identity_profile";

/* ============================================================ */
/* PROFILE TYPE                                                 */
/* ============================================================ */

export type CorporateIdentityProfile = {
  ownerUserId: string;

  /** Shared */
  avatarUri?: string | null;

  /** Individual */
  fullName?: string;
  title?: string;
  portfolioUrl?: string;

  /** Company */
  companyName?: string;
  companyTitle?: string;
  websiteUrl?: string;
};

/* ============================================================ */
/* INTERNAL HELPERS                                             */
/* ============================================================ */

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function cleanProfileForType(
  profile: CorporateIdentityProfile,
  type: CorporateIdentityType
): CorporateIdentityProfile {
  // Avatar her zaman korunur
  const base: CorporateIdentityProfile = {
    ownerUserId: profile.ownerUserId,
    avatarUri: profile.avatarUri ?? null,
  };

  if (type === "individual") {
    return {
      ...base,
      fullName: profile.fullName,
      title: profile.title,
      portfolioUrl: profile.portfolioUrl,
    };
  }

  if (type === "company") {
    return {
      ...base,
      companyName: profile.companyName,
      companyTitle: profile.companyTitle,
      websiteUrl: profile.websiteUrl,
    };
  }

  return base;
}

/* ============================================================ */
/* SERVICE                                                      */
/* ============================================================ */

class CorporateIdentityService {
  /* ========================== TYPE ========================== */

  async getType(): Promise<CorporateIdentityType | null> {
    const raw = await AsyncStorage.getItem(KEY_TYPE);

    if (!raw) return null;

    if (raw === "individual" || raw === "company") {
      return raw;
    }

    return null;
  }

  /**
   * 🔒 SAFE TYPE CHANGE
   * - Eski tipe ait alanlar temizlenir
   * - Avatar korunur
   * - Identity + Profile senkron kalır
   */
  async setType(type: CorporateIdentityType) {
    const prevType = await this.getType();

    if (prevType === type) {
      await AsyncStorage.setItem(KEY_TYPE, type);
      return;
    }

    await AsyncStorage.setItem(KEY_TYPE, type);

    /* PROFILE CLEAN */

    const profile = await this.getProfile();

    if (profile) {
      const cleaned = cleanProfileForType(profile, type);
      await this.setProfile(cleaned);
    }

    /* IDENTITY SYNC */

    const identity = await this.getIdentity();

    if (identity) {
      await this.setIdentity({
        ...identity,
        type,
      });
    }
  }

  /* ======================== IDENTITY ======================== */

  async getIdentity(): Promise<CorporateIdentity | null> {
    const raw = await AsyncStorage.getItem(KEY_IDENTITY);

    const parsed = safeParse<CorporateIdentity>(raw);

    return parsed;
  }

  async setIdentity(identity: CorporateIdentity) {
    if (!identity) return;

    await AsyncStorage.setItem(KEY_IDENTITY, JSON.stringify(identity));
  }

  /* ========================= PROFILE ======================== */

  async getProfile(): Promise<CorporateIdentityProfile | null> {
    const raw = await AsyncStorage.getItem(KEY_PROFILE);

    const parsed = safeParse<CorporateIdentityProfile>(raw);

    return parsed;
  }

  async setProfile(profile: CorporateIdentityProfile) {
    if (!profile) return;

    if (!profile.ownerUserId) {
      console.warn(
        "CorporateIdentityService.setProfile called without ownerUserId"
      );
      return;
    }

    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
  }

  /* ========================== CLEAR ========================= */

  async clearAll() {
    await AsyncStorage.multiRemove([
      KEY_TYPE,
      KEY_IDENTITY,
      KEY_PROFILE,
    ]);
  }
}

/* ============================================================ */

export const corporateIdentityService = new CorporateIdentityService();