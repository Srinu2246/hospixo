import type { CreateGstRateBody } from '@/lib/schemas/menu/gstRatesSchema';

/** Round percentage fields to two decimals for the API. */
export function roundGstRate(value: number): number {
  return Number(value.toFixed(2));
}

/** Backend rule: `total_rate = cgst_rate + sgst_rate + igst_rate`. */
export function computeGstApiTotalRate(cgst: number, sgst: number, igst: number): number {
  return roundGstRate(cgst + sgst + igst);
}

export type ResolvedGstSlabRates = {
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  total_rate: number;
};

/**
 * Slab math for form display and POST (matches API validation).
 * Components are kept as entered; total is always their sum.
 */
export function resolveGstSlabRates(
  cgst: number,
  sgst: number,
  igst: number,
): ResolvedGstSlabRates {
  const cgst_rate = roundGstRate(cgst);
  const sgst_rate = roundGstRate(sgst);
  const igst_rate = roundGstRate(igst);
  const total_rate = computeGstApiTotalRate(cgst_rate, sgst_rate, igst_rate);

  return { cgst_rate, sgst_rate, igst_rate, total_rate };
}

/** POST body aligned with `/v1/restaurant/gst-rates` validation. */
export function normalizeCreateGstRateBodyForApi(body: CreateGstRateBody): Record<string, unknown> {
  const rates = resolveGstSlabRates(body.cgst_rate, body.sgst_rate, body.igst_rate);

  const payload: Record<string, unknown> = {
    code: body.code.trim(),
    name: body.name.trim(),
    ...rates,
    effective_to: body.effective_to ?? null,
  };
  if (body.effective_from) {
    payload.effective_from = body.effective_from;
  }
  return payload;
}

export function toGstDateInputValue(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Combine local date + `HH:mm` into ISO string for the API. */
export function mergeGstEffectiveDateTime(date: Date | null, time: string): string {
  if (!date) return '';
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  const hour = match ? Number(match[1]) : 0;
  const minute = match ? Number(match[2]) : 0;
  const merged = new Date(date);
  merged.setHours(hour, minute, 0, 0);
  return merged.toISOString();
}

/** Compare effective from/to (date-only, start of day). */
export function isGstEffectiveRangeValid(fromDate: Date, toDate: Date): boolean {
  const fromIso = mergeGstEffectiveDateTime(fromDate, '00:00');
  const toIso = mergeGstEffectiveDateTime(toDate, '00:00');
  if (!fromIso || !toIso) return true;
  return new Date(toIso).getTime() >= new Date(fromIso).getTime();
}
