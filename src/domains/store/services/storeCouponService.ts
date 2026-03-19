export type CouponResult = {
  code: string;
  discountPercent: number;
};

export async function applyCoupon(code: string): Promise<CouponResult | null> {
  if (code === "CL50") {
    return { code, discountPercent: 50 };
  }
  return null;
}