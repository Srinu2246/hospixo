import {
  kitchenDisplayListSchema,
  kitchenDisplayStatsSchema,
} from '@/lib/schemas/kitchen-display/kitchenDisplaySchema';
import type {
  KitchenOrderItem,
  KitchenDisplayStats,
  KitchenStation,
} from '@/types/kitchen-display';

export const KITCHEN_STATIONS: KitchenStation[] = ['Main Kitchen', 'Tandoor', 'Bar'];

export const INITIAL_KITCHEN_STATS: KitchenDisplayStats = kitchenDisplayStatsSchema.parse({
  totalOrders: 324,
  pendingCount: 8,
  preparingCount: 5,
  readyCount: 3,
  avgPrepTime: '14m 30s',
});

export const MOCK_KITCHEN_ORDERS: KitchenOrderItem[] = kitchenDisplayListSchema.parse([
  // -------------------------------------------------------------
  // 1. Column 1: New Orders (#1023, #1024) - Exact match to Screenshot 2
  // -------------------------------------------------------------
  {
    id: 'ord-1023',
    orderNumber: '#1023',
    tableNumber: 'T-12',
    isTakeaway: false,
    priority: 'HIGH',
    status: 'new',
    station: 'Main Kitchen',
    timeLabel: '04:40',
    elapsedSeconds: 280,
    createdAt: new Date(Date.now() - 280 * 1000).toISOString(),
    items: [
      {
        id: 'item-1023-1',
        name: 'Paneer Tikka',
        quantity: 1,
        category: 'Starters',
        icon: 'tikka',
      },
      {
        id: 'item-1023-2',
        name: 'Paneer Tikka',
        quantity: 1,
        category: 'Starters',
        icon: 'tikka',
      },
      {
        id: 'item-1023-3',
        name: 'Paneer Tikka',
        quantity: 1,
        category: 'Starters',
        icon: 'tikka',
      },
      {
        id: 'item-1023-4',
        name: 'Paneer Tikka',
        quantity: 1,
        category: 'Starters',
        icon: 'tikka',
      },
      {
        id: 'item-1023-5',
        name: 'Paneer Tikka',
        quantity: 1,
        category: 'Starters',
        icon: 'tikka',
      },
      {
        id: 'item-1023-6',
        name: 'Paneer Tikka',
        quantity: 1,
        category: 'Starters',
        icon: 'tikka',
      },
      {
        id: 'item-1023-7',
        name: 'Fresh Lime Soda',
        quantity: 2,
        category: 'Drinks',
        icon: 'drink',
      },
    ],
  },
  {
    id: 'ord-1024',
    orderNumber: '#1024',
    tableNumber: 'T-04',
    isTakeaway: false,
    priority: 'NORMAL',
    status: 'new',
    station: 'Main Kitchen',
    timeLabel: 'Just now',
    elapsedSeconds: 45,
    createdAt: new Date(Date.now() - 45 * 1000).toISOString(),
    items: [
      {
        id: 'item-1024-1',
        name: 'Mutton Rogan Josh',
        quantity: 1,
        category: 'Mains',
        icon: 'curry',
      },
      {
        id: 'item-1024-2',
        name: 'Garlic Naan',
        quantity: 3,
        category: 'Mains',
        icon: 'bread',
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. Column 2: Preparing Orders (#1021, #1022) - Exact match to Screenshot 2
  // -------------------------------------------------------------
  {
    id: 'ord-1021',
    orderNumber: '#1021',
    tableNumber: 'T-02',
    isTakeaway: false,
    priority: 'HIGH',
    status: 'preparing',
    station: 'Main Kitchen',
    timeLabel: '11:58',
    elapsedSeconds: 718,
    createdAt: new Date(Date.now() - 718 * 1000).toISOString(),
    items: [
      {
        id: 'item-1021-1',
        name: 'Chicken Biryani',
        quantity: 2,
        category: 'Mains',
        icon: 'biryani',
      },
      {
        id: 'item-1021-2',
        name: 'Coke',
        quantity: 2,
        category: 'Drinks',
        icon: 'drink',
      },
    ],
  },
  {
    id: 'ord-1022',
    orderNumber: '#1022',
    tableNumber: 'T-11',
    isTakeaway: false,
    priority: 'NORMAL',
    status: 'preparing',
    station: 'Main Kitchen',
    timeLabel: '09:30',
    elapsedSeconds: 570,
    createdAt: new Date(Date.now() - 570 * 1000).toISOString(),
    items: [
      {
        id: 'item-1022-1',
        name: 'Dal Makhani',
        quantity: 1,
        category: 'Mains',
        icon: 'curry',
      },
      {
        id: 'item-1022-2',
        name: 'Butter Naan',
        quantity: 4,
        category: 'Mains',
        icon: 'bread',
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. Column 3: Ready to Serve Orders (#1019, #1020) - Exact match to Screenshot 2
  // -------------------------------------------------------------
  {
    id: 'ord-1019',
    orderNumber: '#1019',
    isTakeaway: true,
    priority: 'NORMAL',
    status: 'ready',
    station: 'Main Kitchen',
    timeLabel: 'Ready 2m',
    elapsedSeconds: 120,
    createdAt: new Date(Date.now() - 120 * 1000).toISOString(),
    items: [
      {
        id: 'item-1019-1',
        name: 'Veg Fried Rice',
        quantity: 1,
        category: 'Mains',
        icon: 'rice',
      },
      {
        id: 'item-1019-2',
        name: 'Crispy Corn',
        quantity: 1,
        category: 'Starters',
        icon: 'corn',
      },
    ],
  },
  {
    id: 'ord-1020',
    orderNumber: '#1020',
    isTakeaway: true,
    priority: 'HIGH',
    status: 'ready',
    station: 'Main Kitchen',
    timeLabel: 'Ready 2m',
    elapsedSeconds: 120,
    createdAt: new Date(Date.now() - 120 * 1000).toISOString(),
    items: [
      {
        id: 'item-1020-1',
        name: 'Chicken 65',
        quantity: 2,
        category: 'Starters',
        icon: 'chicken',
      },
    ],
  },

  // Station alternative orders (Tandoor / Bar)
  {
    id: 'ord-1030',
    orderNumber: '#1030',
    tableNumber: 'T-06',
    isTakeaway: false,
    priority: 'HIGH',
    status: 'new',
    station: 'Tandoor',
    timeLabel: '03:12',
    elapsedSeconds: 192,
    createdAt: new Date(Date.now() - 192 * 1000).toISOString(),
    items: [
      {
        id: 'item-1030-1',
        name: 'Tandoori Chicken Full',
        quantity: 1,
        category: 'Starters',
        icon: 'chicken',
      },
    ],
  },
  {
    id: 'ord-1031',
    orderNumber: '#1031',
    tableNumber: 'T-08',
    isTakeaway: false,
    priority: 'NORMAL',
    status: 'new',
    station: 'Bar',
    timeLabel: '01:45',
    elapsedSeconds: 105,
    createdAt: new Date(Date.now() - 105 * 1000).toISOString(),
    items: [
      {
        id: 'item-1031-1',
        name: 'Virgin Mojito',
        quantity: 2,
        category: 'Drinks',
        icon: 'drink',
      },
    ],
  },
]);
