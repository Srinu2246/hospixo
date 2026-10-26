import { z } from 'zod';

import {
  isGstEffectiveRangeValid,
  mergeGstEffectiveDateTime,
  resolveGstSlabRates,
} from '@/lib/helpers/gstRatesHelpers';

import { createGstRateBodySchema, type CreateGstRateBody } from '../gstRatesSchema';

const rateInput = z
  .string()
  .trim()
  .min(1, 'Rate is required')
  .refine((value) => !Number.isNaN(Number(value)), 'Enter a valid number');

/** Form field keys for inline validation messages. */
export type CreateGstRateFormField =
  | 'code'
  | 'name'
  | 'cgst_rate'
  | 'sgst_rate'
  | 'igst_rate'
  | 'total_rate'
  | 'effective_from_date'
  | 'effective_to_date';

export type CreateGstRateFormFieldErrors = Partial<Record<CreateGstRateFormField, string>>;

/** Client create form fields (validated before POST body mapping). */
export const createGstRateFormFieldsSchema = z
  .object({
    code: z.string().trim().min(1, 'GST code is required'),
    name: z.string().trim().min(1, 'GST name is required'),
    cgst_rate: rateInput,
    sgst_rate: rateInput,
    igst_rate: rateInput,
    total_rate: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || !Number.isNaN(Number(value)), 'Enter a valid total rate'),
    effective_from_date: z.date().optional(),
    effective_to_date: z.date().nullable().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.effective_from_date &&
      values.effective_to_date &&
      !isGstEffectiveRangeValid(values.effective_from_date, values.effective_to_date)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Effective to must be on or after effective from.',
        path: ['effective_to_date'],
      });
    }
  });

export type CreateGstRateFormValues = z.infer<typeof createGstRateFormFieldsSchema>;

export function mapCreateGstRateFormIssues(error: z.ZodError): CreateGstRateFormFieldErrors {
  const fieldErrors: CreateGstRateFormFieldErrors = {};
  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (typeof fieldName !== 'string') continue;
    if (fieldName in fieldErrors && fieldErrors[fieldName as CreateGstRateFormField]) continue;
    fieldErrors[fieldName as CreateGstRateFormField] = issue.message;
  }
  return fieldErrors;
}

export function toCreateGstRateBody(values: CreateGstRateFormValues): CreateGstRateBody {
  const cgst = Number(values.cgst_rate);
  const sgst = Number(values.sgst_rate);
  const igst = Number(values.igst_rate);
  const rates = resolveGstSlabRates(cgst, sgst, igst);

  const effective_from = values.effective_from_date
    ? mergeGstEffectiveDateTime(values.effective_from_date, '00:00')
    : undefined;
  const effective_to = values.effective_to_date
    ? mergeGstEffectiveDateTime(values.effective_to_date, '00:00')
    : undefined;

  return createGstRateBodySchema.parse({
    code: values.code,
    name: values.name,
    ...rates,
    ...(effective_from ? { effective_from } : {}),
    effective_to: effective_to || undefined,
  });
}

export type ParseCreateGstRateFormResult =
  | { success: true; data: CreateGstRateBody }
  | { success: false; fieldErrors: CreateGstRateFormFieldErrors; formError?: string };

/** Validate form input and map to POST body. */
export function parseCreateGstRateForm(
  input: CreateGstRateFormValues,
): ParseCreateGstRateFormResult {
  const parsed = createGstRateFormFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: mapCreateGstRateFormIssues(parsed.error) };
  }

  try {
    return { success: true, data: toCreateGstRateBody(parsed.data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        fieldErrors: mapCreateGstRateFormIssues(error),
        formError: 'Could not build GST rate. Check all fields.',
      };
    }
    return {
      success: false,
      fieldErrors: {},
      formError: 'Could not build GST rate. Check all fields.',
    };
  }
}

const API_FIELD_TO_FORM: Record<string, CreateGstRateFormField> = {
  code: 'code',
  name: 'name',
  cgst_rate: 'cgst_rate',
  sgst_rate: 'sgst_rate',
  igst_rate: 'igst_rate',
  total_rate: 'total_rate',
  effective_from: 'effective_from_date',
  effective_to: 'effective_to_date',
};

/** Map API 422 `detail[]` validation entries to form field errors. */
export function mapApiValidationToGstFormErrors(details: unknown): CreateGstRateFormFieldErrors {
  const fieldErrors: CreateGstRateFormFieldErrors = {};
  if (!details || typeof details !== 'object') return fieldErrors;

  const record = details as Record<string, unknown>;
  const detail = record.detail;
  if (!Array.isArray(detail)) return fieldErrors;

  for (const item of detail) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { loc?: unknown[]; msg?: string; message?: string };
    const message =
      typeof row.msg === 'string'
        ? row.msg
        : typeof row.message === 'string'
          ? row.message
          : undefined;
    if (!message || !Array.isArray(row.loc)) continue;

    const last = row.loc[row.loc.length - 1];
    if (typeof last !== 'string') continue;
    const formField = API_FIELD_TO_FORM[last];
    if (formField && !fieldErrors[formField]) {
      fieldErrors[formField] = message;
    }
  }

  return fieldErrors;
}
