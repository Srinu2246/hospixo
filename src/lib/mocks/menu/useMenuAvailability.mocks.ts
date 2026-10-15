import {
  availabilityCategoryListSchema,
  availabilityChannelListSchema,
  availabilityItemListSchema,
  type AvailabilityCategory,
  type AvailabilityChannel,
  type AvailabilityItem,
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

export const MOCK_AVAILABILITY_CATEGORIES: AvailabilityCategory[] =
  availabilityCategoryListSchema.parse([
    { id: 'cat_veg_biryani', name: 'Veg Biryanis', displayOrder: 1 },
    { id: 'cat_chicken_biryani', name: 'Chicken Biryanis', displayOrder: 2 },
    { id: 'cat_mains', name: 'Main Course', displayOrder: 3 },
    { id: 'cat_starters', name: 'Starters', displayOrder: 4 },
    { id: 'cat_beverages', name: 'Beverages', displayOrder: 5 },
    { id: 'cat_desserts', name: 'Desserts', displayOrder: 6 },
    { id: 'cat_combos', name: 'Combos', displayOrder: 7 },
    { id: 'cat_pizza', name: 'Pizza', displayOrder: 8 },
    { id: 'cat_burgers', name: 'Burgers', displayOrder: 9 },
    { id: 'cat_sandwiches', name: 'Sandwiches', displayOrder: 10 },
    { id: 'cat_soups', name: 'Soups', displayOrder: 11 },
    { id: 'cat_salads', name: 'Salads', displayOrder: 12 },
    { id: 'cat_noodles', name: 'Noodles', displayOrder: 13 },
    { id: 'cat_rice', name: 'Rice', displayOrder: 14 },
    { id: 'cat_breads', name: 'Breads', displayOrder: 15 },
  ]);

export const MOCK_AVAILABILITY_ITEMS: AvailabilityItem[] = availabilityItemListSchema.parse([
  {
    id: 'av_001',
    name: 'Chicken Biryani',
    categoryId: 'cat_chicken_biryani',
    categoryName: 'Chicken Biryanis',
    dietary: 'Non-Veg',
    mark: 'available',
    visibility: 'online',
    tag: 'Biryani',
    isHidden: false,
  },
  {
    id: 'av_002',
    name: 'Paneer Tikka',
    categoryId: 'cat_starters',
    categoryName: 'Starters',
    dietary: 'Veg',
    mark: 'available',
    visibility: 'online',
    tag: 'Starters',
    isHidden: false,
  },
  {
    id: 'av_003',
    name: 'Butter Chicken',
    categoryId: 'cat_mains',
    categoryName: 'Main Course',
    dietary: 'Non-Veg',
    mark: '86d',
    visibility: 'online',
    tag: 'Main Course',
    isHidden: false,
  },
  {
    id: 'av_004',
    name: 'Veg Thali',
    categoryId: 'cat_mains',
    categoryName: 'Main Course',
    dietary: 'Veg',
    mark: 'available',
    visibility: 'hidden',
    tag: 'Thali',
    isHidden: true,
  },
  {
    id: 'av_005',
    name: 'Cold Coffee',
    categoryId: 'cat_beverages',
    categoryName: 'Beverages',
    dietary: 'Veg',
    mark: '86d',
    visibility: 'online',
    tag: 'Beverages',
    isHidden: false,
  },
  {
    id: 'av_006',
    name: 'Veg Dum Biryani',
    categoryId: 'cat_veg_biryani',
    categoryName: 'Veg Biryanis',
    dietary: 'Veg',
    mark: 'available',
    visibility: 'online',
    tag: 'Biryani',
    isHidden: false,
  },
  {
    id: 'av_007',
    name: 'Paneer Biryani',
    categoryId: 'cat_veg_biryani',
    categoryName: 'Veg Biryanis',
    dietary: 'Veg',
    mark: 'available',
    visibility: 'online',
    tag: 'Biryani',
    isHidden: false,
  },
  {
    id: 'av_008',
    name: 'Mushroom Biryani',
    categoryId: 'cat_veg_biryani',
    categoryName: 'Veg Biryanis',
    dietary: 'Veg',
    mark: '86d',
    visibility: 'online',
    tag: 'Biryani',
    isHidden: false,
  },
  {
    id: 'av_009',
    name: 'Hyderabadi Chicken Biryani',
    categoryId: 'cat_chicken_biryani',
    categoryName: 'Chicken Biryanis',
    dietary: 'Non-Veg',
    mark: 'available',
    visibility: 'online',
    tag: 'Biryani',
    isHidden: false,
  },
]);
