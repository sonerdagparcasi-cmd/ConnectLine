// src/domains/store/services/storeCatalogService.ts
// 🔒 STORE CATALOG SERVICE – STABLE

import type {
  StoreCategory,
  StoreProduct,
  StoreSeller,
} from "../types/store.types";

import {
  storeMockCategories,
  storeMockProducts,
  storeMockSellers,
} from "./storeMockData";

export type StoreSortMode =
  | "popular"
  | "new"
  | "price_asc"
  | "price_desc";

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function simulateDelay(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

/**
 * 🔒 Currency normalize
 * mock data'da currency yoksa TRY atanır
 */
function normalizeProduct(p: any): StoreProduct {
  return {
    ...p,
    currency: p.currency ?? "TRY",
  };
}

/**
 * 🔒 Out of stock en alta
 */
function applyOutOfStockToBottom(list: StoreProduct[]) {
  return [...list].sort(
    (a, b) => Number(!!b.inStock) - Number(!!a.inStock)
  );
}

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const storeCatalogService = {

  async getCategories(): Promise<StoreCategory[]> {
    await simulateDelay(200);
    return storeMockCategories;
  },

  async getSellers(): Promise<StoreSeller[]> {
    await simulateDelay(200);
    return storeMockSellers;
  },

  async getProducts(params?: {
    categoryId?: string;
    search?: string;
    sort?: StoreSortMode;
  }): Promise<StoreProduct[]> {

    await simulateDelay(250);

    let list: StoreProduct[] =
      storeMockProducts.map(normalizeProduct);

    if (params?.categoryId) {
      list = list.filter((p) => p.categoryId === params.categoryId);
    }

    if (params?.search?.trim()) {
      const q = params.search.trim().toLowerCase();

      list = list.filter((p) =>
        p.title.toLowerCase().includes(q)
      );
    }

    const sortMode: StoreSortMode = params?.sort ?? "new";

    switch (sortMode) {

      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;

      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;

      case "popular":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;

      case "new":
      default:
        break;

    }

    list = applyOutOfStockToBottom(list);

    return list;
  },

  async getProductById(
    productId: string
  ): Promise<StoreProduct | null> {

    await simulateDelay(120);

    const found = storeMockProducts.find(
      (p) => p.id === productId
    );

    if (!found) return null;

    return normalizeProduct(found);
  },

  async getSellerById(
    sellerId: string
  ): Promise<StoreSeller | null> {

    await simulateDelay(120);

    return (
      storeMockSellers.find((s) => s.id === sellerId) ??
      null
    );
  },

  async getProductsBySeller(
    sellerId: string
  ): Promise<StoreProduct[]> {

    await simulateDelay(200);

    let list = storeMockProducts
      .filter((p) => p.sellerId === sellerId)
      .map(normalizeProduct);

    list = applyOutOfStockToBottom(list);

    return list;
  },
};