// src/domains/store/types/storeOrder.types.ts
// 🔒 STORE ORDER + SHIPPING SYSTEM – UI ONLY / STABLE

import type { StoreCartItem } from "./store.types";

/* ------------------------------------------------------------------ */
/* ORDER STATUS                                                       */
/* ------------------------------------------------------------------ */

export type StoreOrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/* ------------------------------------------------------------------ */
/* SHIPPING                                                           */
/* ------------------------------------------------------------------ */

export type StoreShipment = {
  company: string; // Aras, Yurtiçi vb.
  trackingCode: string;
};

/* ------------------------------------------------------------------ */
/* ORDER                                                              */
/* ------------------------------------------------------------------ */

export type StoreOrder = {
  id: string;

  customerName: string;

  /**
   * Snapshot items
   * productId + qty
   */
  items: StoreCartItem[];

  total: number;

  /**
   * Order lifecycle
   * new → processing → shipped → delivered
   * cancelled → iptal edilen sipariş
   */
  status: StoreOrderStatus;

  /**
   * Kargo bilgisi (opsiyonel)
   */
  shipment?: StoreShipment;

  /**
   * Order creation timestamp
   */
  createdAt: number;
};