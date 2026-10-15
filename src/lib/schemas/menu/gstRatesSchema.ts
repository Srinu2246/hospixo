import { z } from 'zod';

export const gstRateSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  cgst: z.number().min(0),
  sgst: z.number().min(0),
  igst: z.number().min(0),
  total: z.number().min(0),
  effectiveFrom: z.string().min(1),
  effectiveTo: z.string().optional(),
  active: z.boolean().default(true),
});

export const createGstRateInputSchema = z.object({
  code: z.string().trim().min(1, 'GST code is required'),
  name: z.string().trim().min(1, 'GST name is required'),
  cgst: z.coerce.number().min(0, 'CGST must be 0 or greater'),
  sgst: z.coerce.number().min(0, 'SGST must be 0 or greater'),
  igst: z.coerce.number().min(0, 'IGST must be 0 or greater'),
  total: z.coerce.number().min(0).optional(),
  effectiveFrom: z.string().min(1, 'Effective from is required'),
  effectiveTo: z.string().optional(),
});

export const gstRateListSchema = z.array(gstRateSchema);

export type GstRate = z.infer<typeof gstRateSchema>;
export type CreateGstRateInput = z.infer<typeof createGstRateInputSchema>;
