import {
  kitchenPreviewConnection,
  kitchenPreviewOrders,
  kitchenPreviewStats,
} from '@/features/kitchen/config';
import type { KitchenConnectionStatus, KitchenOrder, KitchenStats } from '@/features/kitchen/types';

/**
 * Loads kitchen tickets for the active venue.
 * Uses design preview data until the kitchen / POS API is wired.
 */
export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  return kitchenPreviewOrders;
}

export async function getKitchenStatsSummary(): Promise<KitchenStats> {
  return kitchenPreviewStats;
}

export async function getKitchenConnectionStatus(): Promise<KitchenConnectionStatus> {
  return kitchenPreviewConnection;
}
