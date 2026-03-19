// src/domains/store/services/storeShippingService.ts
// 🔒 STORE SHIPPING SERVICE – UI ONLY / STABLE

import type { StoreOrderStatus } from "../types/storeOrder.types";

/* ------------------------------------------------------------------ */
/* STATUS LABEL                                                       */
/* ------------------------------------------------------------------ */

function getOrderStatusLabel(status: StoreOrderStatus) {
  switch (status) {
    case "new":
      return "Yeni Sipariş";

    case "processing":
      return "Hazırlanıyor";

    case "shipped":
      return "Kargoya Verildi";

    case "delivered":
      return "Teslim Edildi";

    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/* SHIPPING INFO (MOCK)                                               */
/* ------------------------------------------------------------------ */

async function getShipping(orderId: string) {
  // UI only mock
  return {
    carrier: "Kargo",
    tracking: "TRK-" + orderId.slice(-6),
    eta: "2-3 gün",
  };
}

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const storeShippingService = {
  getOrderStatusLabel,
  getShipping,
};