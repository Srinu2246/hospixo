import 'server-only';

import {
  isOnlineAggregatorRecord,
  mapOnlineOrderRecord,
  mapOpenOrderRecord,
  mapReadyOrderRecord,
} from '@/features/pos/lib/branch-order-mappers';
import type { OnlineOrder } from '@/features/pos/config/online-orders';
import type { OpenOrder } from '@/features/pos/config/open-orders';
import type { ReadyOrder } from '@/features/pos/config/ready-list';
import { listBranchOrders } from '@/lib/api/restaurant-branch-pos';
import type { RestaurantBranchOrdersListQuery } from '@/lib/api/paths';
import { resolveFloorRequestContext, type FloorRequestOptions } from '@/lib/floors-server';

export type BranchOrdersPayload<T> = Readonly<{
  orders: T[];
  branchId: number | null;
  loadError: string | null;
}>;

async function loadOrderRecords(
  options: FloorRequestOptions,
  query?: RestaurantBranchOrdersListQuery,
) {
  const ctx = await resolveFloorRequestContext(options);
  if (!ctx.token) {
    return {
      ctx,
      records: [] as const,
      loadError: 'Sign in required.' as string | null,
    };
  }
  if (ctx.branchId == null) {
    return { ctx, records: [] as const, loadError: ctx.error };
  }

  try {
    const records = await listBranchOrders(ctx.token, ctx.branchId, query);
    return { ctx, records, loadError: null as string | null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to load orders.';
    return { ctx, records: [] as const, loadError: message };
  }
}

export async function loadOnlineOrdersData(
  options: FloorRequestOptions = {},
): Promise<BranchOrdersPayload<OnlineOrder>> {
  const initial = await loadOrderRecords(options, { channel: 'online' });
  const ctx = initial.ctx;
  let records = initial.records;
  let loadError = initial.loadError;

  if (records.length === 0 && !loadError) {
    const fallback = await loadOrderRecords(options);
    records = fallback.records;
    loadError = fallback.loadError;
  }

  const orders = records
    .filter(isOnlineAggregatorRecord)
    .map(mapOnlineOrderRecord)
    .filter((order): order is OnlineOrder => order != null);

  return { orders, branchId: ctx.branchId, loadError };
}

export async function loadReadyOrdersData(
  options: FloorRequestOptions = {},
): Promise<BranchOrdersPayload<ReadyOrder>> {
  const { ctx, records, loadError } = await loadOrderRecords(options, {
    kitchen_status: 'new,preparing,ready,kot_sent,served',
  });

  const orders = records
    .map(mapReadyOrderRecord)
    .filter((order): order is ReadyOrder => order != null);

  return { orders, branchId: ctx.branchId, loadError };
}

export async function loadOpenOrdersData(
  options: FloorRequestOptions = {},
): Promise<BranchOrdersPayload<OpenOrder>> {
  const { ctx, records, loadError } = await loadOrderRecords(options);

  const orders = records
    .map(mapOpenOrderRecord)
    .filter((order): order is OpenOrder => order != null);

  return { orders, branchId: ctx.branchId, loadError };
}
