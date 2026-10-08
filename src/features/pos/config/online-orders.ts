export type OnlineOrderChannel = 'all' | 'swiggy' | 'zomato' | 'website';

export type OnlineOrderPriority = 'new' | 'normal' | 'high' | 'ready';

export type OnlineOrderActionState =
  'pendingAccept' | 'readyForPickup' | 'readyForPickupDone' | 'pickedUp';

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  channel: Exclude<OnlineOrderChannel, 'all'>;
  timeLabel: string;
  priority: OnlineOrderPriority;
  itemsSummary: string;
  prepaid: boolean;
  amount: number;
  actionState: OnlineOrderActionState;
}

export const onlineOrdersPageMeta = {
  title: 'Online Orders',
  subtitle: 'Main Kitchen • Floor 1',
  totalOrdersLabel: 'Total Orders',
  totalOrdersCount: 324,
  pendingLabel: 'Pending',
  pendingCount: 12,
  syncedLabel: 'Synced 30s ago',
  onlineLabel: 'Online',
};

export const onlineOrdersAlert = {
  badge: 'NEW',
  message: 'order #SW1024 just arrived - accept within 2 minutes to avoid auto-cancel.',
};

export const onlineOrdersChannels: { id: OnlineOrderChannel; label: string }[] = [
  { id: 'all', label: 'All channels' },
  { id: 'swiggy', label: 'Swiggy' },
  { id: 'zomato', label: 'Zomato' },
  { id: 'website', label: 'Website' },
];

export const onlineOrdersFooter = {
  printerStatus: 'Printer: Connected',
  syncStatus: 'POS sync: Active',
  avgPrepTime: 'Avg. Prep Time: 14m 30s',
};

export const onlineOrders: OnlineOrder[] = [
  {
    id: 'sw1024',
    orderNumber: '#SW1024',
    channel: 'swiggy',
    timeLabel: '2:35 PM',
    priority: 'new',
    itemsSummary: 'Paneer Tikka ×2, Coke ×1',
    prepaid: true,
    amount: 680,
    actionState: 'pendingAccept',
  },
  {
    id: 'zm882',
    orderNumber: '#ZM882',
    channel: 'zomato',
    timeLabel: '2:28 PM',
    priority: 'normal',
    itemsSummary: 'Veg Biryani ×1, Raita ×1',
    prepaid: true,
    amount: 420,
    actionState: 'readyForPickup',
  },
  {
    id: 'web441',
    orderNumber: '#WEB441',
    channel: 'website',
    timeLabel: '2:20 PM',
    priority: 'high',
    itemsSummary: 'Family Meal Combo ×1',
    prepaid: true,
    amount: 1299,
    actionState: 'readyForPickupDone',
  },
  {
    id: 'sw1018',
    orderNumber: '#SW1018',
    channel: 'swiggy',
    timeLabel: '2:10 PM',
    priority: 'ready',
    itemsSummary: 'Masala Dosa ×2, Filter Coffee ×2',
    prepaid: true,
    amount: 540,
    actionState: 'pickedUp',
  },
  {
    id: 'zm875',
    orderNumber: '#ZM875',
    channel: 'zomato',
    timeLabel: '1:58 PM',
    priority: 'normal',
    itemsSummary: 'Chicken Curry ×1, Naan ×3',
    prepaid: false,
    amount: 760,
    actionState: 'pendingAccept',
  },
  {
    id: 'web438',
    orderNumber: '#WEB438',
    channel: 'website',
    timeLabel: '1:45 PM',
    priority: 'ready',
    itemsSummary: 'Salad Bowl ×1, Smoothie ×1',
    prepaid: true,
    amount: 390,
    actionState: 'readyForPickup',
  },
];

export function formatOnlineOrderAmount(amount: number) {
  return `Rs.${amount.toLocaleString('en-IN')}`;
}

export function getOnlineOrderChannelLabel(channel: Exclude<OnlineOrderChannel, 'all'>) {
  return onlineOrdersChannels.find((item) => item.id === channel)?.label ?? channel;
}

export function getOnlineOrderPriorityLabel(priority: OnlineOrderPriority) {
  switch (priority) {
    case 'new':
      return 'NEW';
    case 'normal':
      return 'NORMAL';
    case 'high':
      return 'HIGH';
    case 'ready':
      return 'Ready';
    default:
      return priority;
  }
}
