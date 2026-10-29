import type { ReceiptData } from '@/features/pos/point-of-sale/components/OrderSuccessReceipt';
import type { OrderReviewData } from '@/features/pos/point-of-sale/components/OrderReviewSection';
import type {
  BranchOrderBill,
  BranchOrderReceipt,
} from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderSettleSchema';

function formatBillOrderNumber(bill: BranchOrderBill): string {
  const raw = bill.order_number?.trim();
  if (raw) return raw.startsWith('#') ? raw : `#${raw}`;
  return `#${bill.order_id}`;
}

/** Demo / preview receipt from checkout review state (no mock slip). */
export function mapReviewOrderToReceiptData(
  order: OrderReviewData,
  paymentMethod?: string,
): ReceiptData {
  return {
    orderNumber: order.orderNumber,
    table: order.table,
    itemCount: order.items.reduce((sum, line) => sum + line.quantity, 0),
    items: order.items.map((line) => ({
      id: line.id,
      name: line.name,
      quantity: line.quantity,
      price: line.unitPrice * line.quantity,
    })),
    subtotal: order.subtotal,
    taxRate: order.taxRate,
    taxAmount: order.taxAmount,
    platformFee: order.platformFee,
    grandTotal: order.total,
    paymentMethod,
  };
}

/** Map persisted bill → checkout review card. */
export function mapBranchOrderBillToReviewOrder(bill: BranchOrderBill): OrderReviewData {
  const subtotal = bill.subtotal;
  const taxAmount = bill.tax_total;
  const discountTotal = bill.discount_total ?? 0;
  const taxRate = subtotal > 0 ? taxAmount / subtotal : 0;

  return {
    orderNumber: formatBillOrderNumber(bill),
    table: bill.table_name?.trim() || 'Counter',
    items: bill.items.map((line) => ({
      id: String(line.order_item_id),
      name: line.variant_name?.trim() ? `${line.item_name} (${line.variant_name})` : line.item_name,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      totalPrice: line.total,
    })),
    subtotal,
    discounts:
      discountTotal > 0 ? [{ id: 'bill-discount', label: 'Discount', amount: discountTotal }] : [],
    platformFee: 0,
    serviceChargeRate: 0,
    serviceChargeAmount: 0,
    taxRate,
    taxAmount,
    total: bill.grand_total,
  };
}

function mapBillCoreToReceiptData(
  bill: BranchOrderBill,
  paymentMethod?: string,
  dateTime?: string,
): ReceiptData {
  const taxRate = bill.subtotal > 0 ? bill.tax_total / bill.subtotal : 0;

  return {
    orderNumber: formatBillOrderNumber(bill),
    table: bill.table_name?.trim() || undefined,
    brandName: bill.branch_name?.trim() || undefined,
    dateTime,
    itemCount: bill.items.reduce((sum, line) => sum + line.quantity, 0),
    items: bill.items.map((line) => ({
      id: String(line.order_item_id),
      name: line.variant_name?.trim() ? `${line.item_name} (${line.variant_name})` : line.item_name,
      quantity: line.quantity,
      price: line.total,
    })),
    subtotal: bill.subtotal,
    taxRate,
    taxAmount: bill.tax_total,
    platformFee: 0,
    grandTotal: bill.grand_total,
    paymentMethod,
  };
}

export function mapBranchOrderBillToReceiptData(
  bill: BranchOrderBill,
  paymentMethod?: string,
): ReceiptData {
  return mapBillCoreToReceiptData(bill, paymentMethod);
}

function formatReceiptPaymentMethod(receipt: BranchOrderReceipt): string | undefined {
  const primary = receipt.payments[0];
  if (!primary) return undefined;
  const type = primary.payment_type.replace(/_/g, ' ');
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatReceiptDateTime(receipt: BranchOrderReceipt): string | undefined {
  const paidAt = receipt.payments[0]?.paid_at ?? receipt.closed_at;
  if (!paidAt) return undefined;
  const date = new Date(paidAt);
  if (Number.isNaN(date.getTime())) return paidAt;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mapBranchOrderReceiptToReceiptData(
  receipt: BranchOrderReceipt,
  paymentMethodFallback?: string,
): ReceiptData {
  const paymentMethod = formatReceiptPaymentMethod(receipt) ?? paymentMethodFallback;
  const base = mapBillCoreToReceiptData(receipt, paymentMethod, formatReceiptDateTime(receipt));
  const paidTotal = receipt.amount_paid ?? receipt.grand_total;
  return {
    ...base,
    grandTotal: paidTotal,
  };
}
