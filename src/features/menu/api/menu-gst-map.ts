import type { GstRateApi } from '@/features/gst-rates/types/gst-rate-api';
import type { MenuItemTaxApi } from '../types/menu-item-api';

export const DEFAULT_GST_PERCENT = 5;

export const DEFAULT_GST_RATE_ID = 1;

const GST_RATE_ID_BY_PERCENT: Readonly<Record<number, number>> = {
  0: 1,
  5: 1,
  12: 2,
  18: 3,
  28: 4,
};

export function parseGstPercent(value?: string | null): number {
  if (!value?.trim()) return DEFAULT_GST_PERCENT;
  const parsed = Number.parseFloat(value.replace('%', '').trim());
  return Number.isFinite(parsed) ? parsed : DEFAULT_GST_PERCENT;
}

export function resolveGstRateId(gst?: string | null): number {
  const percent = parseGstPercent(gst);
  return GST_RATE_ID_BY_PERCENT[percent] ?? DEFAULT_GST_RATE_ID;
}

function coerceCatalogRateId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value);
  return null;
}

export function resolveGstRateIdFromCatalog(
  gst: string | null | undefined,
  rates: readonly GstRateApi[],
): number | null {
  if (rates.length === 0) return null;

  const percent = parseGstPercent(gst);
  const exact = rates.find((rate) => Math.abs(rate.total_rate - percent) < 0.001);
  if (exact) return coerceCatalogRateId(exact.id);

  const nearest = [...rates].sort(
    (left, right) => Math.abs(left.total_rate - percent) - Math.abs(right.total_rate - percent),
  )[0];
  return nearest ? coerceCatalogRateId(nearest.id) : null;
}

export function resolveGstPercentFromCatalog(
  gstRateId: number | null | undefined,
  rates: readonly GstRateApi[],
): number | null {
  if (gstRateId == null) return null;
  return rates.find((rate) => rate.id === gstRateId)?.total_rate ?? null;
}

export function buildGstPercentByRateId(rates: readonly GstRateApi[]): Record<number, number> {
  return Object.fromEntries(rates.map((rate) => [rate.id, rate.total_rate]));
}

export function formatGstPercent(value?: string | null): string {
  return `${parseGstPercent(value)}%`;
}

export function toMenuItemTaxesFromGst(
  gst?: string | null,
  isInclusive = false,
  gstRateId?: number | null,
): MenuItemTaxApi[] {
  const resolvedRateId =
    gstRateId != null && Number.isFinite(gstRateId) && gstRateId > 0
      ? gstRateId
      : gstRateId === undefined
        ? resolveGstRateId(gst)
        : null;

  if (resolvedRateId == null || !Number.isFinite(resolvedRateId) || resolvedRateId <= 0) {
    return [];
  }

  return [
    {
      gst_rate_id: resolvedRateId,
      is_inclusive: isInclusive,
    },
  ];
}
