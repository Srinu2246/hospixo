import type { KitchenConnectionStatus, KitchenOrder, KitchenStats } from '@/features/kitchen/types';

/** Preview orders matching the Kitchen Display design until the POS/KDS API is wired. */
export const kitchenPreviewOrders: KitchenOrder[] = [
  {
    id: 'ord-1021',
    number: '1021',
    status: 'new',
    priority: 'high',
    channel: 'dine_in',
    tableLabel: 'T-12',
    stationId: 'main-kitchen',
    placedAt: '2026-07-20T12:00:00.000Z',
    items: [
      { id: 'i1', name: 'Paneer Tikka', quantity: 1, category: 'starters' },
      { id: 'i2', name: 'Fresh Lime Soda', quantity: 2, category: 'drinks' },
    ],
  },
  {
    id: 'ord-1024',
    number: '1024',
    status: 'new',
    priority: 'normal',
    channel: 'dine_in',
    tableLabel: 'T-04',
    stationId: 'main-kitchen',
    placedAt: '2026-07-20T12:02:00.000Z',
    items: [
      { id: 'i3', name: 'Mutton Rogan Josh', quantity: 1, category: 'mains' },
      { id: 'i4', name: 'Garlic Naan', quantity: 3, category: 'mains' },
    ],
  },
  {
    id: 'ord-1020',
    number: '1020',
    status: 'preparing',
    priority: 'high',
    channel: 'dine_in',
    tableLabel: 'T-02',
    stationId: 'main-kitchen',
    placedAt: '2026-07-20T11:55:00.000Z',
    items: [
      { id: 'i5', name: 'Chicken Biryani', quantity: 2, category: 'mains' },
      { id: 'i6', name: 'Coke', quantity: 2, category: 'drinks' },
    ],
  },
  {
    id: 'ord-1022',
    number: '1022',
    status: 'preparing',
    priority: 'normal',
    channel: 'dine_in',
    tableLabel: 'T-11',
    stationId: 'main-kitchen',
    placedAt: '2026-07-20T11:58:00.000Z',
    items: [
      { id: 'i7', name: 'Dal Makhani', quantity: 1, category: 'mains' },
      { id: 'i8', name: 'Butter Naan', quantity: 4, category: 'mains' },
    ],
  },
  {
    id: 'ord-1018',
    number: '1018',
    status: 'ready',
    priority: 'normal',
    channel: 'takeaway',
    stationId: 'main-kitchen',
    placedAt: '2026-07-20T11:40:00.000Z',
    items: [
      { id: 'i9', name: 'Veg Fried Rice', quantity: 1, category: 'mains' },
      { id: 'i10', name: 'Crispy Corn', quantity: 1, category: 'starters' },
    ],
  },
  {
    id: 'ord-1025',
    number: '1025',
    status: 'ready',
    priority: 'high',
    channel: 'takeaway',
    stationId: 'main-kitchen',
    placedAt: '2026-07-20T11:45:00.000Z',
    items: [{ id: 'i11', name: 'Chicken 65', quantity: 2, category: 'starters' }],
  },
];

/** Aggregate strip values from the design (not only visible column cards). */
export const kitchenPreviewStats: KitchenStats = {
  total: 324,
  pending: 8,
  preparing: 5,
  ready: 3,
};

export const kitchenPreviewConnection: KitchenConnectionStatus = {
  printerConnected: true,
  posSyncActive: true,
  avgPrepTimeLabel: '14m 30s',
};

/** @deprecated Use `kitchenPreviewOrders` */
export const chefPreviewOrders = kitchenPreviewOrders;
