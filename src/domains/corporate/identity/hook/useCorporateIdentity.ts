// src/domains/corporate/identity/hook/useCorporateIdentity.ts
// 🔒 Corporate Identity Hook (STABLE)
// Kurallar:
// - Service API'si ne veriyorsa hook ona uyar
// - Varsayım type / method YOK
// - Identity = type + identity objesi
// - clear() YOK (service'te yok)

import { useCallback, useEffect, useMemo, useState } from "react";

import { corporateIdentityService } from "../services/corporateIdentityService";
import type {
  CorporateIdentity,
  CorporateIdentityType,
} from "../types/corporateIdentity.types";

export function useCorporateIdentity() {
  const [type, setType] = useState<CorporateIdentityType | null>(null);
  const [identity, setIdentity] = useState<CorporateIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  /* ============================== LOAD ============================== */

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [storedType, storedIdentity] = await Promise.all([
        corporateIdentityService.getType(),
        corporateIdentityService.getIdentity(),
      ]);

      setType(storedType ?? null);
      setIdentity(storedIdentity ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ============================== ACTIONS ============================== */

  const selectType = useCallback(
    async (nextType: CorporateIdentityType) => {
      await corporateIdentityService.setType(nextType);
      setType(nextType);
    },
    []
  );

  const create = useCallback(
    async (input: CorporateIdentity) => {
      await corporateIdentityService.setIdentity(input);
      setIdentity(input);
    },
    []
  );

  /* ============================== DERIVED ============================== */

  const hasIdentity = useMemo(() => {
    return Boolean(type && identity);
  }, [type, identity]);

  const ready = useMemo(() => !loading, [loading]);

  /* ============================== API ============================== */

  return {
    type,
    identity,
    loading,
    ready,
    hasIdentity,
    selectType,
    create,
  };
}
