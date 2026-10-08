export const kdsDisplayCopy = {
  title: 'Kitchen Display',
  emptyColumn: 'No orders in this stage.',
  emptyBoard: 'No kitchen orders yet. New tickets will appear here when POS sends them.',
  live: 'Live',
  stats: {
    total: 'Total Orders',
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
  },
  columns: {
    new: 'New Orders',
    preparing: 'Preparing',
    ready: 'Ready to Serve',
  },
  actions: {
    startPreparing: 'Start Preparing',
    recall: 'Recall',
    markReady: 'Mark ready',
    served: 'Served / Picked up',
  },
  priority: {
    high: 'HIGH',
    normal: 'NORMAL',
  },
  channel: {
    dine_in: 'Dine-in',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
  },
  category: {
    starters: 'Starters',
    mains: 'Mains',
    drinks: 'Drinks',
    desserts: 'Desserts',
    other: 'Other',
  },
  footer: {
    printerConnected: 'Printer: Connected',
    printerDisconnected: 'Printer: Disconnected',
    posSyncActive: 'POS sync: Active',
    posSyncInactive: 'POS sync: Offline',
    avgPrep: 'Avg. Prep Time',
  },
} as const;

export type KdsDisplayCopy = typeof kdsDisplayCopy;

export const kitchenDisplayCopy = kdsDisplayCopy;
