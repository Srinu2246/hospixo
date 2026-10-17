import {
  availabilityChannelListSchema,
  type AvailabilityChannel,
} from '@/lib/schemas/menu/menuAvailabilitySchema';

export const AVAILABILITY_GROUP_TABS = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'dine-in-qr', label: 'DineIn QR' },
] as const;

export const AVAILABILITY_CHANNELS: AvailabilityChannel[] = availabilityChannelListSchema.parse([
  { id: 'all', label: 'All', group: 'all' },
  { id: 'mayukha-website', label: 'Mayukha Website', group: 'online' },
  { id: 'zomato', label: 'Zomato', group: 'online' },
  { id: 'swiggy', label: 'Swiggy', group: 'online' },
  { id: 'fuddo', label: 'Fuddo', group: 'online' },
  { id: 'dine-in-qr', label: 'DineIn QR', group: 'dine-in-qr' },
]);

export const ADDON_STATUS_OPTIONS = [
  { id: 'addon-on', label: 'Addon On' },
  { id: 'addon-off', label: 'Addon Off' },
] as const;

export const STORE_STATUS_OPTIONS = [
  { id: 'store-on', label: 'Store On' },
  { id: 'store-off', label: 'Store Off' },
] as const;
