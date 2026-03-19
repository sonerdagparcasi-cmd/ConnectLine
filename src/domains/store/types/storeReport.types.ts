export type DateRange = {
  from: string; // ISO
  to: string;   // ISO
};

export type SalesSummary = {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
};

export type CampaignPerformance = {
  campaignId: string;
  title: string;
  revenue: number;
  orders: number;
  conversionRate: number; // %
};

export type TopSeller = {
  sellerId: string;
  sellerName: string;
  revenue: number;
  orders: number;
};

export type InfluencerContribution = {
  source: string; // paylaşım / link
  clicks: number;
  orders: number;
  revenue: number;
};

export type ReturnStats = {
  returnedOrders: number;
  cancelledOrders: number;
};