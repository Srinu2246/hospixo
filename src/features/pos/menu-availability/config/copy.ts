export const menuAvailabilityCopy = {
  title: 'Menu Availability',
  subtitle: 'Manage item availability across all channels.',
  synced: 'Synced with Swiggy · Zomato',
  searchPlaceholder: 'Search items...',
  quickSection: 'Quick Section Controller',
  addonOn: 'Addon On',
  storeOn: 'Store On',
  columns: {
    name: 'Name',
    markAs: 'Mark As',
  },
  status: {
    available: 'Available',
    eightySixed: "86'd",
    hidden: 'Hidden',
  },
  visibilityPrefix: 'Visibility:',
  stats: {
    total: 'TOTAL ITEMS',
    available: 'AVAILABLE',
    eightySixed: "86'D ITEMS",
    hidden: 'HIDDEN',
  },
  tabs: {
    all: 'All',
    online: 'Online',
    dinein_qr: 'DineIn QR',
  },
  footer: {
    changed: (n: number) => `${n} item${n === 1 ? '' : 's'} changed`,
    eightySixed: (n: number) => `${n} currently 86'd`,
    update: 'Update Availability',
  },
  emptyCategory: 'No items in this category for the selected filters.',
} as const;
