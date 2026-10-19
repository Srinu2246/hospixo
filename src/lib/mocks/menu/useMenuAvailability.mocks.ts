import {
  availabilityChannelListSchema,
  type AvailabilityChannel,
} from '@/lib/schemas/menu/menuAvailabilitySchema';
import type { DietaryTypeApi } from '@/lib/schemas/menu/menuItemsSchema';

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

export type AvailabilityDietaryFilter = 'all' | DietaryTypeApi;
export type AvailabilityStatusFilter = 'all' | 'active' | 'inactive';

export const AVAILABILITY_DIETARY_OPTIONS: ReadonlyArray<{
  id: AvailabilityDietaryFilter;
  label: string;
}> = [
  { id: 'all', label: 'All Dietary' },
  { id: 'veg', label: 'Veg' },
  { id: 'non_veg', label: 'Non-Veg' },
  { id: 'egg', label: 'Egg' },
  { id: 'vegan', label: 'Vegan' },
];

export const AVAILABILITY_STATUS_OPTIONS: ReadonlyArray<{
  id: AvailabilityStatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'All Status' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];
