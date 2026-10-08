import type { KitchenConnectionStatus, KitchenOrder, KitchenStats } from '@/features/kitchen/types';
import { getKitchenStats } from '@/features/kitchen/lib/stats';

/** @deprecated Use `useKitchenOrdersQuery` / `/api/kitchen/orders` instead. */
export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  return [];
}

/** @deprecated Use kitchen orders query + `getKitchenStats`. */
export async function getKitchenStatsSummary(): Promise<KitchenStats> {
  return getKitchenStats([]);
}

/** @deprecated Connection status comes from live kitchen query errors. */
export async function getKitchenConnectionStatus(): Promise<KitchenConnectionStatus> {
  return {
    printerConnected: true,
    posSyncActive: true,
  };
}
