import 'server-only';

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import {
  restaurantBranchDuePaymentsPath,
  restaurantBranchKitchenOrdersPath,
  restaurantBranchOrderPath,
  restaurantBranchOrdersListPath,
  type RestaurantBranchOrdersListQuery,
} from '@/lib/api/paths';

function withAuth(token: string) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

function normalizeListPayload<T>(payload: unknown): { items: T[]; total: number } {
  if (Array.isArray(payload)) {
    return { items: payload as T[], total: payload.length };
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.items)) {
      const total =
        typeof record.total === 'number'
          ? record.total
          : typeof record.count === 'number'
            ? record.count
            : record.items.length;
      return { items: record.items as T[], total };
    }
    if (Array.isArray(record.data)) {
      return { items: record.data as T[], total: record.data.length };
    }
    if (Array.isArray(record.orders)) {
      return { items: record.orders as T[], total: record.orders.length };
    }
  }
  return { items: [], total: 0 };
}

export type RestaurantOrderRecord = Readonly<Record<string, unknown>>;

export async function listBranchOrders(
  token: string,
  branchId: number,
  query?: RestaurantBranchOrdersListQuery,
): Promise<readonly RestaurantOrderRecord[]> {
  const path = restaurantBranchOrdersListPath(branchId, query);
  const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
  return normalizeListPayload<RestaurantOrderRecord>(payload).items;
}

export async function listBranchKitchenOrders(
  token: string,
  branchId: number,
): Promise<readonly RestaurantOrderRecord[]> {
  try {
    const path = restaurantBranchKitchenOrdersPath(branchId);
    const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
    return normalizeListPayload<RestaurantOrderRecord>(payload).items;
  } catch {
    return listBranchOrders(token, branchId, {
      kitchen_status: 'new,preparing,ready,kot_sent',
    });
  }
}

export async function listBranchDuePayments(
  token: string,
  branchId: number,
): Promise<readonly RestaurantOrderRecord[]> {
  try {
    const path = restaurantBranchDuePaymentsPath(branchId);
    const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
    return normalizeListPayload<RestaurantOrderRecord>(payload).items;
  } catch {
    return listBranchOrders(token, branchId, { payment_status: 'due,unpaid,overdue' });
  }
}

export async function patchBranchOrder(
  token: string,
  branchId: number,
  orderId: string | number,
  body: Readonly<Record<string, unknown>>,
): Promise<RestaurantOrderRecord> {
  const path = restaurantBranchOrderPath(branchId, orderId);
  return apiFetch<RestaurantOrderRecord>(path, {
    ...withAuth(token),
    method: 'PATCH',
    body,
  });
}
