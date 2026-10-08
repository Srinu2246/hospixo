import { clientApi } from '@/lib/client-api';
import type { GstRate } from '@/features/gst-rates/types/gst-rate';
import {
  unwrapGstRateList,
  mapGstRatesApi,
  mapGstRateApi,
} from '@/features/gst-rates/api/gst-rates';
import type { GstRateApi } from '@/features/gst-rates/types/gst-rate-api';

type GstApiResponse = {
  success?: boolean;
  data?: unknown;
};

let inFlightGstRates: Promise<readonly GstRate[]> | null = null;
let cachedGstRates: readonly GstRate[] | null = null;

let inFlightActiveGstRates: Promise<readonly GstRate[]> | null = null;
let cachedActiveGstRates: readonly GstRate[] | null = null;

const inFlightGstRateDetail = new Map<string, Promise<GstRate | null>>();
const cachedGstRateDetail = new Map<string, GstRate>();

/**
 * Clear the in-memory cache of GST rates.
 * Call this when GST rates are created or updated.
 */
export function clearGstRatesCache(): void {
  inFlightGstRates = null;
  cachedGstRates = null;
  inFlightActiveGstRates = null;
  cachedActiveGstRates = null;
  inFlightGstRateDetail.clear();
  cachedGstRateDetail.clear();
}

/**
 * Fetch GST rates with single-flight request deduplication and in-memory caching.
 * Calls BFF `/api/menu/gst-rates`.
 */
export async function fetchGstRates(
  options: {
    activeOnly?: boolean;
    code?: string;
    forceRefresh?: boolean;
  } = {},
): Promise<readonly GstRate[]> {
  const { activeOnly, code, forceRefresh } = options;
  const isDefaultActive = Boolean(activeOnly) && !code;
  const isDefaultAll = !activeOnly && !code;

  if (!forceRefresh) {
    if (isDefaultActive && cachedActiveGstRates !== null) {
      return cachedActiveGstRates;
    }
    if (isDefaultAll && cachedGstRates !== null) {
      return cachedGstRates;
    }
  }

  if (!forceRefresh) {
    if (isDefaultActive && inFlightActiveGstRates !== null) {
      return inFlightActiveGstRates;
    }
    if (isDefaultAll && inFlightGstRates !== null) {
      return inFlightGstRates;
    }
  }

  const queryParams = new URLSearchParams();
  if (activeOnly) queryParams.set('active_only', 'true');
  if (code?.trim()) queryParams.set('code', code.trim());
  const qs = queryParams.toString();
  const queryString = qs ? `?${qs}` : '';
  const path = `/menu/gst-rates${queryString}`;

  const requestPromise = (async () => {
    try {
      const res = await clientApi.get<GstApiResponse>(path);
      const unwrapped = unwrapGstRateList(res?.data ?? res);
      const items = mapGstRatesApi(unwrapped);

      if (isDefaultActive) {
        cachedActiveGstRates = items;
      } else if (isDefaultAll) {
        cachedGstRates = items;
      }
      for (const item of items) {
        cachedGstRateDetail.set(item.id, item);
      }
      return items;
    } catch (err) {
      if (isDefaultActive) cachedActiveGstRates = null;
      if (isDefaultAll) cachedGstRates = null;
      throw err;
    } finally {
      if (isDefaultActive) inFlightActiveGstRates = null;
      if (isDefaultAll) inFlightGstRates = null;
    }
  })();

  if (isDefaultActive) inFlightActiveGstRates = requestPromise;
  if (isDefaultAll) inFlightGstRates = requestPromise;

  return requestPromise;
}

/**
 * Fetch a single GST rate by ID with single-flight request deduplication and in-memory caching.
 */
export async function fetchGstRateById(
  id: string,
  options: { forceRefresh?: boolean } = {},
): Promise<GstRate | null> {
  if (!id) return null;

  if (!options.forceRefresh && cachedGstRateDetail.has(id)) {
    return cachedGstRateDetail.get(id)!;
  }

  if (!options.forceRefresh && inFlightGstRateDetail.has(id)) {
    return inFlightGstRateDetail.get(id)!;
  }

  const requestPromise = (async () => {
    try {
      const res = await clientApi.get<{ success?: boolean; data?: GstRateApi }>(
        `/menu/gst-rates/${encodeURIComponent(id)}`,
      );
      const item = res?.data ? mapGstRateApi(res.data) : null;
      if (item) {
        cachedGstRateDetail.set(id, item);
      }
      return item;
    } catch (err) {
      cachedGstRateDetail.delete(id);
      throw err;
    } finally {
      inFlightGstRateDetail.delete(id);
    }
  })();

  inFlightGstRateDetail.set(id, requestPromise);
  return requestPromise;
}
