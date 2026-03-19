import type {
    CampaignPerformance,
    DateRange,
    InfluencerContribution,
    ReturnStats,
    SalesSummary,
    TopSeller,
} from "../types/storeReport.types";

function mockDelay<T>(v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), 300));
}

export const storeReportService = {
  async getSalesSummary(_: DateRange): Promise<SalesSummary> {
    return mockDelay({
      totalRevenue: 124500,
      orderCount: 312,
      averageOrderValue: 399,
    });
  },

  async getCampaignPerformance(_: DateRange): Promise<CampaignPerformance[]> {
    return mockDelay([
      { campaignId: "c-1", title: "%50 Günleri", revenue: 42000, orders: 120, conversionRate: 4.2 },
      { campaignId: "c-2", title: "Hafta Sonu", revenue: 18500, orders: 64, conversionRate: 2.8 },
    ]);
  },

  async getTopSellers(_: DateRange): Promise<TopSeller[]> {
    return mockDelay([
      { sellerId: "s-1", sellerName: "Atölye A", revenue: 36000, orders: 90 },
      { sellerId: "s-2", sellerName: "Stüdyo B", revenue: 28000, orders: 70 },
    ]);
  },

  async getInfluencerContribution(_: DateRange): Promise<InfluencerContribution[]> {
    return mockDelay([
      { source: "Paylaşım Linki", clicks: 980, orders: 42, revenue: 12600 },
      { source: "Profil Kopya", clicks: 430, orders: 18, revenue: 5400 },
    ]);
  },

  async getReturnStats(_: DateRange): Promise<ReturnStats> {
    return mockDelay({ returnedOrders: 12, cancelledOrders: 7 });
  },
};