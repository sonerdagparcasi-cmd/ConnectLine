// src/domains/corporate/services/corporateViewerIdentity.ts
// 🔒 Oturum kimliği — bildirim self-suppression ve yorum yazarı için (corporate domain)

let actorUserId = "corporate-actor-default";
/** Şirket yöneticisi olarak oturum; kendi şirket gönderilerinde bildirim üretilmez */
let managedCompanyId: string | null = null;

export function getCorporateActorUserId(): string {
  return actorUserId;
}

export function setCorporateActorUserId(id: string) {
  const t = id.trim();
  actorUserId = t.length > 0 ? t : "corporate-actor-default";
}

export function getCorporateManagedCompanyId(): string | null {
  return managedCompanyId;
}

export function setCorporateManagedCompanyId(companyId: string | null) {
  managedCompanyId = companyId;
}

/**
 * Şirket sayfası sahibi olarak mı işlem yapılıyor (mock: useCompany isOwner senkronu).
 */
export function syncCorporateViewerFromCompanyRole(isOwner: boolean, companyId: string) {
  managedCompanyId = isOwner && companyId.trim().length > 0 ? companyId.trim() : null;
}

/** Hedef şirket için bildirim, oturum bu şirketi yönetiyorsa ve eylem kendi tarafımızdan geliyorsa bastır */
export function shouldSuppressCorporateSelfNotification(targetCompanyId: string): boolean {
  return (
    managedCompanyId != null &&
    managedCompanyId === targetCompanyId
  );
}
