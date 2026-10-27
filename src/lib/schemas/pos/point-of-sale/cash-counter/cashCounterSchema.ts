import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

export const cashCounterStatusSchema = z.enum(['active', 'inactive']);

export const cashCounterTypeSchema = z.enum(['billing', 'takeaway', 'delivery']);

export const CASH_COUNTER_TYPE_OPTIONS: ReadonlyArray<{
  id: z.infer<typeof cashCounterTypeSchema>;
  label: string;
}> = [
  { id: 'billing', label: 'Billing Counter' },
  { id: 'takeaway', label: 'Takeaway Counter' },
  { id: 'delivery', label: 'Delivery Counter' },
];

export function cashCounterTypeLabel(type: string): string {
  return CASH_COUNTER_TYPE_OPTIONS.find((option) => option.id === type)?.label ?? type;
}

export const cashCounterPaymentsSchema = z.object({
  cash: z.boolean(),
  card: z.boolean(),
  upi: z.boolean(),
  wallet: z.boolean(),
  gift_card: z.boolean(),
});

export const defaultCashCounterPayments: z.infer<typeof cashCounterPaymentsSchema> = {
  cash: true,
  card: true,
  upi: true,
  wallet: false,
  gift_card: false,
};

/** Single cash counter row (list / detail). Extra fields default when the API omits them. */
export const cashCounterSchema = z.object({
  id: z.number().int(),
  branch_id: z.number().int(),
  name: z.string().min(1),
  code: z.string().default(''),
  branch_name: z.string().default(''),
  counter_type: cashCounterTypeSchema.default('billing'),
  pos_device: z.string().default(''),
  status: cashCounterStatusSchema,
  open_shift_id: z.number().int().nullable(),
  payments: cashCounterPaymentsSchema.default(() => ({ ...defaultCashCounterPayments })),
});

/** GET list envelope — `{ success, data: CashCounter[], message, request_id }`. */
export const cashCounterListEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.array(cashCounterSchema),
  message: nullableText,
  request_id: nullableText,
});

/** GET/POST/PATCH detail envelope — `{ success, data: CashCounter, ... }`. */
export const cashCounterDetailEnvelopeSchema = z.object({
  success: z.boolean(),
  data: cashCounterSchema,
  message: nullableText,
  request_id: nullableText,
});

export const cashCounterFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a counter name.'),
  code: z.string().trim().min(1, 'Enter a counter code.'),
  counter_type: cashCounterTypeSchema,
  payments: cashCounterPaymentsSchema,
  status: cashCounterStatusSchema,
});

/** POST and PATCH /cash-registers body. */
export const createCashCounterBodySchema = cashCounterFormSchema.extend({
  branch_name: z.string(),
  pos_device: z.string(),
});

export type CashCounter = z.infer<typeof cashCounterSchema>;
export type CashCounterPayments = z.infer<typeof cashCounterPaymentsSchema>;
export type CashCounterFormValues = z.infer<typeof cashCounterFormSchema>;
export type CreateCashCounterBody = z.infer<typeof createCashCounterBodySchema>;
export type UpdateCashCounterBody = CreateCashCounterBody;

export function toCashCounterWriteBody(
  counter: Pick<
    CashCounter,
    'name' | 'code' | 'counter_type' | 'payments' | 'status' | 'branch_name' | 'pos_device'
  >,
  patch: Partial<UpdateCashCounterBody> = {},
): CreateCashCounterBody {
  return {
    name: counter.name,
    code: counter.code,
    counter_type: counter.counter_type,
    payments: counter.payments,
    status: counter.status,
    branch_name: counter.branch_name,
    pos_device: counter.pos_device,
    ...patch,
  };
}

/** Parse list API payload; returns the `data` rows. */
export function parseCashCounterList(payload: unknown): CashCounter[] {
  const parsed = cashCounterListEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Unexpected cash counters response', 502);
  }
  return parsed.data.data;
}

/** Parse detail / create / patch API payload; returns the `data` row. */
export function parseCashCounterDetail(payload: unknown): CashCounter {
  const parsed = cashCounterDetailEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Unexpected cash counter response', 502);
  }
  return parsed.data.data;
}
