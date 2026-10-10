export type MenuSurfaceTab = 'all' | 'online' | 'dinein_qr';

export type MenuChannelId =
  'all' | 'hotel-mayukha' | 'zomato' | 'swiggy' | 'fuddo' | 'mayukha-website';

export type MenuItemDiet = 'veg' | 'non_veg';

export type MenuItemStatus = 'available' | '86d' | 'hidden';

/** Stat card filter — `total` clears the status filter. */
export type MenuStatusFilter = 'total' | MenuItemStatus;

export type MenuCategory = {
  id: string;
  label: string;
  enabled: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  categoryId: string;
  tags: string[];
  diet: MenuItemDiet;
  status: MenuItemStatus;
  visibility: 'Online' | 'Dinein QR' | 'All' | 'Hidden';
  channels: MenuChannelId[];
  surfaces: MenuSurfaceTab[];
  overrideId?: string;
  menuItemId?: string;
};

export type MenuChannel = {
  id: MenuChannelId;
  label: string;
};

export type MenuAvailabilityStats = {
  total: number;
  available: number;
  eightySixed: number;
  hidden: number;
};
