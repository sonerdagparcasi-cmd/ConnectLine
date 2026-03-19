// src/domains/store/services/storeOrderService.ts
// 🔒 STORE ORDER SERVICE — POST ORDER PROCESS (STABLE)

import type { StoreCartItem } from "../types/store.types";
import type { StoreOrder, StoreOrderStatus } from "../types/storeOrder.types";

/* ------------------------------------------------------------------ */
/* STORAGE                                                            */
/* ------------------------------------------------------------------ */

let ORDERS: StoreOrder[] = [];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function cloneItems(items: StoreCartItem[]): StoreCartItem[] {
  return items.map((i) => ({
    productId: i.productId,
    qty: i.qty,
  }));
}

function cloneOrder(order: StoreOrder): StoreOrder {
  return {
    ...order,
    items: cloneItems(order.items),
  };
}

/* ------------------------------------------------------------------ */
/* CREATE ORDER                                                       */
/* ------------------------------------------------------------------ */

export async function createOrder(params: {
  items: StoreCartItem[];
  total: number;
}): Promise<StoreOrder> {

  const order: StoreOrder = {
    id: `ORD-${Date.now()}`,

    customerName: "Demo Kullanıcı",

    items: cloneItems(params.items),

    total: params.total,

    createdAt: Date.now(),

    /**
     * 🔒 İlk lifecycle
     */
    status: "new",
  };

  ORDERS = [order, ...ORDERS];

  return cloneOrder(order);
}

/* ------------------------------------------------------------------ */
/* LIST                                                               */
/* ------------------------------------------------------------------ */

export async function getOrders(): Promise<StoreOrder[]> {
  return ORDERS.map(cloneOrder);
}

/* ------------------------------------------------------------------ */
/* GET BY ID                                                          */
/* ------------------------------------------------------------------ */

export async function getOrderById(id: string): Promise<StoreOrder | null> {

  const found = ORDERS.find((o) => o.id === id);

  if (!found) return null;

  return cloneOrder(found);

}

/* ------------------------------------------------------------------ */
/* UPDATE STATUS                                                      */
/* ------------------------------------------------------------------ */

export async function updateOrderStatus(
  orderId: string,
  status: StoreOrderStatus
): Promise<StoreOrder | null> {

  const index = ORDERS.findIndex((o) => o.id === orderId);

  if (index === -1) return null;

  const updated: StoreOrder = {
    ...ORDERS[index],
    status,
  };

  ORDERS = [
    ...ORDERS.slice(0, index),
    updated,
    ...ORDERS.slice(index + 1),
  ];

  return cloneOrder(updated);

}

/* ------------------------------------------------------------------ */
/* CANCEL ORDER                                                       */
/* ------------------------------------------------------------------ */

export async function cancelOrder(orderId: string): Promise<StoreOrder | null> {
  return updateOrderStatus(orderId, "cancelled");
}

/* ------------------------------------------------------------------ */
/* DEV RESET                                                          */
/* ------------------------------------------------------------------ */

export async function __resetOrdersForDev(): Promise<void> {
  ORDERS = [];
}