// src/domains/corporate/recruitment/types/application.types.ts

/**
 * Recruitment domain types (Corporate)
 * ------------------------------------------------------------------
 * Stabil TS: UI / mock servisler için alanlar genişletilebilir.
 * Bu dosya corporate domain içinde kalır; diğer domainlere sızmaz.
 */

// ✅ UI & servislerde kullanılan tüm durumları kapsa (geriye uyum)
export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlist"
  | "shortlisted"
  | "pending"
  | "reviewed"
  | "rejected";

export type JobApplication = {
  id: string;

  // Job reference
  jobId: string;

  /** UI kolaylığı: bazı ekranlar jobTitle gösterebiliyor */
  jobTitle?: string;

  // Candidate
  candidateId: string;
  candidateName: string;

  status: ApplicationStatus;
  appliedAt: number;

  coverLetter?: string;

  /** Tek link (stabil mock) */
  portfolioUrl?: string;

  /** Geriye uyum: bazı yerler array bekleyebiliyor */
  portfolioLinks?: string[];

  videoCvUri?: string;

  /** AI sonuçları mock olabilir */
  aiScore?: number;

  /**
   * 🔁 Backward compatibility (bazı eski katmanlar bekliyor olabilir)
   * UI-only: zorunlu değil
   */
  companyId?: string;
  createdAt?: number;
};