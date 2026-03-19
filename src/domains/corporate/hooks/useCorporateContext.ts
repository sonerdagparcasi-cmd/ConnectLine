import { useEffect, useMemo, useState } from "react";
import { corporateIdentityService } from "../services/corporateIdentityService";
import { CorporateContext } from "../types/corporate.types";

export function useCorporateContext() {
  const [context, setContext] = useState<CorporateContext>(() =>
    corporateIdentityService.ensureDefault()
  );

  // UI-level: ileride gerçek store/service ile değişir
  useEffect(() => {
    const ctx = corporateIdentityService.ensureDefault();
    setContext(ctx);
  }, []);

  const helpers = useMemo(() => {
    const isIndividual = context.kind === "individual";
    const isCompany = context.kind === "company";
    const companyRole = isCompany ? context.role : null;

    const canManageJobs =
      isCompany && (companyRole === "OWNER" || companyRole === "HR");

    return {
      isIndividual,
      isCompany,
      companyRole,
      canManageJobs,
      switchToIndividual: () => {
        const next: CorporateContext = {
          kind: "individual",
          individualProfileId: "ind_1",
          displayName: "Ben",
          title: "Kurumsal Profil",
          activeApplicationsCount: 2,
          profileCompleteness: 62,
        };
        corporateIdentityService.setActiveContext(next);
        setContext(next);
      },
      switchToCompany: () => {
        const next: CorporateContext = {
          kind: "company",
          companyId: "cmp_1",
          companyName: "Şirketim",
          role: "OWNER",
          activeJobsCount: 3,
          newApplicationsCount: 5,
          followersCount: 120,
        };
        corporateIdentityService.setActiveContext(next);
        setContext(next);
      },
    };
  }, [context]);

  return { context, setContext, ...helpers };
}