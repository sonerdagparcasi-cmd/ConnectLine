// src/domains/storeSeller/orders/services/sellerOrderService.ts
// 🔒 SELLER ORDER SERVICE – UI ONLY / STABLE

import {
    SellerOrder,
    SellerOrderStatus,
} from "../types/sellerOrder.types";

/* ------------------------------------------------------------------ */
/* MOCK STORAGE                                                       */
/* ------------------------------------------------------------------ */

let ORDERS: SellerOrder[] = [];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return "order_" + Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const sellerOrderService = {
  /* -------------------------------------------------------------- */
  /* LIST                                                           */
  /* -------------------------------------------------------------- */

  async getSellerOrders(sellerId: string): Promise<SellerOrder[]> {
    return ORDERS.filter((o) => o.sellerId === sellerId);
  },

  /* -------------------------------------------------------------- */
  /* GET BY ID                                                      */
  /* -------------------------------------------------------------- */

  async getOrderById(orderId: string): Promise<SellerOrder | null> {
    const o = ORDERS.find((x) => x.id === orderId);
    return o ?? null;
  },

  /* -------------------------------------------------------------- */
  /* CREATE (checkout simülasyonu için)                             */
  /* -------------------------------------------------------------- */

  async createOrder(input: Omit<SellerOrder, "id" | "createdAt">) {
    const order: SellerOrder = {
      ...input,
      id: generateId(),
      createdAt: Date.now(),
    };

    ORDERS = [order, ...ORDERS];

    return order;
  },

  /* -------------------------------------------------------------- */
  /* UPDATE STATUS                                                  */
  /* -------------------------------------------------------------- */

  async updateStatus(
    orderId: string,
    status: SellerOrderStatus
  ): Promise<SellerOrder | null> {
    const index = ORDERS.findIndex((o) => o.id === orderId);

    if (index === -1) return null;

    const updated: SellerOrder = {
      ...ORDERS[index],
      status,
      updatedAt: Date.now(),
    };

    ORDERS[index] = updated;

    return updated;
  },
};