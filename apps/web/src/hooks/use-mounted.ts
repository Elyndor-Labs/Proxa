import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/**
 * Returns true after the component mounts on the client.
 * Uses useSyncExternalStore to avoid hydration mismatches without useEffect.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
