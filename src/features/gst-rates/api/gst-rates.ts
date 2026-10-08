import { clientApi } from '@/lib/client-api';
import type { CreateGstRateInput, GstRate } from '../types/gst-rate';
import type {
  CreateGstRateApiRequest,
  GstRateApi,
  GstRateId,
  ListGstRatesApiQuery,
} from '../types/gst-rate-api';

export function mapGstRateApi(rate: GstRateApi): GstRate {
  return {
    id: String(rate.id),
    code: rate.code,
    name: rate.name,
    cgstRate: rate.cgst_rate,
    sgstRate: rate.sgst_rate,
    igstRate: rate.igst_rate,
    totalRate: rate.total_rate,
    effectiveFrom: rate.effective_from,
    effectiveTo: rate.effective_to,
    status: rate.status,
    createdAt: rate.created_at,
    updatedAt: rate.updated_at,
  };
}

export function mapGstRatesApi(rates: readonly GstRateApi[] | null | undefined): GstRate[] {
  if (!rates || !Array.isArray(rates)) return [];
  return rates.map(mapGstRateApi);
}

export function unwrapGstRateList(data: unknown): GstRateApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as GstRateApi[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['items', 'data', 'gst_rates']) {
      if (Array.isArray(obj[key])) return obj[key] as GstRateApi[];
    }
  }
  return [];
}

export function toCreateGstRatePayload(input: CreateGstRateInput): CreateGstRateApiRequest {
  return {
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    cgst_rate: input.cgstRate,
    sgst_rate: input.sgstRate,
    igst_rate: input.igstRate,
    total_rate: input.totalRate,
    effective_from: input.effectiveFrom,
    effective_to: input.effectiveTo ?? null,
  };
}

export async function fetchGstRatesClient(query?: ListGstRatesApiQuery): Promise<GstRate[]> {
  const params = new URLSearchParams();
  if (query?.code?.trim()) params.set('code', query.code.trim());
  if (query?.active_only) params.set('active_only', 'true');
  const qs = params.toString();
  const res = await clientApi.get<{ success?: boolean; data?: unknown }>(
    `/menu/gst-rates${qs ? `?${qs}` : ''}`,
  );
  const unwrapped = unwrapGstRateList(res?.data ?? res);
  return mapGstRatesApi(unwrapped);
}

export async function fetchGstRateByIdClient(id: GstRateId): Promise<GstRate | null> {
  const res = await clientApi.get<{ success?: boolean; data?: GstRateApi }>(
    `/menu/gst-rates/${encodeURIComponent(id)}`,
  );
  if (!res?.data) return null;
  return mapGstRateApi(res.data);
}

export async function createGstRateClient(input: CreateGstRateInput): Promise<GstRate> {
  const body = toCreateGstRatePayload(input);
  const res = await clientApi.post<{ success?: boolean; data?: GstRateApi }>(
    '/menu/gst-rates',
    body,
  );
  if (!res?.data) throw new Error('Failed to create GST rate');
  return mapGstRateApi(res.data);
}

export function formatGstRateLabel(rate: GstRate): string {
  if (!rate.code) {
    return `${rate.name} (${rate.totalRate}%)`;
  }
  if (rate.name && rate.name.trim().toLowerCase() !== rate.code.trim().toLowerCase()) {
    return `${rate.code} – ${rate.name} (${rate.totalRate}%)`;
  }
  return `${rate.code} (${rate.totalRate}%)`;
}

export function resolveGstDisplayValue(rate: GstRate): string {
  return `${rate.totalRate}%`;
}
