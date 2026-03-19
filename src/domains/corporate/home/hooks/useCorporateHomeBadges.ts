// src/domains/corporate/home/hooks/useCorporateHomeBadges.ts

import { useEffect, useMemo, useState } from "react";

/**
 * Step 40 (UI Mock):
 * CorporateHome üzerindeki hızlı aksiyonlar ve badge sayıları.
 *
 * - Backend yok
 * - Domain izolasyonu korunur (corporate içinde kalır)
 * - İleride service + realtime ile bağlanabilir
 */

type Badges = {
  jobsOpen: number;
  inboxUnread: number;
  networkRequests: number;
};

export function useCorporateHomeBadges() {
  const [badges, setBadges] = useState<Badges>({
    jobsOpen: 12,
    inboxUnread: 3,
    networkRequests: 2,
  });

  // UI mock: küçük bir "canlı" hissi için hafif güncelleme
  useEffect(() => {
    const id = setInterval(() => {
      setBadges((prev) => {
        // Deterministic küçük dalgalanma (random yok)
        const tick = new Date().getSeconds();
        const delta = tick % 2 === 0 ? 0 : 1;

        return {
          jobsOpen: prev.jobsOpen, // sabit kalsın (ilan sayısı)
          inboxUnread: Math.max(0, prev.inboxUnread + (delta === 1 ? 0 : 0)),
          networkRequests: prev.networkRequests,
        };
      });
    }, 4000);

    return () => clearInterval(id);
  }, []);

  const hasAny = useMemo(
    () => badges.jobsOpen > 0 || badges.inboxUnread > 0 || badges.networkRequests > 0,
    [badges]
  );

  return { badges, hasAny };
}