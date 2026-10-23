import { z } from 'zod';

export const orderedItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  totalPrice: z.number(),
});

export const orderSettleDetailSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  reference: z.string().min(1),
  type: z.enum(['dine-in', 'takeaway', 'delivery', 'online']),
  typeLabel: z.string().min(1),
  items: z.array(orderedItemSchema),
  subtotal: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  grandTotal: z.number(),
});

export type OrderSettleDetail = z.infer<typeof orderSettleDetailSchema>;

export const checkoutMockItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  totalPrice: z.number().optional(),
  imageUrl: z.string().optional(),
});

export const checkoutMockDiscountSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  tag: z.string().optional(),
  amount: z.number(),
});

export const checkoutMockOrderSchema = z.object({
  orderNumber: z.string().min(1),
  table: z.string().min(1),
  items: z.array(checkoutMockItemSchema),
  subtotal: z.number(),
  discounts: z.array(checkoutMockDiscountSchema),
  platformFee: z.number(),
  serviceChargeRate: z.number(),
  serviceChargeAmount: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  total: z.number(),
});

export type CheckoutMockOrder = z.infer<typeof checkoutMockOrderSchema>;

export const receiptMockItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number(),
});

export const receiptMockDataSchema = z.object({
  orderNumber: z.string().min(1),
  table: z.string().min(1),
  itemCount: z.number().int().nonnegative(),
  brandName: z.string().min(1),
  dateTime: z.string().min(1),
  items: z.array(receiptMockItemSchema),
  subtotal: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  platformFee: z.number(),
  grandTotal: z.number(),
  paymentMethod: z.string().min(1),
});

export type ReceiptMockData = z.infer<typeof receiptMockDataSchema>;
