// src/domains/store/services/storeTrustService.ts
// 🔒 STORE TRUST SERVICE – UI ONLY / STABLE

export type StoreTrustMetrics = {
  sales: number;
  followers: number;
  reviewCount: number;
  rating: number;
  badge?: string;
};

/* ------------------------------------------------------------------ */
/* TRUST DATA (MOCK)                                                  */
/* ------------------------------------------------------------------ */

async function getSellerTrustMetrics(
  sellerId: string
): Promise<StoreTrustMetrics> {

  // UI-only mock

  return {
    sales: 128,
    followers: 3200,
    reviewCount: 54,
    rating: 4.8,
    badge: "trusted",
  };

}

/**
 * Backward compatibility
 * eski ekranlar için
 */

async function getSellerTrust(
  sellerId: string
): Promise<StoreTrustMetrics> {

  return getSellerTrustMetrics(sellerId);

}

/* ------------------------------------------------------------------ */
/* EXPORT                                                             */
/* ------------------------------------------------------------------ */

export const storeTrustService = {
  getSellerTrustMetrics,
  getSellerTrust,
};