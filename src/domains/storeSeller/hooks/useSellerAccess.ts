// src/domains/storeSeller/hooks/useSellerAccess.ts
// 🔒 SATİCI ERİŞİM KARARI – TEK MERKEZ (KİLİTLİ / STABIL)

import { useMemo } from "react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type SellerRole =
  | "owner"
  | "manager"
  | "staff"
  | "none";

export type SellerAccessState = {
  hasStore: boolean;
  isSellerOwner: boolean;
  isSellerStaff: boolean;
  sellerRole: SellerRole;
  canAccessSellerPanel: boolean;
  canCreateProduct: boolean;
  canManageOrders: boolean;
  canCreateStore: boolean;
};

/* -------------------------------------------------------------------------- */
/* MOCK ROLE SOURCE                                                           */
/* -------------------------------------------------------------------------- */

/**
 * 🔒 MOCK ROLE
 *
 * Buraya ileride bağlanacak sistemler:
 *
 * authSession
 * store ownership
 * corporate identity
 * role permissions
 */

function getMockSellerRole(): SellerRole {
  return "owner";
}

/* -------------------------------------------------------------------------- */
/* HOOK                                                                       */
/* -------------------------------------------------------------------------- */

export function useSellerAccess(): SellerAccessState {

  const sellerRole = getMockSellerRole();

  const hasStore = sellerRole !== "none";

  const isSellerOwner = sellerRole === "owner";

  const isSellerStaff =
    sellerRole === "manager" ||
    sellerRole === "staff";

  const canAccessSellerPanel = hasStore;

  const canCreateProduct =
    sellerRole === "owner" ||
    sellerRole === "manager";

  const canManageOrders =
    sellerRole === "owner" ||
    sellerRole === "manager" ||
    sellerRole === "staff";

  const canCreateStore = !hasStore;

  return useMemo(
    () => ({
      hasStore,
      isSellerOwner,
      isSellerStaff,
      sellerRole,
      canAccessSellerPanel,
      canCreateProduct,
      canManageOrders,
      canCreateStore,
    }),
    [
      hasStore,
      isSellerOwner,
      isSellerStaff,
      sellerRole,
      canAccessSellerPanel,
      canCreateProduct,
      canManageOrders,
      canCreateStore,
    ]
  );
}