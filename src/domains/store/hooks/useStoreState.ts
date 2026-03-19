// src/domains/store/hooks/useStoreState.ts
import { useStoreContext } from "../state/storeState";

export function useStoreState() {
  return useStoreContext();
}