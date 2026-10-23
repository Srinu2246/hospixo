import { z } from 'zod';

export const duePaymentStatusSchema = z.enum(['overdue', 'pending', 'paid']);

export const duePaymentStatusVariantSchema = z.enum([
  'warning',
  'success',
  'info',
  'role',
  'default',
  'reserved',
  'kot',
  'danger',
]);

export const duePaymentItemSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  dueDate: z.string().min(1),
  amount: z.string().min(1),
  rawAmount: z.number(),
  status: duePaymentStatusSchema,
  statusLabel: z.string().min(1),
  statusVariant: duePaymentStatusVariantSchema,
  phone: z.string().optional(),
  orderNumber: z.string().optional(),
});

export type DuePaymentItem = z.infer<typeof duePaymentItemSchema>;

export const duePaymentListSchema = z.array(duePaymentItemSchema);
