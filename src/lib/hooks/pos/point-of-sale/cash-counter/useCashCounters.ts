'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  parseCashCounterDetail,
  parseCashCounterList,
  type CreateCashCounterBody,
  type UpdateCashCounterBody,
} from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { ApiError } from '@/services/api/types';

const cashCountersKey = (branchId: number | undefined) =>
  ['pos', 'point-of-sale', 'cash-counter', branchId] as const;

const cashCounterKey = (branchId: number | undefined, registerId: number | undefined) =>
  ['pos', 'point-of-sale', 'cash-counter', branchId, registerId] as const;

function requireBranch(branchId: number | undefined): number {
  if (typeof branchId !== 'number') {
    throw new ApiError('Select a branch before managing cash counters.', 400);
  }
  return branchId;
}

/** GET /v1/branches/{branch_id}/cash-registers */
export function useCashCounters(branchId: number | undefined) {
  return useQuery({
    queryKey: cashCountersKey(branchId),
    enabled: typeof branchId === 'number',
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.pos.pointOfSale.cashCounter.list(branchId as number),
        undefined,
        signal,
      );
      return parseCashCounterList(payload);
    },
  });
}

/** GET /v1/branches/{branch_id}/cash-registers/{register_id} */
export function useCashCounter(branchId: number | undefined, registerId: number | undefined) {
  return useQuery({
    queryKey: cashCounterKey(branchId, registerId),
    enabled: typeof branchId === 'number' && typeof registerId === 'number',
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.pos.pointOfSale.cashCounter.detail(branchId as number, registerId as number),
        undefined,
        signal,
      );
      return parseCashCounterDetail(payload);
    },
  });
}

/** POST /v1/branches/{branch_id}/cash-registers */
export function useCreateCashCounter(branchId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateCashCounterBody) => {
      const payload = await api.post(
        ApiUrlsV1.pos.pointOfSale.cashCounter.create(requireBranch(branchId)),
        body,
      );
      return parseCashCounterDetail(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cashCountersKey(branchId) });
    },
  });
}

/** PATCH /v1/branches/{branch_id}/cash-registers/{register_id} */
export function useUpdateCashCounter(branchId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { registerId: number; body: UpdateCashCounterBody }) => {
      const payload = await api.patch(
        ApiUrlsV1.pos.pointOfSale.cashCounter.update(requireBranch(branchId), input.registerId),
        input.body,
      );
      return parseCashCounterDetail(payload);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cashCountersKey(branchId) }),
        queryClient.invalidateQueries({
          queryKey: cashCounterKey(branchId, variables.registerId),
        }),
      ]);
    },
  });
}
