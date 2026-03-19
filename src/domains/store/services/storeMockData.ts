// src/domains/store/services/storeMockData.ts
import type { StoreCategory, StoreProduct, StoreSeller } from "../types/store.types";

export const storeMockCategories: StoreCategory[] = [
  { id: "cat-1", name: "Kategoriler" },
  { id: "cat-2", name: "Yeni" },
  { id: "cat-3", name: "Popüler" },
  { id: "cat-4", name: "İndirim" },
];

export const storeMockSellers: StoreSeller[] = [
  { id: "seller-1", name: "Nova Market", city: "İstanbul", rating: 4.6 },
  { id: "seller-2", name: "Atlas Store", city: "Ankara", rating: 4.3 },
  { id: "seller-3", name: "Orion Supply", city: "İzmir", rating: 4.1 },
];

export const storeMockProducts: StoreProduct[] = [
  {
    id: "p-1",
    title: "Kablosuz Kulaklık",
    price: 799,
    currency: "TRY",
    sellerId: "seller-1",
    categoryId: "cat-3",
    inStock: true,
    rating: 4.5,
    shortDesc: "Günlük kullanım için hafif ve pratik.",
    variants: [
      { id: "v-1", label: "Siyah" },
      { id: "v-2", label: "Beyaz" },
    ],
  },
  {
    id: "p-2",
    title: "Akıllı Saat",
    price: 1299,
    currency: "TRY",
    sellerId: "seller-2",
    categoryId: "cat-2",
    inStock: true,
    rating: 4.2,
    shortDesc: "Bildirim, adım sayar ve temel sağlık ölçümleri.",
    variants: [
      { id: "v-1", label: "42mm" },
      { id: "v-2", label: "46mm" },
    ],
  },
  {
    id: "p-3",
    title: "Günlük Sırt Çantası",
    price: 499,
    currency: "TRY",
    sellerId: "seller-3",
    categoryId: "cat-1",
    inStock: false,
    rating: 4.0,
    shortDesc: "Laptop bölmeli, sade tasarım.",
    variants: [
      { id: "v-1", label: "Gri" },
      { id: "v-2", label: "Lacivert" },
    ],
  },
];