// src/domains/store/services/storeReviewService.ts
// 🔒 STORE REVIEW SERVICE – UI ONLY / STABLE

import type {
  RatingSummary,
  StoreReview,
} from "../types/storeReview.types";

/* ------------------------------------------------------------------ */
/* MOCK STORAGE                                                       */
/* ------------------------------------------------------------------ */

let REVIEWS: StoreReview[] = [];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return "rev_" + Math.random().toString(36).slice(2, 10);
}

function cloneReview(r: StoreReview): StoreReview {
  return {
    ...r,
    sellerReply: r.sellerReply
      ? { ...r.sellerReply }
      : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* GET REVIEWS                                                        */
/* ------------------------------------------------------------------ */

async function getReviewsByProduct(
  productId: string
): Promise<StoreReview[]> {
  return REVIEWS
    .filter((r) => r.productId === productId)
    .map(cloneReview);
}

/* ------------------------------------------------------------------ */
/* CREATE REVIEW                                                      */
/* ------------------------------------------------------------------ */

async function createReview(
  review: Omit<StoreReview, "id" | "createdAt">
): Promise<StoreReview> {

  const newReview: StoreReview = {
    ...review,
    id: generateId(),
    createdAt: Date.now(),
  };

  REVIEWS = [newReview, ...REVIEWS];

  return cloneReview(newReview);
}

/**
 * backward compatibility
 */

async function addReview(
  review: Omit<StoreReview, "id" | "createdAt">
) {
  return createReview(review);
}

/* ------------------------------------------------------------------ */
/* SELLER REPLY                                                       */
/* ------------------------------------------------------------------ */

async function addSellerReply(
  reviewId: string,
  text: string
): Promise<StoreReview | null> {

  const index = REVIEWS.findIndex((r) => r.id === reviewId);

  if (index === -1) return null;

  const updated: StoreReview = {
    ...REVIEWS[index],
    sellerReply: {
      text,
      repliedAt: Date.now(),
    },
  };

  REVIEWS = [
    ...REVIEWS.slice(0, index),
    updated,
    ...REVIEWS.slice(index + 1),
  ];

  return cloneReview(updated);
}

/* ------------------------------------------------------------------ */
/* RATING SUMMARY                                                     */
/* ------------------------------------------------------------------ */

async function getProductRatingSummary(
  productId: string
): Promise<RatingSummary> {

  const list = REVIEWS.filter(
    (r) => r.productId === productId
  );

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  let sum = 0;

  for (const r of list) {
    sum += r.rating;

    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
    }
  }

  const count = list.length;
  const average = count === 0 ? 0 : sum / count;

  return {
    average,
    count,
    distribution,
  };
}

/* ------------------------------------------------------------------ */
/* EXPORT                                                             */
/* ------------------------------------------------------------------ */

export const storeReviewService = {
  getReviewsByProduct,
  createReview,
  addReview,
  addSellerReply,
  getProductRatingSummary,
};