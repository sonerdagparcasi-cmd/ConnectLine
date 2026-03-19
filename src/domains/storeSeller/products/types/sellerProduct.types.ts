// src/domains/storeSeller/products/types/sellerProduct.types.ts
// 🔒 STORE SELLER PRODUCTS TYPES – STABLE / UI ONLY

import type { Currency } from "../../../store/types/store.types";

/**
 * Satıcı ürün yönetimi için seller-side ürün modeli.
 *
 * Kurallar:
 * - Store marketplace product modelini bozmaz
 * - UI-only / mock çalışır
 * - İleride gerçek backend / storage bağlanabilir
 */

export type SellerProductStatus = "active" | "draft" | "out_of_stock";

export type SellerProductImage = {
  id: string;
  uri: string;
};

export type SellerManagedProduct = {
  id: string;
  sellerId: string;

  title: string;
  description?: string;

  price: number;
  currency: Currency;

  categoryId: string;

  stock: number;
  status: SellerProductStatus;

  images?: SellerProductImage[];

  createdAt: number;
  updatedAt?: number;
};

export type SellerProductForm = {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
};