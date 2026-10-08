'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createGstRateClient, fetchGstRateByIdClient, fetchGstRatesClient } from '../api/gst-rates';
import type { CreateGstRateInput } from '../types/gst-rate';
import type { GstRateId, ListGstRatesApiQuery } from '../types/gst-rate-api';

export const gstRatesQueryKey = (query?: ListGstRatesApiQuery) =>
  ['gst-rates', 'list', query ?? {}] as const;

export const gstRateDetailQueryKey = (id: GstRateId) => ['gst-rates', 'detail', id] as const;

export function useGstRatesListQuery(query?: ListGstRatesApiQuery) {
  return useQuery({
    queryKey: gstRatesQueryKey(query),
    queryFn: () => fetchGstRatesClient(query),
  });
}

export function useGstRateDetailQuery(gstRateId: GstRateId | null) {
  return useQuery({
    queryKey: gstRateDetailQueryKey(gstRateId ?? ''),
    queryFn: () => fetchGstRateByIdClient(gstRateId!),
    enabled: Boolean(gstRateId),
  });
}

export function useCreateGstRateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGstRateInput) => createGstRateClient(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['gst-rates'] });
    },
  });
}
