// src/domains/storeSeller/orders/types/sellerOrder.types.ts
// 🔒 SELLER ORDER TYPES – STABLE / UI ONLY

import type { Currency } from "../../../store/types/store.types";

/* ------------------------------------------------------------------ */
/* ORDER STATUS                                                       */
/* ------------------------------------------------------------------ */

export type SellerOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

/* ------------------------------------------------------------------ */
/* ORDER ITEM                                                         */
/* ------------------------------------------------------------------ */

export type SellerOrderItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  currency: Currency;
};

/* ------------------------------------------------------------------ */
/* ORDER                                                              */
/* ------------------------------------------------------------------ */

export type SellerOrder = {
  id: string;

  sellerId: string;
  buyerId: string;

  items: SellerOrderItem[];

  totalPrice: number;
  currency: Currency;

  status: SellerOrderStatus;

  createdAt: number;
  updatedAt?: number;
};