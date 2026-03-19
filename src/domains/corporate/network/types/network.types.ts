// src/domains/corporate/network/types/network.types.ts

export type NetworkNodeType = "company" | "user";

export type CorporateNetwork = {
  connections: number;
  followers: number;
  following: number;
  pendingRequests: number;
};

export type NetworkEdgeType = "follow" | "connect" | "partner";

export type NetworkEdge = {
  fromId: string;
  toId: string;
  type: NetworkEdgeType;
  createdAt: number;
};