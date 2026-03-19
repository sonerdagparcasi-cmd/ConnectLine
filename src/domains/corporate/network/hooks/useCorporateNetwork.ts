import { useEffect, useState } from "react";
import { corporateNetworkService } from "../services/corporateNetworkService";
import type { CorporateNetwork } from "../types/network.types";

/**
 * 🔒 useCorporateNetwork
 * ------------------------------------
 * Corporate Network = İSTATİSTİK MODELİ
 *
 * - Graph / node / edge YOK
 * - LinkedIn tarzı sayılar
 * - Profile / Dashboard / Header için
 *
 * Bu hook:
 * - SADECE servis verisini taşır
 * - Hesaplama yapmaz
 * - UI kararına girmez
 */
export function useCorporateNetwork() {
  const [network, setNetwork] = useState<CorporateNetwork | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const data = await corporateNetworkService.getMyNetwork();
    setNetwork(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  return {
    network,
    loading,
    refresh,
  };
}