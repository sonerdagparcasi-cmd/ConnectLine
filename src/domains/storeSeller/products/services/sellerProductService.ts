// src/domains/storeSeller/products/services/sellerProductService.ts
// 🔒 SELLER PRODUCT SERVICE – UI ONLY / STABLE (SAFE VERSION)
//
// Kurallar:
// - Store marketplace servislerini bozmaz
// - UI-only mock veri
// - Domain isolation korunur
// - Seller panel ürün yönetimi buradan yapılır

import { SellerManagedProduct } from "../types/sellerProduct.types";

/* ------------------------------------------------------------------ */
/* MOCK STORAGE                                                       */
/* ------------------------------------------------------------------ */

let SELLER_PRODUCTS: SellerManagedProduct[] = [];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return "sp_" + Math.random().toString(36).slice(2, 10);
}

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const sellerProductService = {
  /* -------------------------------------------------------------- */
  /* LIST                                                           */
  /* -------------------------------------------------------------- */

  async getSellerProducts(sellerId: string): Promise<SellerManagedProduct[]> {
    return SELLER_PRODUCTS.filter((p) => p.sellerId === sellerId);
  },

  /* -------------------------------------------------------------- */
  /* GET BY ID                                                      */
  /* -------------------------------------------------------------- */

  async getProductById(
    productId: string
  ): Promise<SellerManagedProduct | null> {
    const product = SELLER_PRODUCTS.find((p) => p.id === productId);
    return product ?? null;
  },

  /* -------------------------------------------------------------- */
  /* CREATE                                                         */
  /* -------------------------------------------------------------- */

  async createProduct(
    input: Omit<SellerManagedProduct, "id" | "createdAt" | "updatedAt">
  ): Promise<SellerManagedProduct> {
    const newProduct: SellerManagedProduct = {
      ...input,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    SELLER_PRODUCTS = [newProduct, ...SELLER_PRODUCTS];

    return newProduct;
  },

  /* -------------------------------------------------------------- */
  /* UPDATE                                                         */
  /* -------------------------------------------------------------- */

  async updateProduct(
    productId: string,
    patch: Partial<SellerManagedProduct>
  ): Promise<SellerManagedProduct | null> {
    const index = SELLER_PRODUCTS.findIndex((p) => p.id === productId);

    if (index === -1) return null;

    const existing = SELLER_PRODUCTS[index];

    const updated: SellerManagedProduct = {
      ...existing,
      ...patch,
      sellerId: existing.sellerId, // 🔒 seller değiştirilemez
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };

    SELLER_PRODUCTS = [
      ...SELLER_PRODUCTS.slice(0, index),
      updated,
      ...SELLER_PRODUCTS.slice(index + 1),
    ];

    return updated;
  },

  /* -------------------------------------------------------------- */
  /* DELETE                                                         */
  /* -------------------------------------------------------------- */

  async deleteProduct(productId: string): Promise<boolean> {
    const before = SELLER_PRODUCTS.length;

    SELLER_PRODUCTS = SELLER_PRODUCTS.filter((p) => p.id !== productId);

    return SELLER_PRODUCTS.length !== before;
  },

  /* -------------------------------------------------------------- */
  /* STOCK UPDATE                                                   */
  /* -------------------------------------------------------------- */

  async updateStock(
    productId: string,
    stock: number
  ): Promise<SellerManagedProduct | null> {
    const status = stock <= 0 ? "out_of_stock" : "active";

    return this.updateProduct(productId, {
      stock,
      status,
    });
  },
};