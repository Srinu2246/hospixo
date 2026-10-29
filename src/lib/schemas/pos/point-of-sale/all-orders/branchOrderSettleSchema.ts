import { z } from 'zod';

import {
  posKitchenBadgeSchema,
  posOrderStatusSchema,
  posOrderTypeSchema,
  posPaymentStatusSchema,
} from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';
import { ApiError } from '@/services/api/types';

const coerceInt = z.coerce.number().int();
const nullableText = z.string().nullable().optional();
const nullableNumberPlain = z.number().nullable().optional();
const nullableNumberCoerce = z.coerce.number().nullable().optional();

// ——— Order detail (GET …/orders/{id}) ———

const branchOrderLineModifierSchema = z.object({
  modifier_group_id: coerceInt.optional(),
  modifier_group_name: nullableText,
  modifier_option_id: coerceInt.optional(),
  modifier_option_name: nullableText,
  price_adjustment: z.coerce.number().optional(),
});

/** Line item on GET order detail and submit `data.order.items`. */
export const branchOrderItemSchema = z
  .object({
    id: coerceInt,
    menu_item_id: coerceInt.optional(),
    branch_menu_item_id: coerceInt.optional(),
    name: z.string().optional(),
    item_name: z.string().optional(),
    variant_name: nullableText,
    quantity: coerceInt.positive(),
    unit_price: z.coerce.number(),
    line_total: z.coerce.number().optional(),
    line_subtotal: z.coerce.number().optional(),
    taxable_amount: z.coerce.number().optional(),
    tax_total: z.coerce.number().optional(),
    category_name: nullableText,
    notes: nullableText,
    /** Legacy mock field */
    status: z.string().optional(),
    /** API field after submit — `draft` until fired to kitchen */
    item_status: z.string().optional(),
    kot_number: nullableText,
    submitted_at: nullableText,
    preparing_at: nullableText,
    ready_at: nullableText,
    completed_at: nullableText,
    preparation_station_id: nullableNumberPlain,
    preparation_station_name: nullableText,
    tags: z.array(z.string()).optional(),
    modifiers: z.array(branchOrderLineModifierSchema).optional(),
  })
  .transform((row) => ({
    ...row,
    name: (row.item_name ?? row.name ?? 'Item').trim(),
  }));

export type BranchOrderItem = z.infer<typeof branchOrderItemSchema>;

/** Full order from GET /v1/branches/{branch_id}/orders/{order_id}. */
export const branchOrderDetailSchema = z.object({
  id: coerceInt.positive(),
  public_id: nullableText,
  order_number: nullableText,
  order_type: posOrderTypeSchema,
  branch_id: nullableNumberPlain,
  table_id: nullableNumberPlain,
  table_name: nullableText,
  floor_id: nullableNumberPlain,
  section_id: nullableNumberPlain,
  guest_count: nullableNumberPlain,
  version: nullableNumberPlain,
  status: posOrderStatusSchema,
  kitchen_badge: posKitchenBadgeSchema.nullable().optional(),
  payment_status: posPaymentStatusSchema.nullable().optional(),
  grand_total: z.coerce.number().optional(),
  subtotal: z.coerce.number().optional(),
  discount_total: z.coerce.number().optional(),
  tax_total: z.coerce.number().optional(),
  cgst_total: z.coerce.number().optional(),
  sgst_total: z.coerce.number().optional(),
  igst_total: z.coerce.number().optional(),
  calculated_total: z.coerce.number().optional(),
  round_off: z.coerce.number().optional(),
  amount_paid: z.coerce.number().optional(),
  tip_total: z.coerce.number().optional(),
  balance_due: z.coerce.number().optional(),
  currency: nullableText,
  business_date: nullableText,
  meal_session_id: nullableNumberPlain,
  opened_at: nullableText,
  closed_at: nullableText,
  invoice_number: nullableText,
  items: z.array(branchOrderItemSchema).default([]),
  payments: z.array(z.unknown()).optional(),
});

export type BranchOrderDetail = z.infer<typeof branchOrderDetailSchema>;

const branchOrderDetailEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrderDetailSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

/** Parse GET branch order detail envelope. */
export function parseBranchOrderDetail(payload: unknown): BranchOrderDetail {
  const parsed = branchOrderDetailEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected order detail response', 502);
  }
  return parsed.data.data;
}

// ——— Bill (GET …/bill) ———

const branchOrderBillLineModifierSchema = z.object({
  name: z.string(),
  group_name: nullableText,
  quantity: coerceInt.positive().optional().default(1),
  price: z.coerce.number(),
});

const branchOrderBillLineSchema = z.object({
  order_item_id: coerceInt,
  item_name: z.string(),
  variant_name: nullableText,
  hsn_sac_code: nullableText,
  quantity: coerceInt.positive(),
  base_price: z.coerce.number(),
  modifier_total: z.coerce.number().optional(),
  unit_price: z.coerce.number(),
  modifiers: z.array(branchOrderBillLineModifierSchema).default([]),
  subtotal: z.coerce.number(),
  taxable_amount: z.coerce.number(),
  tax_total: z.coerce.number(),
  discount_total: z.coerce.number().optional(),
  total: z.coerce.number(),
});

export const branchOrderBillSchema = z.object({
  order_id: coerceInt.positive(),
  public_id: nullableText,
  order_number: nullableText,
  order_type: posOrderTypeSchema,
  branch_id: coerceInt,
  branch_name: nullableText,
  branch_address: nullableText,
  branch_city: nullableText,
  branch_state: nullableText,
  branch_postal_code: nullableText,
  branch_phone: nullableText,
  gstin: nullableText,
  floor_id: nullableNumberCoerce,
  section_id: nullableNumberCoerce,
  table_id: nullableNumberCoerce,
  table_name: nullableText,
  user_id: nullableNumberCoerce,
  guest_count: nullableNumberCoerce,
  business_date: nullableText,
  opened_at: nullableText,
  closed_at: nullableText,
  currency: nullableText,
  status: posOrderStatusSchema,
  items: z.array(branchOrderBillLineSchema).default([]),
  subtotal: z.coerce.number(),
  discount_total: z.coerce.number().optional(),
  cgst_total: z.coerce.number().optional(),
  sgst_total: z.coerce.number().optional(),
  igst_total: z.coerce.number().optional(),
  tax_total: z.coerce.number(),
  calculated_total: z.coerce.number().optional(),
  round_off: z.coerce.number().optional(),
  grand_total: z.coerce.number(),
});

export type BranchOrderBill = z.infer<typeof branchOrderBillSchema>;

const branchOrderBillEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrderBillSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

export function parseBranchOrderBill(payload: unknown): BranchOrderBill {
  const parsed = branchOrderBillEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected order bill response', 502);
  }
  return parsed.data.data;
}

// ——— Receipt (GET …/receipt) ———

const branchOrderReceiptPaymentSchema = z.object({
  id: coerceInt,
  payment_type: z.string(),
  amount: z.coerce.number(),
  tip_amount: z.coerce.number().optional(),
  tendered_amount: z.coerce.number().optional(),
  change_amount: z.coerce.number().optional(),
  transaction_reference: nullableText,
  paid_at: nullableText,
});

export const branchOrderReceiptSchema = branchOrderBillSchema.extend({
  receipt_number: nullableText,
  payment_status: posPaymentStatusSchema,
  amount_paid: z.coerce.number().optional(),
  tip_total: z.coerce.number().optional(),
  balance_due: z.coerce.number().optional(),
  payments: z.array(branchOrderReceiptPaymentSchema).default([]),
});

export type BranchOrderReceipt = z.infer<typeof branchOrderReceiptSchema>;

const branchOrderReceiptEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrderReceiptSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

export function parseBranchOrderReceipt(payload: unknown): BranchOrderReceipt {
  const parsed = branchOrderReceiptEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected order receipt response', 502);
  }
  return parsed.data.data;
}

// ——— Razorpay create (POST …/pay/razorpay/order) ———

export const branchOrderRazorpayOrderDataSchema = z.object({
  gateway_order_id: z.string().min(1),
  amount: z.coerce.number().nonnegative(),
  currency: z.string().min(1),
  key_id: z.string().min(1),
});

export type BranchOrderRazorpayOrderData = z.infer<typeof branchOrderRazorpayOrderDataSchema>;

const branchOrderRazorpayOrderEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrderRazorpayOrderDataSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

export function parseBranchOrderRazorpayOrder(payload: unknown): BranchOrderRazorpayOrderData {
  const parsed = branchOrderRazorpayOrderEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected Razorpay order response', 502);
  }
  return parsed.data.data;
}

// ——— Razorpay confirm (POST …/pay/razorpay/confirm) ———

export const branchOrderRazorpayConfirmBodySchema = z.object({
  gateway_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  signature: z.string().min(1),
});

export type BranchOrderRazorpayConfirmBody = z.infer<typeof branchOrderRazorpayConfirmBodySchema>;

const branchOrderPaymentRowSchema = z.object({
  id: coerceInt,
  payment_type: z.string(),
  amount: z.coerce.number(),
  tip_amount: z.coerce.number().optional(),
  tendered_amount: z.coerce.number().optional(),
  change_amount: z.coerce.number().optional(),
  paid_at: nullableText,
});

export const branchOrderRazorpayConfirmDataSchema = z.object({
  order_id: coerceInt,
  expected_version: coerceInt.nonnegative().optional(),
  order: branchOrderDetailSchema.optional(),
  payment: branchOrderPaymentRowSchema.optional(),
  payments: z.array(branchOrderPaymentRowSchema).optional(),
  receipt_number: nullableText,
  amount_paid: z.coerce.number().optional(),
  tip_total: z.coerce.number().optional(),
  balance_due: z.coerce.number().optional(),
  customer_total: z.coerce.number().optional(),
});

export type BranchOrderRazorpayConfirmData = z.infer<typeof branchOrderRazorpayConfirmDataSchema>;

const branchOrderRazorpayConfirmEnvelopeSchema = z.object({
  success: z.boolean(),
  data: branchOrderRazorpayConfirmDataSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

export function parseBranchOrderRazorpayConfirm(payload: unknown): BranchOrderRazorpayConfirmData {
  const parsed = branchOrderRazorpayConfirmEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected Razorpay confirm response', 502);
  }
  return parsed.data.data;
}
