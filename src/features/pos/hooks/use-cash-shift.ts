'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchPosCashShift } from '@/features/pos/api/cash-shift';
import type { PosCashShiftPayload } from '@/features/pos/api/cash-shift.server';

export const posCashShiftQueryKey = ['pos', 'cash-shift'] as const;

export function usePosCashShift(initialData?: PosCashShiftPayload) {
  return useQuery({
    queryKey: posCashShiftQueryKey,
    queryFn: async () => {
      const response = await fetchPosCashShift();
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load cash counter.');
      }
      return response.data;
    },
    initialData,
    staleTime: 30_000,
  });
}
