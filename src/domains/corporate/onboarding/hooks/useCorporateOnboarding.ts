// src/domains/corporate/onboarding/hooks/useCorporateOnboarding.ts
// 🔒 STABLE HOOK (UI-only)
// FIX:
// - Unmount sonrası setState riskini engeller
// - complete sırasında double-tap çağrısını engeller
// - Hatalarda sessizce mevcut state'i korur (patlamaz)

import { useEffect, useRef, useState } from "react";
import {
  corporateOnboardingService,
  CorporateOnboardingState,
  CorporateRole,
} from "../services/corporateOnboardingService";

export function useCorporateOnboarding() {
  const [state, setState] = useState<CorporateOnboardingState | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    corporateOnboardingService
      .get()
      .then((s) => {
        if (!mountedRef.current) return;
        setState(s);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setState({ completed: false });
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function complete(role: CorporateRole) {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      const next = await corporateOnboardingService.complete(role);
      if (!mountedRef.current) return;
      setState(next);
    } catch {
      // sessiz
    } finally {
      if (!mountedRef.current) return;
      setIsCompleting(false);
    }
  }

  return {
    state,
    complete,
    loading: state === null,
    isCompleting,
  };
}