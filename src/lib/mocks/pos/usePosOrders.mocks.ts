import { toPosOrderItem } from '@/lib/helpers/posAllOrdersHelpers';
import {
  checkoutMockOrderSchema,
  orderSettleDetailSchema,
  receiptMockDataSchema,
  type CheckoutMockOrder,
  type OrderSettleDetail,
  type ReceiptMockData,
} from '@/lib/schemas/pos/point-of-sale/all-orders/orderSettleSchema';
import {
  posOrderListEnvelopeSchema,
  type PosOrderListEnvelope,
  type PosOrderListItem,
} from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';
import {
  readyOrderListSchema,
  type ReadyOrderItem,
} from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';

export type {
  CheckoutMockOrder,
  OrderSettleDetail,
  PosOrderListItem,
  ReadyOrderItem,
  ReceiptMockData,
};

/**
 * Full GET /v1/branches/{branch_id}/orders envelope matching the live API.
 * Dine-in rows use floor-catalog table ids so table availability stays consistent in mocks.
 */
export const MOCK_POS_ORDERS_ENVELOPE: PosOrderListEnvelope = posOrderListEnvelopeSchema.parse({
  success: true,
  data: {
    items: [
      {
        id: 139,
        public_id: '652b621a-a928-4d7b-b331-527b45dec98c',
        order_number: '0001',
        order_type: 'dine_in',
        table_id: 396,
        table_name: 'T2',
        floor_id: 59,
        section_id: 93,
        guest_count: 2,
        status: 'draft',
        kitchen_badge: null,
        payment_status: 'pending',
        grand_total: 0,
        opened_at: '2026-10-19T13:53:20.579003Z',
      },
      {
        id: 140,
        public_id: '7c1e9a2b-4f3d-4a8e-9b2c-1d5e6f7a8b9c',
        order_number: '0002',
        order_type: 'dine_in',
        table_id: 106,
        table_name: 'T4',
        floor_id: 59,
        section_id: 93,
        guest_count: 4,
        status: 'ordering',
        kitchen_badge: 'preparing',
        payment_status: 'pending',
        grand_total: 882,
        opened_at: '2026-10-19T14:10:00.000000Z',
      },
      {
        id: 141,
        public_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        order_number: '0003',
        order_type: 'takeaway',
        table_id: null,
        table_name: null,
        floor_id: null,
        section_id: null,
        guest_count: 1,
        status: 'billing',
        kitchen_badge: 'ready',
        payment_status: 'pending',
        grand_total: 450,
        opened_at: '2026-10-19T14:22:11.000000Z',
      },
      {
        id: 142,
        public_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        order_number: '0004',
        order_type: 'delivery',
        table_id: null,
        table_name: null,
        floor_id: null,
        section_id: null,
        guest_count: 2,
        status: 'ordering',
        kitchen_badge: 'kot sent',
        payment_status: 'pending',
        grand_total: 1030,
        opened_at: '2026-10-19T14:30:00.000000Z',
      },
      {
        id: 143,
        public_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        order_number: '0005',
        order_type: 'online',
        table_id: null,
        table_name: null,
        floor_id: null,
        section_id: null,
        guest_count: 1,
        status: 'ordering',
        kitchen_badge: 'preparing',
        payment_status: 'pending',
        grand_total: 740,
        opened_at: '2026-10-19T14:45:00.000000Z',
      },
      {
        id: 503,
        public_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        order_number: '0102',
        order_type: 'dine_in',
        table_id: 102,
        table_name: 'T10',
        floor_id: 66,
        section_id: 92,
        guest_count: 2,
        status: 'billing',
        kitchen_badge: 'ready',
        payment_status: 'billing',
        grand_total: 920,
        opened_at: '2026-10-16T16:20:00.000Z',
      },
      {
        id: 504,
        public_id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        order_number: '0111',
        order_type: 'dine_in',
        table_id: 111,
        table_name: 'T11',
        floor_id: 66,
        section_id: 92,
        guest_count: 4,
        status: 'in_progress',
        kitchen_badge: 'preparing',
        payment_status: 'pending',
        grand_total: 1120,
        opened_at: '2026-10-16T18:05:00.000Z',
      },
    ],
    total: 7,
    page: 1,
    page_size: 15,
  },
  message: 'Orders retrieved',
  request_id: 'c54ecdde-8671-4cce-87a4-da86e2994ede',
});

/** Parsed API order rows from the all-orders list envelope. */
export const MOCK_POS_ORDERS: PosOrderListItem[] = MOCK_POS_ORDERS_ENVELOPE.data.items;

export const MOCK_ORDER_SETTLE_1024: OrderSettleDetail = orderSettleDetailSchema.parse({
  id: 'ord-1024-1',
  orderNumber: '#1024',
  reference: 'Table T4',
  type: 'dine-in',
  typeLabel: 'Dine-In',
  items: [
    { id: 'item-1', name: 'Butter Chicken', quantity: 2, unitPrice: 320, totalPrice: 640 },
    { id: 'item-2', name: 'Garlic Naan', quantity: 4, unitPrice: 60, totalPrice: 240 },
    { id: 'item-3', name: 'Dal Makhani', quantity: 1, unitPrice: 280, totalPrice: 280 },
    { id: 'item-4', name: 'Jeera Rice', quantity: 2, unitPrice: 150, totalPrice: 300 },
    { id: 'item-5', name: 'Masala Papad', quantity: 2, unitPrice: 40, totalPrice: 80 },
    { id: 'item-6', name: 'Lassi', quantity: 2, unitPrice: 90, totalPrice: 180 },
  ],
  subtotal: 1640,
  taxRate: 0.05,
  taxAmount: 82,
  grandTotal: 1722,
});

export function getMockOrderSettleDetail(orderId?: string): OrderSettleDetail {
  if (!orderId) return MOCK_ORDER_SETTLE_1024;

  const clean = orderId.replace(/^#/, '').toLowerCase();

  if (clean === '1024' || clean === 'ord-1024-1' || clean === 'ord-1024-2') {
    return MOCK_ORDER_SETTLE_1024;
  }

  const foundApi = MOCK_POS_ORDERS.find(
    (o) =>
      o.public_id.toLowerCase() === clean ||
      String(o.id) === clean ||
      o.order_number.replace(/^#/, '').toLowerCase() === clean,
  );

  if (foundApi) {
    const foundOrder = toPosOrderItem(foundApi);
    const subtotal = foundOrder.amount;
    const taxAmount = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + taxAmount;
    return orderSettleDetailSchema.parse({
      id: foundOrder.id,
      orderNumber: foundOrder.orderNumber,
      reference: foundOrder.reference,
      type: foundOrder.type,
      typeLabel: foundOrder.typeLabel,
      items: [
        {
          id: 'item-main',
          name: `${foundOrder.typeLabel} Main Course`,
          quantity: 1,
          unitPrice: subtotal,
          totalPrice: subtotal,
        },
      ],
      subtotal,
      taxRate: 0.05,
      taxAmount,
      grandTotal,
    });
  }

  return MOCK_ORDER_SETTLE_1024;
}

export const MOCK_CHECKOUT_ORDER_0039: CheckoutMockOrder = checkoutMockOrderSchema.parse({
  orderNumber: '#0039',
  table: 'Table 01',
  items: [
    {
      id: 'pasta-1',
      name: 'Pasta Carbonara',
      quantity: 1,
      unitPrice: 480,
      totalPrice: 480,
      imageUrl:
        'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'pasta-2',
      name: 'Pasta Carbonara',
      quantity: 1,
      unitPrice: 480,
      totalPrice: 480,
      imageUrl:
        'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'pasta-3',
      name: 'Pasta Carbonara',
      quantity: 1,
      unitPrice: 480,
      totalPrice: 480,
      imageUrl:
        'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
    },
  ],
  subtotal: 2160,
  discounts: [
    { id: 'disc-0', label: 'Discount (0%)', amount: 0 },
    {
      id: 'disc-res',
      label: 'Reservation Discount',
      tag: 'Online Reservation',
      amount: 150,
    },
    { id: 'disc-online', label: 'Online Booking Discount', amount: 50 },
  ],
  platformFee: 25,
  serviceChargeRate: 0.02,
  serviceChargeAmount: 43.2,
  taxRate: 0.05,
  taxAmount: 108,
  total: 2268,
});

export const MOCK_RECEIPT_0132: ReceiptMockData = receiptMockDataSchema.parse({
  brandName: 'HOSPIXO',
  dateTime: 'May 17, 2026 · 12:24 AM',
  orderNumber: '#0132',
  table: 'Table T1',
  itemCount: 3,
  items: [
    { name: 'Chicken Biryani', quantity: 2, price: 900 },
    { name: 'Pasta Carbonara', quantity: 1, price: 480 },
  ],
  subtotal: 1380,
  taxRate: 0.05,
  taxAmount: 69,
  platformFee: 25,
  grandTotal: 1474,
  paymentMethod: 'Cash',
});

export const MOCK_READY_ORDERS: ReadyOrderItem[] = readyOrderListSchema.parse([
  {
    id: 'ready-1',
    table: 'Table 12',
    readyTimeAgo: 'Ready 20 sec ago',
    token: 'Token #124',
    priority: 'HIGH',
    itemsCount: 3,
    status: 'Ready',
    dishSummary: 'Chicken Biryani',
    paymentStatus: 'PAID',
  },
  {
    id: 'ready-2',
    table: 'Table 08',
    readyTimeAgo: 'Ready 1 min ago',
    token: 'Token #126',
    priority: 'NORMAL',
    itemsCount: 4,
    status: 'Ready',
    dishSummary: 'Paneer Tikka Masala',
    paymentStatus: 'PAID',
  },
  {
    id: 'ready-3',
    table: 'Table 15',
    readyTimeAgo: 'Ready 2 min ago',
    token: 'Token #128',
    priority: 'HIGH',
    itemsCount: 2,
    status: 'Ready',
    dishSummary: 'Masala Dosa',
    paymentStatus: 'PENDING',
  },
  {
    id: 'ready-4',
    table: 'Table 03',
    readyTimeAgo: 'Ready 4 min ago',
    token: 'Token #130',
    priority: 'NORMAL',
    itemsCount: 5,
    status: 'Ready',
    dishSummary: 'Butter Naan & Dal Makhani',
    paymentStatus: 'PAID',
  },
  {
    id: 'ready-5',
    table: 'Table 22',
    readyTimeAgo: 'Ready 5 min ago',
    token: 'Token #131',
    priority: 'NORMAL',
    itemsCount: 1,
    status: 'Ready',
    dishSummary: 'Mango Lassi',
    paymentStatus: 'PENDING',
  },
  {
    id: 'ready-6',
    table: 'Table 22',
    readyTimeAgo: 'Ready 5 min ago',
    token: 'Token #131',
    priority: 'NORMAL',
    itemsCount: 1,
    status: 'Ready',
    dishSummary: 'Mango Lassi',
    paymentStatus: 'PENDING',
  },
]);
