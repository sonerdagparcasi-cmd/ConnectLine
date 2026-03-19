// src/domains/corporate/hooks/useApplications.ts
// 🔒 CORPORATE APPLICATIONS – SINGLE SOURCE OF TRUTH
// Amaç:
// - Şirkete gelen başvuruların ÜST MENÜ → Başvurular ekranında
//   otomatik ve güvenli şekilde görünmesi
// - UI-only / mock uyumlu
// - Tek veri kaynağı

import { useCallback, useEffect, useState } from "react";
import { applicationService } from "../services/applicationService";
import type { JobApplication } from "../types/application.types";

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 İlk yükleme
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const list = await applicationService.getMyApplications();

        if (!mounted) return;

        // ⬇️ En yeni başvuru en üstte olacak şekilde sırala
        const sorted = [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setApplications(sorted);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔹 Yeni başvuru ekleme (apply)
  const apply = useCallback(async (app: JobApplication) => {
    await applicationService.apply(app);

    setApplications((prev) => {
      // Aynı başvuru iki kere eklenmesin
      if (prev.some((a) => a.id === app.id)) return prev;

      return [app, ...prev];
    });
  }, []);

  // 🔹 Dışarıdan (örn. başka ekran) listeyi güncellemek için
  const refresh = useCallback(async () => {
    setLoading(true);

    const list = await applicationService.getMyApplications();

    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    setApplications(sorted);
    setLoading(false);
  }, []);

  return {
    applications,
    loading,
    apply,
    refresh,
  };
}