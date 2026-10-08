export type ReadyListTab = 'active' | 'pending' | 'history';
export type ReadyOrderPriority = 'high' | 'normal';
export type ReadyOrderPayment = 'paid' | 'pending';

export interface ReadyOrder {
  id: string;
  table: string;
  token: string;
  itemCount: number;
  itemSummary: string;
  readyAgo: string;
  priority: ReadyOrderPriority;
  payment: ReadyOrderPayment;
  tab: ReadyListTab;
}

export const readyListTabs: { id: ReadyListTab; label: string; count?: number }[] = [
  { id: 'active', label: 'Active', count: 6 },
  { id: 'pending', label: 'Pending', count: 12 },
  { id: 'history', label: 'History' },
];

export const readyOrders: ReadyOrder[] = [
  {
    id: 'order-124',
    table: 'Table 12',
    token: '#124',
    itemCount: 3,
    itemSummary: 'Chicken Biryani',
    readyAgo: '20 sec ago',
    priority: 'high',
    payment: 'paid',
    tab: 'active',
  },
  {
    id: 'order-126',
    table: 'Table 08',
    token: '#126',
    itemCount: 4,
    itemSummary: 'Paneer Tikka Masala',
    readyAgo: '1 min ago',
    priority: 'normal',
    payment: 'paid',
    tab: 'active',
  },
  {
    id: 'order-128',
    table: 'Table 15',
    token: '#128',
    itemCount: 2,
    itemSummary: 'Masala Dosa',
    readyAgo: '2 min ago',
    priority: 'high',
    payment: 'pending',
    tab: 'active',
  },
  {
    id: 'order-130',
    table: 'Table 03',
    token: '#130',
    itemCount: 5,
    itemSummary: 'Butter Naan & Dal Makhani',
    readyAgo: '4 min ago',
    priority: 'normal',
    payment: 'paid',
    tab: 'active',
  },
  {
    id: 'order-131',
    table: 'Table 22',
    token: '#131',
    itemCount: 1,
    itemSummary: 'Mango Lassi',
    readyAgo: '5 min ago',
    priority: 'normal',
    payment: 'pending',
    tab: 'active',
  },
  {
    id: 'order-132',
    table: 'Table 22',
    token: '#132',
    itemCount: 1,
    itemSummary: 'Mango Lassi',
    readyAgo: '5 min ago',
    priority: 'normal',
    payment: 'pending',
    tab: 'active',
  },
];
