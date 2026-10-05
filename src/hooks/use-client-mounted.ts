import { useSyncExternalStore } from 'react';

/** True after hydration — avoids theme/icon mismatch without an effect + setState. */
export function useClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
