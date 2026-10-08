import { posFoodImages } from '@/features/pos/config/assets';
import type { DineInOrderLine } from '@/features/pos/config/dine-in';

export type CheckoutPaymentMethodId = 'cash' | 'card' | 'upi' | 'partPayment' | 'sodexo';

export interface CheckoutOrderLine {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export interface CheckoutFeeLine {
  id: string;
  label: string;
  amount: number;
  tone?: 'default' | 'discount' | 'total';
  tag?: string;
}

export interface CheckoutPaymentMethod {
  id: CheckoutPaymentMethodId;
  label: string;
}

export const checkoutPageMeta = {
  statusBadge: 'Order Processing',
  title: 'Order Review',
  summaryTitle: 'Order summary',
  summaryCaption: 'Review your items and apply a discount before checkout.',
  couponPlaceholder: 'Apply coupon',
  discountCodeLabel: 'Discount Code',
  applyLabel: 'Apply',
  paymentTitle: 'Choose Payment Method',
  confirmLabel: 'Confirm Payment',
  securedCaption: 'Secured by 256-bit encryption',
  notifyTitle: 'Send Receipt via SMS / WhatsApp',
  phoneLabel: 'Customer phone number',
  phonePlaceholder: '+91 98765 43210',
  smsLabel: 'SMS',
  whatsappLabel: 'WhatsApp',
};

export const checkoutOrderMeta = {
  tableLabel: 'Table 01',
  orderNumber: '#0039',
};

export const checkoutOrderLines: CheckoutOrderLine[] = [
  {
    id: 'line-1',
    name: 'Pasta Carbonara',
    quantity: 2,
    unitPrice: 480,
    imageUrl: posFoodImages.pastaCarbonara,
  },
  {
    id: 'line-2',
    name: 'Caesar Salad',
    quantity: 1,
    unitPrice: 320,
    imageUrl: posFoodImages.caesarSalad,
  },
  {
    id: 'line-3',
    name: 'Grilled Salmon',
    quantity: 1,
    unitPrice: 890,
    imageUrl: posFoodImages.grilledSalmon,
  },
];

export const checkoutFeeLines: CheckoutFeeLine[] = [
  { id: 'subtotal', label: 'Sub Total', amount: 2170 },
  { id: 'discount', label: 'Discount (0%)', amount: 0, tone: 'discount' },
  {
    id: 'reservation',
    label: 'Reservation Discount',
    amount: -150,
    tone: 'discount',
    tag: 'Online Reservation',
  },
  {
    id: 'booking',
    label: 'Online Booking Discount',
    amount: -50,
    tone: 'discount',
  },
  { id: 'platform', label: 'Platform Fee', amount: 25 },
  { id: 'service', label: 'Service Charge (2%)', amount: 43.2 },
  { id: 'tax', label: 'Tax (5%)', amount: 108 },
];

export const checkoutTotal = 2268;

export const checkoutPaymentMethods: CheckoutPaymentMethod[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'partPayment', label: 'Part Payment' },
  { id: 'sodexo', label: 'Sodexo' },
];

export const checkoutPaymentTotal = 2259;

export function dineInLinesToCheckout(lines: DineInOrderLine[]): CheckoutOrderLine[] {
  return lines.map((line) => ({
    id: line.id,
    name: line.name,
    quantity: line.quantity,
    unitPrice: line.price,
    imageUrl: line.imageUrl,
  }));
}

export function buildCheckoutFeeLines(subtotal: number): CheckoutFeeLine[] {
  return [
    { id: 'subtotal', label: 'Sub Total', amount: subtotal },
    { id: 'discount', label: 'Discount (0%)', amount: 0, tone: 'discount' },
    {
      id: 'reservation',
      label: 'Reservation Discount',
      amount: -150,
      tone: 'discount',
      tag: 'Online Reservation',
    },
    {
      id: 'booking',
      label: 'Online Booking Discount',
      amount: -50,
      tone: 'discount',
    },
    { id: 'platform', label: 'Platform Fee', amount: 25 },
    {
      id: 'service',
      label: 'Service Charge (2%)',
      amount: Math.round(subtotal * 0.02 * 100) / 100,
    },
    { id: 'tax', label: 'Tax (5%)', amount: Math.round(subtotal * 0.05 * 100) / 100 },
  ];
}

export function computeCheckoutTotal(feeLines: CheckoutFeeLine[]) {
  return feeLines.reduce((sum, fee) => sum + fee.amount, 0);
}

export function formatCheckoutRupee(amount: number, options?: { signedDiscount?: boolean }) {
  const prefix = options?.signedDiscount && amount < 0 ? '- ' : '';
  return `${prefix}Rs ${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
