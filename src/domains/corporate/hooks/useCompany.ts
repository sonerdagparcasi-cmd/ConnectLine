// src/domains/corporate/hooks/useCompany.ts
// 🔒 CORPORATE COMPANY CONTEXT – TEK KAYNAK (STABLE FINAL)
// FIXED:
// - Identity → profileView akışı daha stabil
// - activeProfile kararı tek yerde normalize edilir
// - individual/company görünümü tek merkezden üretilir
// - profileCompletion aktif profile göre hesaplanır
// - follow sistemi optimistic + güvenli sınırlarla korunur
// - UI-only / mock / AsyncStorage mimarisi korunur

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { corporateIdentityService } from "../identity/services/corporateIdentityService";
import { companyService } from "../services/companyService";
import type { CorporateProfileDraft } from "../services/corporateProfileDraftStorage";
import { corporateProfileDraftStorage } from "../services/corporateProfileDraftStorage";
import type { Company } from "../types/company.types";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type DerivedSignals = {
  isRecentlyActive: boolean;
  socialProofText: string | null;
  followers: number;
  isFollowing: boolean;
  mutualConnections: number;
};

export type ProfileVisibility = "public" | "limited" | "private";
export type ActiveCorporateProfile = "company" | "individual";

export type CompanyProfileView = {
  avatarUri: string | null;
  displayName: string;
  displayTitle: string;
  about: string;
  career: string;
  focusAreas: string[];
  highlights: string[];
  city: string;
  country: string;
  school: string;
  currentCompany: string;
  currentRole: string;
};

type IdentityProfileLike = {
  avatarUri?: string | null;
  fullName?: string | null;
  title?: string | null;
  companyName?: string | null;
  companyTitle?: string | null;
};

export type IndividualDraft = {
  avatarUri: string | null;
  fullName: string;
  headline: string;
  portfolioUrl: string;
  country: string;
  city: string;
  school: string;
  currentCompany: string;
  currentRole: string;
  about: string;
  experience: string;
  focusAreas: string[];
  highlights: string[];
};

type NormalizedDraft = {
  avatarUri: string | null;
  about: string;
  career: string;
  focusAreas: string[];
  highlights: string[];
  activeProfile: ActiveCorporateProfile | null;
  updatedAt: number;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function norm(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((item) => norm(item)).filter(Boolean);
}

function toNullableUri(value: unknown): string | null {
  const parsed = norm(value);
  return parsed.length > 0 ? parsed : null;
}

function safeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function countFilled(values: unknown[]) {
  return values.filter((value) => {
    if (typeof value === "number") return value > 0;
    return norm(value).length > 0;
  }).length;
}

const INDIVIDUAL_STORAGE_KEY = "corporate:individual_profile_v1";
const EMPTY_DRAFT: NormalizedDraft = {
  avatarUri: null,
  about: "",
  career: "",
  focusAreas: [],
  highlights: [],
  activeProfile: null,
  updatedAt: 0,
};

/* -------------------------------------------------------------------------- */
/* NORMALIZERS                                                                */
/* -------------------------------------------------------------------------- */

function normalizeDraft(stored: CorporateProfileDraft | null | undefined): NormalizedDraft {
  return {
    avatarUri: toNullableUri(stored?.avatarUri),
    about: norm(stored?.about),
    career: norm(stored?.career),
    focusAreas: normalizeStringArray(stored?.focusAreas),
    highlights: normalizeStringArray(stored?.highlights),
    activeProfile:
      stored?.activeProfile === "individual" || stored?.activeProfile === "company"
        ? stored.activeProfile
        : null,
    updatedAt: safeNumber(stored?.updatedAt, 0),
  };
}

function normalizeIdentityProfile(raw: unknown): IdentityProfileLike | null {
  if (!raw || typeof raw !== "object") return null;

  const value = raw as Record<string, unknown>;

  return {
    avatarUri: toNullableUri(value.avatarUri),
    fullName: norm(value.fullName),
    title: norm(value.title),
    companyName: norm(value.companyName),
    companyTitle: norm(value.companyTitle),
  };
}

function normalizeIndividual(raw: unknown): IndividualDraft | null {
  if (!raw || typeof raw !== "object") return null;

  const value = raw as Record<string, unknown>;

  return {
    avatarUri: toNullableUri(value.avatarUri),
    fullName: norm(value.fullName),
    headline: norm(value.headline),
    portfolioUrl: norm(value.portfolioUrl),
    country: norm(value.country),
    city: norm(value.city),
    school: norm(value.school),
    currentCompany: norm(value.currentCompany),
    currentRole: norm(value.currentRole),
    about: norm(value.about),
    experience: norm(value.experience),
    focusAreas: normalizeStringArray(value.focusAreas),
    highlights: normalizeStringArray(value.highlights),
  };
}

function resolveActiveProfile(
  draft: NormalizedDraft,
  identityProfile: IdentityProfileLike | null,
  individualDraft: IndividualDraft | null
): ActiveCorporateProfile {
  if (draft.activeProfile === "individual" || draft.activeProfile === "company") {
    return draft.activeProfile;
  }

  const hasIndividualSignals =
    !!individualDraft &&
    countFilled([
      individualDraft.fullName,
      individualDraft.headline,
      individualDraft.currentRole,
      individualDraft.currentCompany,
      individualDraft.about,
      individualDraft.city,
      individualDraft.country,
      individualDraft.school,
    ]) > 0;

  if (hasIndividualSignals) return "individual";

  const hasCompanySignals =
    countFilled([
      identityProfile?.companyName,
      identityProfile?.companyTitle,
    ]) > 0;

  if (hasCompanySignals) return "company";

  return "company";
}

/* -------------------------------------------------------------------------- */
/* HOOK                                                                       */
/* -------------------------------------------------------------------------- */

export function useCompany(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [draft, setDraft] = useState<NormalizedDraft>(EMPTY_DRAFT);
  const [identityProfile, setIdentityProfile] = useState<IdentityProfileLike | null>(null);
  const [individualDraft, setIndividualDraft] = useState<IndividualDraft | null>(null);

  const [visibility, setVisibility] = useState<ProfileVisibility>("public");

  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const loadSeqRef = useRef(0);

  /* ------------------------------------------------------------------------ */
  /* LOAD                                                                     */
  /* ------------------------------------------------------------------------ */

  const loadAll = useCallback(async () => {
    const seq = ++loadSeqRef.current;

    try {
      const [c, currentUserId, storedDraft, storedIdentityProfile, rawIndividual] =
        await Promise.all([
          companyService.getCompany(companyId),
          companyService.getCurrentUserId(),
          corporateProfileDraftStorage.get(companyId),
          corporateIdentityService.getProfile(),
          AsyncStorage.getItem(INDIVIDUAL_STORAGE_KEY),
        ]);

      if (seq !== loadSeqRef.current) return;

      const normalizedDraft = normalizeDraft(storedDraft);
      const normalizedIdentity = normalizeIdentityProfile(storedIdentityProfile);
      const normalizedIndividual = rawIndividual
        ? normalizeIndividual(JSON.parse(rawIndividual))
        : null;

      setCompany(c ?? null);
      setIsOwner(!!c && c.ownerUserId === currentUserId);

      setFollowers(Math.max(0, safeNumber(c?.followers, 0)));
      setIsFollowing(!!c?.isFollowing);

      setDraft(normalizedDraft);
      setIdentityProfile(normalizedIdentity);
      setIndividualDraft(normalizedIndividual);

      setVisibility("public");
    } catch {
      if (seq !== loadSeqRef.current) return;

      setCompany(null);
      setIsOwner(false);
      setDraft(EMPTY_DRAFT);
      setIdentityProfile(null);
      setIndividualDraft(null);
      setFollowers(0);
      setIsFollowing(false);
      setVisibility("public");
    }
  }, [companyId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  /* ------------------------------------------------------------------------ */
  /* ACTIVE PROFILE                                                           */
  /* ------------------------------------------------------------------------ */

  const activeProfile = useMemo<ActiveCorporateProfile>(() => {
    return resolveActiveProfile(draft, identityProfile, individualDraft);
  }, [draft, identityProfile, individualDraft]);

  /* ------------------------------------------------------------------------ */
  /* FOLLOW SYSTEM                                                            */
  /* ------------------------------------------------------------------------ */

  const follow = useCallback(async () => {
    if (!company || isFollowing) return;

    const prevFollowers = followers;
    const nextFollowers = prevFollowers + 1;

    setFollowers(nextFollowers);
    setIsFollowing(true);

    try {
      await companyService.followCompany(companyId);
    } catch {
      setFollowers(prevFollowers);
      setIsFollowing(false);
    }
  }, [company, companyId, followers, isFollowing]);

  const unfollow = useCallback(async () => {
    if (!company || !isFollowing) return;

    const prevFollowers = followers;
    const nextFollowers = Math.max(0, prevFollowers - 1);

    setFollowers(nextFollowers);
    setIsFollowing(false);

    try {
      await companyService.unfollowCompany(companyId);
    } catch {
      setFollowers(prevFollowers);
      setIsFollowing(true);
    }
  }, [company, companyId, followers, isFollowing]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing) {
      await unfollow();
      return;
    }
    await follow();
  }, [isFollowing, follow, unfollow]);

  /* ------------------------------------------------------------------------ */
  /* PROFILE VIEW                                                             */
  /* ------------------------------------------------------------------------ */

  const profileView = useMemo<CompanyProfileView | null>(() => {
    if (!company) return null;

    const commonAvatar =
      draft.avatarUri ??
      (activeProfile === "individual" ? individualDraft?.avatarUri ?? null : null) ??
      identityProfile?.avatarUri ??
      toNullableUri(company.logoUrl) ??
      null;

    if (activeProfile === "individual") {
      const focusAreas =
        (individualDraft?.focusAreas?.length ?? 0) > 0
          ? individualDraft!.focusAreas
          : draft.focusAreas;

      const highlights =
        (individualDraft?.highlights?.length ?? 0) > 0
          ? individualDraft!.highlights
          : draft.highlights;

      const about = norm(individualDraft?.about) || draft.about;
      const career = norm(individualDraft?.experience) || draft.career;
      const currentRole = norm(individualDraft?.currentRole) || career;

      return {
        avatarUri: commonAvatar,
        displayName:
          norm(individualDraft?.fullName) ||
          norm(identityProfile?.fullName) ||
          "Profil",
        displayTitle:
          norm(individualDraft?.headline) ||
          norm(identityProfile?.title) ||
          currentRole ||
          "Kurumsal Bireysel Profil",
        about,
        career,
        focusAreas,
        highlights,
        city: norm(individualDraft?.city),
        country: norm(individualDraft?.country),
        school: norm(individualDraft?.school),
        currentCompany: norm(individualDraft?.currentCompany),
        currentRole,
      };
    }

    return {
      avatarUri: commonAvatar,
      displayName:
        norm(identityProfile?.companyName) ||
        norm(company.name) ||
        "Şirket",
      displayTitle:
        norm(identityProfile?.companyTitle) ||
        norm(company.title) ||
        norm(company.sector) ||
        "Kurumsal Profil",
      about: draft.about || norm(company.description),
      career: draft.career || norm(company.title) || norm(company.sector),
      focusAreas: draft.focusAreas,
      highlights: draft.highlights,
      city: norm(company.city),
      country: norm(company.country),
      school: "",
      currentCompany: norm(company.name),
      currentRole:
        norm(identityProfile?.companyTitle) ||
        norm(company.title) ||
        norm(company.sector),
    };
  }, [activeProfile, company, draft, identityProfile, individualDraft]);

  /* ------------------------------------------------------------------------ */
  /* DERIVED SIGNALS                                                          */
  /* ------------------------------------------------------------------------ */

  const derived = useMemo<DerivedSignals | null>(() => {
    if (!company) return null;

    const mutualConnections = Math.max(0, Math.floor(followers * 0.02));

    return {
      isRecentlyActive: true,
      followers,
      isFollowing,
      mutualConnections,
      socialProofText: followers > 0 ? `${followers} kişi takip ediyor` : null,
    };
  }, [company, followers, isFollowing]);

  /* ------------------------------------------------------------------------ */
  /* PROFILE COMPLETION                                                       */
  /* ------------------------------------------------------------------------ */

  const profileCompletion = useMemo(() => {
    if (!company || !profileView) return 0;

    if (activeProfile === "individual") {
      const fields = [
        profileView.avatarUri,
        profileView.displayName,
        profileView.displayTitle,
        profileView.about,
        profileView.career,
        profileView.city,
        profileView.country,
        profileView.school,
        profileView.currentCompany,
        profileView.currentRole,
        individualDraft?.portfolioUrl,
        profileView.focusAreas.length > 0 ? "yes" : "",
        profileView.highlights.length > 0 ? "yes" : "",
      ];

      const filled = countFilled(fields);
      return Math.round((filled / fields.length) * 100);
    }

    const fields = [
      profileView.avatarUri,
      company.name,
      company.sector,
      profileView.displayTitle,
      profileView.about,
      company.country,
      company.city,
      company.website,
      company.employeeCount,
      profileView.focusAreas.length > 0 ? "yes" : "",
      profileView.highlights.length > 0 ? "yes" : "",
    ];

    const filled = countFilled(fields);
    return Math.round((filled / fields.length) * 100);
  }, [activeProfile, company, individualDraft, profileView]);

  /* ------------------------------------------------------------------------ */
  /* RECRUITER VERIFICATION                                                   */
  /* ------------------------------------------------------------------------ */

  const isRecruiterVerified = useMemo(() => {
    if (!company) return false;

    return (
      profileCompletion >= 80 &&
      norm(company.website).length > 0 &&
      followers >= 5
    );
  }, [company, followers, profileCompletion]);

  /* ------------------------------------------------------------------------ */
  /* JOB POST CREDIBILITY SCORE                                               */
  /* ------------------------------------------------------------------------ */

  const jobPostCredibilityScore = useMemo(() => {
    if (!company) return 0;

    let score = 0;

    if (profileCompletion >= 80) score += 40;
    if (norm(company.website).length > 0) score += 20;
    if (followers >= 10) score += 20;
    if (norm(profileView?.about).length > 50) score += 20;

    return Math.min(score, 100);
  }, [company, followers, profileCompletion, profileView]);

  /* ------------------------------------------------------------------------ */

  return {
    company,
    isOwner,

    activeProfile,
    profileView,
    derived,

    followers,
    isFollowing,
    toggleFollow,

    visibility,
    setVisibility,

    profileCompletion,
    isRecruiterVerified,
    jobPostCredibilityScore,
  };
}