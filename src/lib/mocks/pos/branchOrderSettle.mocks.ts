import { resolvePosRazorpayChargePaise } from '@/lib/helpers/posRazorpayPaymentAmount';
import {
  findBranchMockOrder,
  mockBranchOrderDetailEnvelope,
} from '@/lib/mocks/floor-and-table-setup/restaurantFloors.mocks';
import { getMockOrderSettleDetail } from '@/lib/mocks/pos/usePosOrders.mocks';
import { ApiError, type HttpMethod, type QueryParams } from '@/services/api/types';

export type BranchOrderSettleMockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

const BRANCH_ORDER_BILL_PATH = /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/bill$/;
const BRANCH_ORDER_RECEIPT_PATH = /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/receipt$/;
const BRANCH_ORDER_RAZORPAY_ORDER_PATH =
  /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/pay\/razorpay\/order$/;
const BRANCH_ORDER_RAZORPAY_CONFIRM_PATH =
  /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/pay\/razorpay\/confirm$/;

export function resolveBranchOrderSettleMock(
  request: BranchOrderSettleMockRequest,
): unknown | undefined {
  const razorpayConfirmMatch = BRANCH_ORDER_RAZORPAY_CONFIRM_PATH.exec(request.path);
  if (razorpayConfirmMatch?.[1] && razorpayConfirmMatch[2] && request.method === 'POST') {
    return confirmRazorpayCheckoutPayment(
      Number(razorpayConfirmMatch[1]),
      Number(razorpayConfirmMatch[2]),
      request.body,
    );
  }

  const razorpayOrderMatch = BRANCH_ORDER_RAZORPAY_ORDER_PATH.exec(request.path);
  if (razorpayOrderMatch?.[1] && razorpayOrderMatch[2] && request.method === 'POST') {
    return createRazorpayCheckoutOrder(
      Number(razorpayOrderMatch[1]),
      Number(razorpayOrderMatch[2]),
    );
  }

  const orderReceiptMatch = BRANCH_ORDER_RECEIPT_PATH.exec(request.path);
  if (orderReceiptMatch?.[1] && orderReceiptMatch[2] && request.method === 'GET') {
    return openOrderReceipt(Number(orderReceiptMatch[1]), Number(orderReceiptMatch[2]));
  }

  const orderBillMatch = BRANCH_ORDER_BILL_PATH.exec(request.path);
  if (orderBillMatch?.[1] && orderBillMatch[2] && request.method === 'GET') {
    return openOrderBill(Number(orderBillMatch[1]), Number(orderBillMatch[2]));
  }

  return undefined;
}

function confirmRazorpayCheckoutPayment(branchId: number, orderId: number, body: unknown) {
  const order = findBranchMockOrder(orderId);

  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  const detail = mockBranchOrderDetailEnvelope(branchId, orderId) as {
    data: Record<string, unknown>;
  };
  const closedOrder = {
    ...detail.data,
    status: 'completed',
    payment_status: 'paid',
    amount_paid: order.grand_total,
    balance_due: 0,
    closed_at: new Date().toISOString(),
    version: ((detail.data.version as number | undefined) ?? 1) + 1,
  };

  const paymentRow = {
    id: Date.now(),
    payment_type: 'razorpay',
    amount: order.grand_total,
    tip_amount: 0,
    tendered_amount: order.grand_total,
    change_amount: 0,
    paid_at: new Date().toISOString(),
  };

  const gatewayOrderId =
    body && typeof body === 'object' && 'gateway_order_id' in body
      ? String((body as { gateway_order_id: unknown }).gateway_order_id)
      : 'order_mock';

  return {
    success: true,
    data: {
      order_id: orderId,
      expected_version: closedOrder.version,
      order: closedOrder,
      payment: paymentRow,
      payments: [paymentRow],
      receipt_number: `RCP-${orderId}-${gatewayOrderId.slice(-6)}`,
      amount_paid: order.grand_total,
      tip_total: 0,
      balance_due: 0,
      customer_total: order.grand_total,
    },
    message: 'OK',
    request_id: 'mock-razorpay-confirm',
  };
}

function createRazorpayCheckoutOrder(_branchId: number, orderId: number) {
  const order = findBranchMockOrder(orderId);

  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  const amountPaise = resolvePosRazorpayChargePaise(Math.round(Number(order.grand_total) * 100));

  return {
    success: true,
    data: {
      gateway_order_id: `order_mock_${orderId}_${Date.now()}`,
      amount: amountPaise,
      currency: 'INR',
      key_id: 'rzp_test_mock_key',
    },
    message: 'OK',
    request_id: 'mock-razorpay-order',
  };
}

function openOrderReceipt(branchId: number, orderId: number) {
  const billEnvelope = openOrderBill(branchId, orderId) as {
    data: Record<string, unknown> & { grand_total: number };
  };
  const paidAt = new Date().toISOString();

  return {
    success: true,
    data: {
      ...billEnvelope.data,
      receipt_number: `RCP-${orderId}-MOCK`,
      payment_status: 'paid',
      amount_paid: billEnvelope.data.grand_total,
      tip_total: 0,
      balance_due: 0,
      closed_at: paidAt,
      payments: [
        {
          id: 1,
          payment_type: 'razorpay',
          amount: billEnvelope.data.grand_total,
          tip_amount: 0,
          tendered_amount: billEnvelope.data.grand_total,
          change_amount: 0,
          transaction_reference: 'mock_pay_ref',
          paid_at: paidAt,
        },
      ],
    },
    message: 'OK',
    request_id: 'mock-branch-order-receipt',
  };
}

function openOrderBill(branchId: number, orderId: number) {
  const detailEnvelope = mockBranchOrderDetailEnvelope(branchId, orderId) as {
    data: Record<string, unknown> & {
      id: number;
      items: Array<{
        id: number;
        name: string;
        quantity: number;
        unit_price: number;
        line_total?: number;
        line_subtotal?: number;
        tax_total?: number;
      }>;
    };
  };

  const detail = detailEnvelope.data;
  const settle = getMockOrderSettleDetail(String(orderId));
  const taxTotal =
    detail.items.reduce((sum, row) => sum + (row.tax_total ?? 0), 0) ||
    Math.round(settle.subtotal * 0.18 * 100) / 100;

  return {
    success: true,
    data: {
      order_id: detail.id,
      public_id: detail.public_id,
      order_number: detail.order_number,
      order_type: detail.order_type,
      branch_id: branchId,
      branch_name: 'Mock Branch',
      branch_address: '123 Restaurant Street',
      branch_city: 'Hyderabad',
      branch_state: 'Telangana',
      branch_postal_code: '500001',
      branch_phone: '+91 9876543210',
      gstin: '36AABCU9603R1ZM',
      floor_id: detail.floor_id ?? null,
      section_id: detail.section_id ?? null,
      table_id: detail.table_id ?? null,
      table_name: detail.table_name ?? null,
      user_id: 1,
      guest_count: detail.guest_count ?? null,
      business_date: '2026-10-29',
      opened_at: detail.opened_at,
      closed_at: null,
      currency: 'INR',
      status: detail.status,
      items: detail.items.map((row, index) => {
        const lineSubtotal = row.line_subtotal ?? row.unit_price * row.quantity;
        const lineTax = row.tax_total ?? Math.round(lineSubtotal * 0.18 * 100) / 100;
        return {
          order_item_id: row.id ?? index + 1,
          item_name: row.name,
          variant_name: null,
          hsn_sac_code: null,
          quantity: row.quantity,
          base_price: row.unit_price,
          modifier_total: 0,
          unit_price: row.unit_price,
          modifiers: [],
          subtotal: lineSubtotal,
          taxable_amount: lineSubtotal,
          tax_total: lineTax,
          discount_total: 0,
          total: row.line_total ?? lineSubtotal + lineTax,
        };
      }),
      subtotal: detail.subtotal ?? settle.subtotal,
      discount_total: 0,
      cgst_total: taxTotal / 2,
      sgst_total: taxTotal / 2,
      igst_total: 0,
      tax_total: taxTotal,
      calculated_total: (detail.grand_total as number) ?? settle.subtotal + taxTotal,
      round_off: 0,
      grand_total: (detail.grand_total as number) ?? settle.subtotal + taxTotal,
    },
    message: 'OK',
    request_id: 'mock-branch-order-bill',
  };
}
