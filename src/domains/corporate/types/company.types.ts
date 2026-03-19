// src/domains/corporate/types/company.types.ts
// 🔒 CORPORATE COMPANY TYPE (KİLİTLİ – SOURCE OF TRUTH)

/**
 * Company
 *
 * Kurallar:
 * - Corporate domain için tek şirket modeli
 * - Sahip / ziyaretçi ayrımı ownerUserId üzerinden yapılır
 * - Zaman alanları backend zorunluluğu DEĞİLDİR
 * - Aktivite / canlılık sinyalleri UI-only derived olarak üretilir
 * - Store / StoreSeller alanları ASLA buraya eklenmez
 */
export type Company = {
  /** Benzersiz şirket ID */
  id: string;

  /** Şirket adı (her zaman görünür) */
  name: string;

  /**
   * Opsiyonel başlık / vitrin metni
   * Örn:
   * - "Fintech çözümleri geliştiriyoruz"
   * - "Yapay zeka tabanlı SaaS şirketi"
   */
  title?: string;

  /** Ana faaliyet alanı (zorunlu) */
  sector: string;

  /** Profil açıklaması */
  description: string;

  /**
   * Legacy konum alanı
   * 🔒 Eski UI'lar için korunur
   */
  location?: string;

  /* ------------------------------------------------------------------ */
  /* LOCATION (STRUCTURED)                                              */
  /* ------------------------------------------------------------------ */

  /** Ülke */
  country?: string;

  /** Şehir */
  city?: string;

  /* ------------------------------------------------------------------ */
  /* CORPORATE INFO                                                     */
  /* ------------------------------------------------------------------ */

  /** Şirket kuruluş yılı */
  foundedYear?: number;

  /** Çalışan sayısı (örnek: 1-10, 11-50 vb.) */
  employeeCount?: string;

  /* ------------------------------------------------------------------ */
  /* CONTACT                                                            */
  /* ------------------------------------------------------------------ */

  /** Şirket web sitesi */
  website?: string;

  /** Şirket iletişim e-posta adresi */
  email?: string;

  /** Şirket logosu */
  logoUrl?: string;

  /* ------------------------------------------------------------------ */
  /* SOCIAL PROOF                                                       */
  /* ------------------------------------------------------------------ */

  /** Takipçi sayısı */
  followers: number;

  /** Kullanıcı bu şirketi takip ediyor mu */
  isFollowing: boolean;

  /* ------------------------------------------------------------------ */
  /* OWNERSHIP                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Sahip kullanıcı ID
   * 🔒 useCompany.ts bunu kullanır
   * - Screen’ler ownership hesabı yapmaz
   */
  ownerUserId: string;

  /* ------------------------------------------------------------------ */
  /* UI META                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * 🔒 UI-ONLY
   * Son güncellenme zamanı
   */
  updatedAt?: string;
};