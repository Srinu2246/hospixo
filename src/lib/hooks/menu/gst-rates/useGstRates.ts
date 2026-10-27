'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { normalizeCreateGstRateBodyForApi } from '@/lib/helpers/gstRatesHelpers';
import {
  GST_RATES_LIST_PAGE_SIZE,
  parseGstRateList,
  parseGstRateRecord,
  type CreateGstRateBody,
  type GstRateListParams,
} from '@/lib/schemas/menu/gstRatesSchema';
import { api } from '@/services/api/browserClient';
import { restaurantGstRatePath, restaurantGstRatesPath } from '@/services/api/ApiUrlsV1';

const gstRatesKey = (params?: GstRateListParams) =>
  ['restaurant', 'gst-rates', params ?? {}] as const;

const gstRateKey = (gstRateId: number | undefined) =>
  ['restaurant', 'gst-rate', gstRateId] as const;

function listParams(params?: GstRateListParams) {
  return {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? GST_RATES_LIST_PAGE_SIZE,
    ...(params?.code?.trim() ? { code: params.code.trim() } : {}),
    ...(params?.active_only ? { active_only: true } : {}),
  };
}

/**
 * List GST rates.
 * GET /v1/restaurant/gst-rates?code&active_only&page&page_size
 */
export function useGstRates(params?: GstRateListParams) {
  return useQuery({
    queryKey: gstRatesKey(params),
    queryFn: async ({ signal }) => {
      const payload = await api.get(restaurantGstRatesPath(), listParams(params), signal);
      return parseGstRateList(payload);
    },
  });
}

/**
 * Single GST rate.
 * GET /v1/restaurant/gst-rates/{gst_rate_id}
 */
export function useGstRate(gstRateId: number | undefined) {
  return useQuery({
    queryKey: gstRateKey(gstRateId),
    enabled: typeof gstRateId === 'number' && Number.isFinite(gstRateId),
    queryFn: async ({ signal }) => {
      const payload = await api.get(restaurantGstRatePath(gstRateId as number), undefined, signal);
      return parseGstRateRecord(payload);
    },
  });
}

/**
 * Create GST rate.
 * POST /v1/restaurant/gst-rates
 */
export function useCreateGstRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateGstRateBody) => {
      const payload = await api.post(
        restaurantGstRatesPath(),
        normalizeCreateGstRateBodyForApi(body),
        { silent: true },
      );
      return parseGstRateRecord(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'gst-rates'] });
    },
  });
}
