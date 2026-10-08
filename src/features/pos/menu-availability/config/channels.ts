import type { MenuChannel } from '@/features/pos/types/menu-availability';

/** Channels shown under the All tab. */
export const menuChannels: MenuChannel[] = [
  { id: 'all', label: 'All' },
  { id: 'hotel-mayukha', label: 'Hotel Mayukha' },
  { id: 'zomato', label: 'Zomato' },
  { id: 'swiggy', label: 'Swiggy' },
  { id: 'fuddo', label: 'Fuddo' },
  { id: 'mayukha-website', label: 'Mayukha Website' },
];

/** Channels shown under the Online tab. */
export const onlineMenuChannels: MenuChannel[] = [
  { id: 'all', label: 'All' },
  { id: 'zomato', label: 'Zomato' },
  { id: 'swiggy', label: 'Swiggy' },
  { id: 'fuddo', label: 'Fuddo' },
];

/** Restaurant channels shown under the DineIn QR tab. */
export const dineinMenuChannels: MenuChannel[] = [
  { id: 'all', label: 'All' },
  { id: 'hotel-mayukha', label: 'Hotel Mayukha' },
];
