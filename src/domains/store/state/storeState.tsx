// src/domains/store/state/storeState.tsx

import { ReactNode, createContext, useContext, useMemo, useReducer } from "react";
import type { StoreCartItem } from "../types/store.types";

/**
 * 🔒 STORE DOMAIN STATE (KİLİTLİ)
 *
 * favorites → productId -> true
 * cart → StoreCartItem[]
 * followedSellers → sellerId -> true
 */

type StoreState = {
  favorites: Record<string, true>;
  cart: StoreCartItem[];

  /* NEW */
  followedSellers: Record<string, true>;
};

type StoreActions = {
  toggleFavorite: (productId: string) => void;

  /* NEW */
  toggleFollowSeller: (sellerId: string) => void;

  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;

  setQty: (productId: string, qty: number) => void;

  clearCart: () => void;

  completeCheckout: () => void;
};

type StoreContextValue = StoreState & StoreActions;

const StoreContext = createContext<StoreContextValue | null>(null);

type Action =
  | { type: "TOGGLE_FAVORITE"; productId: string }
  | { type: "TOGGLE_FOLLOW_SELLER"; sellerId: string }
  | { type: "ADD_TO_CART"; productId: string; qty: number }
  | { type: "REMOVE_FROM_CART"; productId: string }
  | { type: "SET_QTY"; productId: string; qty: number }
  | { type: "CLEAR_CART" };

const initialState: StoreState = {
  favorites: {},
  cart: [],

  /* NEW */
  followedSellers: {},
};

function clampAddQty(qty: number) {
  const n = Number.isFinite(qty) ? qty : 1;
  return Math.max(1, Math.floor(n));
}

function normalizeSetQty(qty: number) {
  const n = Number.isFinite(qty) ? qty : 0;
  return Math.floor(n);
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "TOGGLE_FAVORITE": {
      const next = { ...state.favorites };

      if (next[action.productId]) delete next[action.productId];
      else next[action.productId] = true;

      return { ...state, favorites: next };
    }

    /* FOLLOW SELLER */

    case "TOGGLE_FOLLOW_SELLER": {
      const next = { ...state.followedSellers };

      if (next[action.sellerId]) delete next[action.sellerId];
      else next[action.sellerId] = true;

      return { ...state, followedSellers: next };
    }

    case "ADD_TO_CART": {
      const qty = clampAddQty(action.qty);

      const idx = state.cart.findIndex(
        (c) => c.productId === action.productId
      );

      if (idx >= 0) {
        const next = [...state.cart];

        next[idx] = {
          ...next[idx],
          qty: next[idx].qty + qty,
        };

        return { ...state, cart: next };
      }

      return {
        ...state,
        cart: [...state.cart, { productId: action.productId, qty }],
      };
    }

    case "REMOVE_FROM_CART": {
      return {
        ...state,
        cart: state.cart.filter((c) => c.productId !== action.productId),
      };
    }

    case "SET_QTY": {
      const qty = normalizeSetQty(action.qty);

      if (qty <= 0) {
        return {
          ...state,
          cart: state.cart.filter((c) => c.productId !== action.productId),
        };
      }

      return {
        ...state,
        cart: state.cart.map((c) =>
          c.productId === action.productId ? { ...c, qty } : c
        ),
      };
    }

    case "CLEAR_CART": {
      return { ...state, cart: [] };
    }

    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<StoreContextValue>(() => {
    return {
      favorites: state.favorites,
      cart: state.cart,
      followedSellers: state.followedSellers,

      toggleFavorite: (productId) =>
        dispatch({ type: "TOGGLE_FAVORITE", productId }),

      toggleFollowSeller: (sellerId) =>
        dispatch({ type: "TOGGLE_FOLLOW_SELLER", sellerId }),

      addToCart: (productId, qty = 1) =>
        dispatch({ type: "ADD_TO_CART", productId, qty }),

      removeFromCart: (productId) =>
        dispatch({ type: "REMOVE_FROM_CART", productId }),

      setQty: (productId, qty) =>
        dispatch({ type: "SET_QTY", productId, qty }),

      clearCart: () => dispatch({ type: "CLEAR_CART" }),

      completeCheckout: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [state]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const ctx = useContext(StoreContext);

  if (!ctx) {
    throw new Error("useStoreContext must be used within <StoreProvider />");
  }

  return ctx;
}