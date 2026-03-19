// src/domains/store/services/storeB2BService.ts
// 🔒 STORE B2B SERVICE – WHOLESALE LAYER (STABLE)
//
// Kurallar:
// - UI-only
// - Store marketplace servislerini bozmaz
// - Domain isolation korunur
// - B2B fiyatlandırma ve eligibility burada çözülür

import type { StoreWholesaleTier } from "../types/storeB2B.types";

/* ------------------------------------------------------------------ */
/* PRICE RESOLUTION                                                   */
/* ------------------------------------------------------------------ */

export function resolveB2BPrice(
  basePrice: number,
  qty: number,
  tiers?: StoreWholesaleTier[]
) {
  if (!tiers || tiers.length === 0) return basePrice;

  let price = basePrice;

  for (const tier of tiers) {
    if (qty >= tier.minQty) {
      price = tier.price;
    }
  }

  return price;
}

/* ------------------------------------------------------------------ */
/* WHOLESALE TIER RESOLUTION                                          */
/* ------------------------------------------------------------------ */

export function resolveWholesaleTier(
  qty: number,
  tiers?: StoreWholesaleTier[]
): StoreWholesaleTier | null {
  if (!tiers || tiers.length === 0) return null;

  let matched: StoreWholesaleTier | null = null;

  for (const tier of tiers) {
    if (qty >= tier.minQty) {
      matched = tier;
    }
  }

  return matched;
}

/* ------------------------------------------------------------------ */
/* B2B ELIGIBILITY                                                    */
/* ------------------------------------------------------------------ */

export function canUseB2B(
  isCompanyBuyer: boolean,
  tiers?: StoreWholesaleTier[]
) {
  if (!tiers || tiers.length === 0) return false;

  return isCompanyBuyer;
}

/* ------------------------------------------------------------------ */
/* MINIMUM ORDER CHECK                                                */
/* ------------------------------------------------------------------ */

export function checkMinimumWholesaleQty(
  qty: number,
  tiers?: StoreWholesaleTier[]
) {
  if (!tiers || tiers.length === 0) return true;

  const min = tiers[0]?.minQty ?? 1;

  return qty >= min;
}

/* ------------------------------------------------------------------ */
/* BULK ORDER FLAG                                                    */
/* ------------------------------------------------------------------ */

export function isBulkOrder(
  qty: number,
  tiers?: StoreWholesaleTier[]
) {
  if (!tiers || tiers.length === 0) return false;

  return qty >= tiers[0].minQty;
}