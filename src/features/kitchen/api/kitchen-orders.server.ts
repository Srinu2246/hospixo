import 'server-only';

import { mapKitchenOrderRecord } from '@/features/pos/lib/map-restaurant-pos-records';
import type { KitchenOrder } from '@/features/kitchen/types';
import { listBranchKitchenOrders } from '@/lib/api/restaurant-branch-pos';
import { resolveFloorRequestContext, type FloorRequestOptions } from '@/lib/floors-server';

export type KitchenOrdersPayload = Readonly<{
  orders: KitchenOrder[];
  branchId: number | null;
  loadError: string | null;
}>;

export async function loadKitchenOrdersData(
  options: FloorRequestOptions = {},
): Promise<KitchenOrdersPayload> {
  const ctx = await resolveFloorRequestContext(options);
  if (!ctx.token) {
    return { orders: [], branchId: ctx.branchId, loadError: 'Sign in required.' };
  }
  if (ctx.branchId == null) {
    return { orders: [], branchId: null, loadError: ctx.error };
  }

  try {
    const records = await listBranchKitchenOrders(ctx.token, ctx.branchId);
    const orders = records
      .map(mapKitchenOrderRecord)
      .filter((order): order is KitchenOrder => order != null);
    return { orders, branchId: ctx.branchId, loadError: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to load kitchen orders.';
    return { orders: [], branchId: ctx.branchId, loadError: message };
  }
}
