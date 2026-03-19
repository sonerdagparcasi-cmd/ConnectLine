/**
 * ChatProfile
 * - SADECE chat domain'e aittir
 * - Diğer domain'lerle paylaşılmaz
 * - ChatHome (owner) + ChatProfile (visitor) için
 *   tek source-of-truth modelidir
 */

export interface ChatProfile {
  /** Avatar altında gösterilen kullanıcı adı */
  displayName: string;

  /** Kullanıcı avatar görseli (galeriden seçilir) */
  avatarUri?: string;

  /** İletişim bilgileri (ziyaretçi read-only görür) */
  phone?: string;
  email?: string;

  /** Kullanıcı biyografisi */
  bio?: string;

  /**
   * İleriye dönük alan
   * - backend sync
   * - multi-device
   */
  updatedAt?: number;
}