// src/domains/store/services/storeCampaignProductMatcher.ts
import type { StoreProduct } from "../types/store.types";
import type { StoreCampaign } from "../types/storeCampaign.types";

/**
 * Bir kampanyanın ürüne uyup uymadığını kontrol eder
 * - target yoksa → global (uyar)
 * - productIds varsa → productId eşleşmeli
 * - categoryIds varsa → categoryId eşleşmeli
 */
export function isCampaignApplicableToProduct(
  campaign: StoreCampaign,
  product: StoreProduct
): boolean {
  const target = campaign.target;

  // global kampanya
  if (!target) return true;

  const hasProductRule = !!target.productIds?.length;
  const hasCategoryRule = !!target.categoryIds?.length;

  // hedef tanımı var ama kural yoksa → global
  if (!hasProductRule && !hasCategoryRule) return true;

  if (
    hasProductRule &&
    target.productIds!.includes(product.id)
  ) {
    return true;
  }

  if (
    hasCategoryRule &&
    target.categoryIds!.includes(product.categoryId)
  ) {
    return true;
  }

  return false;
}

/**
 * Bir ürün için en uygun kampanyayı seçer
 * - Önce event
 * - Sonra yüksek indirim yüzdesi
 */
export function matchCampaignForProduct(
  campaigns: StoreCampaign[],
  product: StoreProduct
): StoreCampaign | null {
  const applicable = campaigns.filter((c) =>
    isCampaignApplicableToProduct(c, product)
  );

  if (!applicable.length) return null;

  return [...applicable].sort((a, b) => {
    const ta = a.type === "event" ? 0 : 1;
    const tb = b.type === "event" ? 0 : 1;
    if (ta !== tb) return ta - tb;

    const pa = a.discount?.percent ?? 0;
    const pb = b.discount?.percent ?? 0;
    return pb - pa;
  })[0];
}
