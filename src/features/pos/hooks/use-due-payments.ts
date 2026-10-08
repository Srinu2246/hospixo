'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchDuePayments } from '@/features/pos/api/due-payments';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';

export const duePaymentsQueryKey = (outletId: string | null) =>
  ['pos', 'due-payments', outletId ?? 'none'] as const;

export function useDuePaymentsQuery() {
  const outletId = useFloorBranchOutletId();

  return useQuery({
    queryKey: duePaymentsQueryKey(outletId),
    queryFn: async () => {
      const response = await fetchDuePayments(outletId);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Unable to load due payments.');
      }
      if (response.data.loadError && response.data.payments.length === 0) {
        throw new Error(response.data.loadError);
      }
      return response.data;
    },
  });
}

export function useSettleDuePaymentMutation(outletId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const params = new URLSearchParams();
      if (outletId?.trim()) params.set('outlet', outletId.trim());
      const suffix = params.size > 0 ? `?${params.toString()}` : '';
      const response = await fetch(
        `/api/pos/due-payments/${encodeURIComponent(paymentId)}/settle${suffix}`,
        {
          method: 'POST',
          credentials: 'same-origin',
        },
      );
      const json = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !json.success) {
        throw new Error(json.message ?? 'Unable to settle payment.');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: duePaymentsQueryKey(outletId) });
    },
  });
}
