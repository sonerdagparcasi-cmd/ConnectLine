// 🔒 STORE REVIEW TYPES – STABLE

export type SellerReply = {
  text: string;
  repliedAt: number;
};

export type StoreReview = {
  id: string;

  productId: string;

  sellerId: string;

  authorName: string;

  rating: number;

  title?: string;

  comment: string;

  sellerReply?: SellerReply;

  createdAt: number;
};

export type RatingSummary = {
  average: number;

  count: number;

  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};