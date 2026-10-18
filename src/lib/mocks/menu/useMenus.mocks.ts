/** Meal-session menus list (Menus page). */

export type MenuSessionStatus = 'active' | 'inactive';

export type MenuSessionDay =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface MenuSessionItem {
  id: number;
  name: string;
  code: string;
  status: MenuSessionStatus;
  /** Display label for menu type badge (e.g. ALL). */
  menuType: string;
  description: string;
  /** ISO timestamp used for “Updated … ago”. */
  updatedAt: string;
  /** Schedule days; empty means any day. */
  days: MenuSessionDay[];
}

export const MENU_STATUS_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;

export type MenuStatusFilter = (typeof MENU_STATUS_FILTER_OPTIONS)[number]['id'];

export const MENU_DAY_FILTER_OPTIONS = [
  { id: 'any', label: 'Any Day' },
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
] as const;

export type MenuDayFilter = (typeof MENU_DAY_FILTER_OPTIONS)[number]['id'];

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_MENUS: MenuSessionItem[] = [
  {
    id: 1,
    name: 'Breakfast',
    code: 'BKFAST',
    status: 'active',
    menuType: 'ALL',
    description: 'Morning meal service featuring breakfast classics and beverages.',
    updatedAt: hoursAgo(2),
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  {
    id: 2,
    name: 'Lunch',
    code: 'LUNCH',
    status: 'active',
    menuType: 'ALL',
    description: 'Midday service with mains, sides, and beverages.',
    updatedAt: hoursAgo(5),
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  },
  {
    id: 3,
    name: 'Snacks',
    code: 'SNACKS',
    status: 'inactive',
    menuType: 'ALL',
    description: 'Light bites and refreshments for off-peak hours.',
    updatedAt: daysAgo(1),
    days: ['saturday', 'sunday'],
  },
  {
    id: 4,
    name: 'Dinner',
    code: 'DINNER',
    status: 'active',
    menuType: 'ALL',
    description: 'Evening dining with full-course options.',
    updatedAt: hoursAgo(3),
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
];
