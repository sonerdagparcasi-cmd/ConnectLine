// src/domains/store/types/store.types.ts

/* ------------------------------------------------------------------ */
/* CURRENCY                                                           */
/* ------------------------------------------------------------------ */
// src/domains/store/types/store.types.ts

import type { StoreWholesaleTier } from "./storeB2B.types";

export type Currency = "TRY" | "USD" | "EUR";
/* ------------------------------------------------------------------ */
/* CATEGORY                                                           */
/* ------------------------------------------------------------------ */

export type StoreCategory = {
  id: string;
  name: string;
};

/* ------------------------------------------------------------------ */
/* SELLER                                                             */
/* ------------------------------------------------------------------ */

export type StoreSeller = {
  id: string;
  name: string;

  city?: string;

  rating?: number; // 0-5 mock

  // güven sistemi için
  followers?: number;
  salesCount?: number;
  reviewCount?: number;
};

/* ------------------------------------------------------------------ */
/* PRODUCT VARIANT                                                    */
/* ------------------------------------------------------------------ */

export type StoreProductVariant = {
  id: string;

  label: string; // örn: "S", "M", "L" ya da "Kırmızı"
};

/* ------------------------------------------------------------------ */
/* PRODUCT                                                            */
/* ------------------------------------------------------------------ */

export type StoreProduct = {
  id: string;

  title: string;

  price: number;

  currency: Currency;

  sellerId: string;

  categoryId: string;

  inStock: boolean;

  /* ------------------------------------------------ */
  /* CORE                                             */
  /* ------------------------------------------------ */

  rating?: number; // 0-5 mock

  shortDesc?: string;

  images?: string[];

  stock?: number;

  salesCount?: number;

  isActive?: boolean;

  /* ------------------------------------------------ */
  /* VARIANTS                                         */
  /* ------------------------------------------------ */

  variants?: StoreProductVariant[];

  /* ------------------------------------------------ */
  /* B2B                                              */
  /* ------------------------------------------------ */

  minOrderQty?: number; // minimum sipariş

  wholesalePrice?: number; // toptan fiyat

  wholesaleTiers?: StoreWholesaleTier[];
};

/* ------------------------------------------------------------------ */
/* CART                                                               */
/* ------------------------------------------------------------------ */

export type StoreCartItem = {
  productId: string;

  qty: number;
};