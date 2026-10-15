export type OrderType = 'all' | 'dine-in' | 'takeaway' | 'delivery' | 'online';
export type KitchenStatus = 'kot sent' | 'ready' | 'preparing' | 'billing';

export interface PosOrderItem {
  id: string; // Unique row identifier
  orderNumber: string; // Formatted order number (e.g. #1024)
  type: 'dine-in' | 'takeaway' | 'delivery' | 'online'; // Order type
  typeLabel: string; // Display type label
  reference: string; // Table number or delivery partner (e.g. Table T4, Swiggy · #SW1024)
  kitchenStatus: KitchenStatus; // Kitchen status key
  kitchenStatusLabel: string; // Display kitchen status label
  amount: number; // Order amount in INR
  amountFormatted: string; // Formatted amount string (e.g. ₹882)
}

export const MOCK_POS_ORDERS: PosOrderItem[] = [
  {
    id: 'ord-1024-1',
    orderNumber: '#1024',
    type: 'dine-in',
    typeLabel: 'Dine-in',
    reference: 'Table T4',
    kitchenStatus: 'kot sent',
    kitchenStatusLabel: 'KOT Sent',
    amount: 882,
    amountFormatted: '₹882',
  },
  {
    id: 'ord-1024-2',
    orderNumber: '#1024',
    type: 'dine-in',
    typeLabel: 'Dine-in',
    reference: 'Table T4',
    kitchenStatus: 'ready',
    kitchenStatusLabel: 'Ready',
    amount: 882,
    amountFormatted: '₹882',
  },
  {
    id: 'ord-1025-1',
    orderNumber: '#1025',
    type: 'takeaway',
    typeLabel: 'Takeaway',
    reference: 'Table T5',
    kitchenStatus: 'preparing',
    kitchenStatusLabel: 'Preparing',
    amount: 450,
    amountFormatted: '₹450',
  },
  {
    id: 'ord-1026-1',
    orderNumber: '#1026',
    type: 'dine-in',
    typeLabel: 'Dine-in',
    reference: 'Table T6',
    kitchenStatus: 'billing',
    kitchenStatusLabel: 'Billing',
    amount: 620,
    amountFormatted: '₹620',
  },
  {
    id: 'ord-1027-1',
    orderNumber: '#1027',
    type: 'delivery',
    typeLabel: 'Delivery',
    reference: 'Swiggy · #SW1024',
    kitchenStatus: 'kot sent',
    kitchenStatusLabel: 'KOT Sent',
    amount: 1030,
    amountFormatted: '₹1030',
  },
  {
    id: 'ord-1027-2',
    orderNumber: '#1027',
    type: 'delivery',
    typeLabel: 'Delivery',
    reference: 'Zomato · #ZM8821',
    kitchenStatus: 'ready',
    kitchenStatusLabel: 'Ready',
    amount: 1030,
    amountFormatted: '₹1030',
  },
  {
    id: 'ord-1028-1',
    orderNumber: '#1028',
    type: 'online',
    typeLabel: 'Online',
    reference: 'Zomato · #ZM9912',
    kitchenStatus: 'preparing',
    kitchenStatusLabel: 'Preparing',
    amount: 740,
    amountFormatted: '₹740',
  },
  {
    id: 'ord-1029-1',
    orderNumber: '#1029',
    type: 'dine-in',
    typeLabel: 'Dine-in',
    reference: 'Table T1',
    kitchenStatus: 'ready',
    kitchenStatusLabel: 'Ready',
    amount: 1250,
    amountFormatted: '₹1,250',
  },
  {
    id: 'ord-1030-1',
    orderNumber: '#1030',
    type: 'takeaway',
    typeLabel: 'Takeaway',
    reference: 'Counter 1',
    kitchenStatus: 'billing',
    kitchenStatusLabel: 'Billing',
    amount: 320,
    amountFormatted: '₹320',
  },
  {
    id: 'ord-1031-1',
    orderNumber: '#1031',
    type: 'delivery',
    typeLabel: 'Delivery',
    reference: 'Swiggy · #SW2089',
    kitchenStatus: 'preparing',
    kitchenStatusLabel: 'Preparing',
    amount: 960,
    amountFormatted: '₹960',
  },
];

export interface OrderedItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderSettleDetail {
  id: string;
  orderNumber: string;
  reference: string;
  type: OrderType;
  typeLabel: string;
  items: OrderedItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.05
  taxAmount: number;
  grandTotal: number;
}

export const MOCK_ORDER_SETTLE_1024: OrderSettleDetail = {
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
};

export function getMockOrderSettleDetail(orderId?: string): OrderSettleDetail {
  if (!orderId) return MOCK_ORDER_SETTLE_1024;

  const clean = orderId.replace(/^#/, '').toLowerCase();

  // If order is 1024 or ord-1024-1/2, return exact design mock
  if (clean === '1024' || clean === 'ord-1024-1' || clean === 'ord-1024-2') {
    return MOCK_ORDER_SETTLE_1024;
  }

  // Look up in existing orders
  const foundOrder = MOCK_POS_ORDERS.find(
    (o) => o.id.toLowerCase() === clean || o.orderNumber.replace(/^#/, '').toLowerCase() === clean,
  );

  if (foundOrder) {
    const subtotal = foundOrder.amount;
    const taxAmount = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + taxAmount;
    return {
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
    };
  }

  return MOCK_ORDER_SETTLE_1024;
}

export interface CheckoutMockItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  imageUrl?: string;
}

export interface CheckoutMockDiscount {
  id: string;
  label: string;
  tag?: string;
  amount: number;
}

export interface CheckoutMockOrder {
  orderNumber: string;
  table: string;
  items: CheckoutMockItem[];
  subtotal: number;
  discounts: CheckoutMockDiscount[];
  platformFee: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface ReceiptMockItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptMockData {
  orderNumber: string;
  table: string;
  itemCount: number;
  brandName: string;
  dateTime: string;
  items: ReceiptMockItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  platformFee: number;
  grandTotal: number;
  paymentMethod: string;
}

export const MOCK_CHECKOUT_ORDER_0039: CheckoutMockOrder = {
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
};

export const MOCK_RECEIPT_0132: ReceiptMockData = {
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
};

export interface ReadyOrderItem {
  id: string;
  table: string;
  readyTimeAgo: string;
  token: string;
  priority: 'HIGH' | 'NORMAL';
  itemsCount: number;
  status: 'Ready';
  dishSummary: string;
  paymentStatus: 'PAID' | 'PENDING';
}

export const MOCK_READY_ORDERS: ReadyOrderItem[] = [
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
];
