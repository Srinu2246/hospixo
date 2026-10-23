'use client';

import { useQuery } from '@tanstack/react-query';

import { parseCurrentShift } from '@/lib/schemas/pos/point-of-sale/cash-and-shift/currentShiftSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

const currentShiftKey = (branchId: number | undefined) =>
  ['pos', 'point-of-sale', 'cash-and-shift', 'current', branchId] as const;

/** GET /v1/branches/{branch_id}/shifts/current — `null` when no shift is open. */
export function useCurrentShift(branchId: number | undefined) {
  return useQuery({
    queryKey: currentShiftKey(branchId),
    enabled: typeof branchId === 'number',
    staleTime: 15_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.pos.pointOfSale.cashAndShift.current(branchId as number),
        undefined,
        signal,
      );
      return parseCurrentShift(payload);
    },
  });
}
