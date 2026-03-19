// src/domains/corporate/network/services/corporateNetworkService.ts

import type { CorporateNetwork } from "../types/network.types";

const MOCK_NETWORK: CorporateNetwork = {
  connections: 128,
  followers: 1240,
  following: 87,
  pendingRequests: 3,
};

class CorporateNetworkService {
  async getMyNetwork(): Promise<CorporateNetwork> {
    // UI-only mock
    return { ...MOCK_NETWORK };
  }
}

export const corporateNetworkService = new CorporateNetworkService();