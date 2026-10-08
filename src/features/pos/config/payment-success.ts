export interface PaymentSuccessLine {
  id: string;
  name: string;
  quantity: number;
  amount: number;
}

export interface PaymentSuccessTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export const paymentSuccessPageMeta = {
  statusBadge: 'Order Processing',
  headerTitle: 'Payment Success',
  title: 'Payment Successful!',
  receiptBrand: 'HOSPIXO RESTO',
  printLabel: 'Print Receipt',
  newOrderLabel: 'New Order',
  thankYouMessage: 'Thank you for dining with us! Visit again soon.',
};

export const paymentSuccessOrderMeta = {
  headline: 'Order #0039 · Table 1 · 3 items',
  orderNumber: '#0039',
  dateTime: 'May 17, 2026 · 12:24 AM',
  tableLabel: 'Table: 1',
  cashierLabel: 'Cashier: Alex J.',
  paymentMethod: 'Cash',
  brand: 'HOSPIXO',
};

export const paymentSuccessLines: PaymentSuccessLine[] = [
  { id: 'line-1', name: 'Pasta Carbonara', quantity: 2, amount: 960 },
  { id: 'line-2', name: 'Margherita Pizza', quantity: 1, amount: 480 },
  { id: 'line-3', name: 'Chicken Biryani', quantity: 1, amount: 480 },
];

export const paymentSuccessTotals: PaymentSuccessTotals = {
  subtotal: 1920,
  discount: 0,
  tax: 96,
  total: 2016,
};

export function formatPaymentRupee(amount: number, options?: { signedDiscount?: boolean }) {
  const prefix = options?.signedDiscount && amount !== 0 ? '- ' : '';
  return `${prefix}Rs ${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
