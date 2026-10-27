'use client';

import { useMemo } from 'react';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import { toApiOrderType, toPosOrderItem, type OrderType } from '@/lib/helpers/posAllOrdersHelpers';
import { parsePosOrderList } from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';
import { api } from '@/services/api/browserClient';
import { branchOrdersPath } from '@/services/api/ApiUrlsV1';

export type PosOrdersListParams = {
  /** UI filter tab; sent as `order_type` when not `all`. */
  orderType?: OrderType;
  page?: number;
  pageSize?: number;
  /** Backend status filter; defaults to open running orders. */
  status?: string;
  /** Order number / table / bill search. */
  search?: string;
};

export const posOrdersQueryKey = (branchId: number, params?: PosOrdersListParams) =>
  ['pos', 'point-of-sale', 'all-orders', branchId, params ?? {}] as const;

/**
 * Running POS orders for All Orders.
 * GET /v1/branches/{branch_id}/orders
 */
export function usePosOrders(params?: PosOrdersListParams, branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const orderType = params?.orderType ?? 'all';
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 15;
  const status = params?.status ?? 'open';
  const search = params?.search?.trim() || undefined;

  const listParams = useMemo(
    () => ({
      orderType,
      page,
      pageSize,
      status,
      search,
    }),
    [orderType, page, pageSize, status, search],
  );

  return useQuery({
    queryKey: posOrdersQueryKey(activeBranchId, listParams),
    queryFn: async ({ signal }) => {
      const apiOrderType = toApiOrderType(orderType);
      const payload = await api.get(
        branchOrdersPath(activeBranchId),
        {
          status,
          page,
          page_size: pageSize,
          ...(apiOrderType ? { order_type: apiOrderType } : {}),
          ...(search ? { search } : {}),
        },
        signal,
      );
      const data = parsePosOrderList(payload);
      return {
        ...data,
        rows: data.items.map(toPosOrderItem),
      };
    },
  });
}
