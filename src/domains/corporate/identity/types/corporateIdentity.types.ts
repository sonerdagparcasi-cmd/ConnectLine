// src/domains/corporate/identity/types/corporateIdentity.types.ts
// 🔒 LOCKED — Corporate Identity Types

export type CorporateIdentityType = "company" | "individual";

/**
 * Identity = SADECE meta bilgi
 * Detay alanlar PROFILE tarafındadır
 */
export type CorporateIdentity = {
  type: CorporateIdentityType;
  createdAt: number;
};