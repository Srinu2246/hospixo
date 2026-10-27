import { z } from 'zod';

import { ApiError } from '@/services/api/types';

/** Default list page size from GET /v1/restaurant/gst-rates. */
export const GST_RATES_LIST_PAGE_SIZE = 15;

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

/** GST rate record from /api/v1/restaurant/gst-rates (api.md). */
export const gstRateSchema = z.object({
  id: z.number(),
  organization_id: nullableNumber,
  company_id: nullableNumber,
  code: z.string().min(1),
  name: z.string().min(1),
  cgst_rate: z.number().min(0),
  sgst_rate: z.number().min(0),
  igst_rate: z.number().min(0),
  total_rate: z.number().min(0),
  effective_from: z.string().min(1),
  effective_to: nullableText,
  is_active: z.boolean().default(true),
  created_at: nullableText,
  updated_at: nullableText,
});

/** POST /api/v1/restaurant/gst-rates body. */
export const createGstRateBodySchema = z.object({
  code: z.string().trim().min(1, 'GST code is required'),
  name: z.string().trim().min(1, 'GST name is required'),
  cgst_rate: z.coerce.number().min(0, 'CGST must be 0 or greater'),
  sgst_rate: z.coerce.number().min(0, 'SGST must be 0 or greater'),
  igst_rate: z.coerce.number().min(0, 'IGST must be 0 or greater'),
  total_rate: z.coerce.number().min(0, 'Total rate must be 0 or greater'),
  effective_from: z.string().min(1, 'Effective from is required'),
  effective_to: z.string().optional(),
});

const envelope = <T extends z.ZodType>(data: T) =>
  z.object({
    success: z.boolean(),
    data,
    message: nullableText,
    request_id: nullableText,
  });

export const gstRateListDataSchema = z.object({
  items: z.array(gstRateSchema),
  total: z.number(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export const gstRateListEnvelopeSchema = envelope(gstRateListDataSchema);
export const gstRateDetailEnvelopeSchema = envelope(gstRateSchema);

export const gstRateListSchema = z.array(gstRateSchema);

export type GstRate = z.infer<typeof gstRateSchema>;
export type CreateGstRateBody = z.infer<typeof createGstRateBodySchema>;
export type GstRateListData = z.infer<typeof gstRateListDataSchema>;

export type GstRateListParams = {
  code?: string;
  active_only?: boolean;
  page?: number;
  page_size?: number;
};

export function parseGstRateList(payload: unknown): GstRateListData {
  const parsed = gstRateListEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected GST rates response', 502);
  }
  return parsed.data.data;
}

export function parseGstRateRecord(payload: unknown): GstRate {
  const parsed = gstRateDetailEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected GST rate response', 502);
  }
  return parsed.data.data;
}
