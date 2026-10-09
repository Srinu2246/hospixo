import { posFoodImages } from '@/features/pos/config/assets';

export { formatDineInInr, formatDineInRupee } from '@/features/pos/lib/pos-currency';

export type DineInTableStatus = 'available' | 'occupied' | 'reserved';

export interface DineInTable {
  id: string;
  label: string;
  status: DineInTableStatus;
  capacity: number;
  duration: string;
}

export const dineInTableLegend: { status: DineInTableStatus; label: string }[] = [
  { status: 'available', label: 'Available' },
  { status: 'occupied', label: 'Occupied' },
  { status: 'reserved', label: 'Reserved' },
];

export function getDineInTableStatusLabel(status: DineInTableStatus) {
  return dineInTableLegend.find((item) => item.status === status)?.label ?? status;
}

export type DineInMenuCategoryId = 'all' | 'starters' | 'mains' | 'desserts' | 'beverages';

export interface MenuSizeOption {
  id: string;
  label: string;
  price: number;
}

export interface MenuAddOn {
  id: string;
  label: string;
  price: number;
}

export interface MenuItemCustomization {
  sizeId?: string;
  addOnIds?: string[];
  cookingPreference?: string;
  quantity?: number;
}

export interface DineInMenuItem {
  id: string;
  name: string;
  price: number;
  category: Exclude<DineInMenuCategoryId, 'all'>;
  group: string;
  imageUrl: string;
  customizable?: boolean;
  sizes?: MenuSizeOption[];
  addOns?: MenuAddOn[];
  cookingPreferences?: string[];
  isAvailable?: boolean;
  status?: string;
}

export interface DineInOrderLine {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  addOns?: string[];
  cookingPreference?: string;
  imageUrl: string;
}

export const dineInPageMeta = {
  title: 'Dine-In',
  statusBadge: 'Order Processing',
  locationLabel: 'Main Dining Hall',
  dateLabel: 'Oct 24, 2024',
  newOrderLabel: 'New Order',
  searchPlaceholder: 'Search items, ingredients...',
  mobileMenuTitle: 'Order Menu',
};

export { posOrderActions as dineInActions } from '@/features/pos/config/order-actions';

export const dineInMenuCategories: { id: DineInMenuCategoryId; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'starters', label: 'STARTERS' },
  { id: 'mains', label: 'MAINS' },
  { id: 'desserts', label: 'DESSERTS' },
  { id: 'beverages', label: 'BEVERAGES' },
];

const standardCookingPreferences = ['Mild', 'Medium', 'Spicy'];

function standardSizes(basePrice: number): MenuSizeOption[] {
  return [
    { id: 'regular', label: 'Regular', price: basePrice },
    { id: 'large', label: 'Large', price: Math.round(basePrice * 1.25) },
  ];
}

export const dineInMenuItems: DineInMenuItem[] = [
  {
    id: 'biryani-chicken',
    name: 'Chicken Biryani - Single',
    price: 299,
    category: 'mains',
    group: "BIRYANI'S",
    imageUrl: posFoodImages.chickenBiryani,
    customizable: true,
    sizes: [
      { id: 'mini', label: 'Mini', price: 199 },
      { id: 'single', label: 'Single', price: 299 },
      { id: 'double', label: 'Double', price: 449 },
      { id: 'family', label: 'Family Pack', price: 899 },
    ],
    addOns: [
      { id: 'raita', label: 'Extra Raita', price: 30 },
      { id: 'curry', label: 'Extra Curry', price: 40 },
      { id: 'chicken', label: 'Extra Chicken', price: 90 },
      { id: 'egg', label: 'Extra Egg', price: 25 },
      { id: 'masala', label: 'Double Masala', price: 20 },
    ],
    cookingPreferences: standardCookingPreferences,
  },
  {
    id: 'biryani-mutton',
    name: 'Mutton Biryani',
    price: 640,
    category: 'mains',
    group: "BIRYANI'S",
    imageUrl: posFoodImages.muttonBiryani,
    customizable: true,
    sizes: standardSizes(640),
    addOns: [
      { id: 'raita', label: 'Extra Raita', price: 30 },
      { id: 'curry', label: 'Extra Curry', price: 40 },
      { id: 'egg', label: 'Extra Egg', price: 25 },
      { id: 'masala', label: 'Double Masala', price: 20 },
    ],
    cookingPreferences: standardCookingPreferences,
  },
  {
    id: 'pasta-carbonara',
    name: 'Pasta Carbonara',
    price: 480,
    category: 'mains',
    group: 'MAINS',
    imageUrl: posFoodImages.pastaCarbonara,
    customizable: true,
    sizes: standardSizes(480),
    addOns: [
      { id: 'cheese', label: 'Extra Cheese', price: 50 },
      { id: 'bacon', label: 'Extra Bacon', price: 80 },
      { id: 'bread', label: 'Garlic Bread', price: 60 },
    ],
    cookingPreferences: standardCookingPreferences,
  },
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    price: 480,
    category: 'mains',
    group: 'MAINS',
    imageUrl: posFoodImages.pastaCarbonara,
    customizable: true,
    sizes: [
      { id: 'medium', label: 'Medium', price: 480 },
      { id: 'large', label: 'Large', price: 620 },
    ],
    addOns: [
      { id: 'cheese', label: 'Extra Cheese', price: 50 },
      { id: 'olives', label: 'Extra Olives', price: 40 },
      { id: 'mushroom', label: 'Extra Mushroom', price: 45 },
    ],
    cookingPreferences: standardCookingPreferences,
  },
  {
    id: 'grilled-salmon',
    name: 'Grilled Salmon',
    price: 890,
    category: 'mains',
    group: 'MAINS',
    imageUrl: posFoodImages.grilledSalmon,
    customizable: true,
    sizes: standardSizes(890),
    addOns: [
      { id: 'lemon', label: 'Extra Lemon Butter', price: 35 },
      { id: 'veggies', label: 'Grilled Veggies', price: 70 },
      { id: 'sauce', label: 'Signature Sauce', price: 45 },
    ],
    cookingPreferences: ['Rare', 'Medium', 'Well Done'],
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    price: 320,
    category: 'starters',
    group: 'STARTERS',
    imageUrl: posFoodImages.caesarSalad,
    customizable: true,
    sizes: [
      { id: 'half', label: 'Half', price: 220 },
      { id: 'full', label: 'Full', price: 320 },
    ],
    addOns: [
      { id: 'chicken', label: 'Grilled Chicken', price: 90 },
      { id: 'croutons', label: 'Extra Croutons', price: 25 },
      { id: 'parmesan', label: 'Extra Parmesan', price: 40 },
    ],
    cookingPreferences: standardCookingPreferences,
  },
  {
    id: 'soup-tomato',
    name: 'Tomato Basil Soup',
    price: 240,
    category: 'starters',
    group: 'STARTERS',
    imageUrl: posFoodImages.tomatoSoup,
    customizable: true,
    sizes: [
      { id: 'cup', label: 'Cup', price: 180 },
      { id: 'bowl', label: 'Bowl', price: 240 },
    ],
    addOns: [
      { id: 'bread', label: 'Bread Sticks', price: 35 },
      { id: 'cream', label: 'Extra Cream', price: 20 },
      { id: 'croutons', label: 'Croutons', price: 25 },
    ],
    cookingPreferences: standardCookingPreferences,
  },
  {
    id: 'brownie',
    name: 'Chocolate Brownie',
    price: 220,
    category: 'desserts',
    group: 'DESSERTS',
    imageUrl: posFoodImages.brownie,
    customizable: true,
    sizes: standardSizes(220),
    addOns: [
      { id: 'icecream', label: 'Vanilla Ice Cream', price: 60 },
      { id: 'nuts', label: 'Extra Nuts', price: 30 },
      { id: 'sauce', label: 'Chocolate Sauce', price: 25 },
    ],
  },
  {
    id: 'cheesecake',
    name: 'New York Cheesecake',
    price: 280,
    category: 'desserts',
    group: 'DESSERTS',
    imageUrl: posFoodImages.cheesecake,
    customizable: true,
    sizes: standardSizes(280),
    addOns: [
      { id: 'berries', label: 'Fresh Berries', price: 50 },
      { id: 'whipped', label: 'Whipped Cream', price: 30 },
      { id: 'caramel', label: 'Caramel Drizzle', price: 25 },
    ],
  },
  {
    id: 'lemonade',
    name: 'Fresh Lemonade',
    price: 120,
    category: 'beverages',
    group: 'BEVERAGES',
    imageUrl: posFoodImages.lemonade,
    customizable: true,
    sizes: [
      { id: 'regular', label: 'Regular', price: 120 },
      { id: 'large', label: 'Large', price: 160 },
    ],
    addOns: [
      { id: 'mint', label: 'Fresh Mint', price: 15 },
      { id: 'soda', label: 'Sparkling Water', price: 20 },
      { id: 'honey', label: 'Honey', price: 15 },
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso',
    price: 90,
    category: 'beverages',
    group: 'BEVERAGES',
    imageUrl: posFoodImages.espresso,
    customizable: true,
    sizes: [
      { id: 'single', label: 'Single Shot', price: 90 },
      { id: 'double', label: 'Double Shot', price: 140 },
    ],
    addOns: [
      { id: 'milk', label: 'Extra Milk', price: 20 },
      { id: 'sugar', label: 'Extra Sugar', price: 0 },
      { id: 'whipped', label: 'Whipped Cream', price: 30 },
    ],
  },
];

export const dineInInitialOrderLines: DineInOrderLine[] = [
  {
    id: 'line-1',
    menuItemId: 'pasta-carbonara',
    name: 'Pasta Carbonara',
    price: 480,
    quantity: 6,
    variant: 'Large',
    addOns: ['Extra Cheese'],
    imageUrl: posFoodImages.pastaCarbonara,
  },
  {
    id: 'line-2',
    menuItemId: 'caesar-salad',
    name: 'Caesar Salad',
    price: 320,
    quantity: 2,
    variant: 'Full',
    addOns: ['Extra Croutons'],
    imageUrl: posFoodImages.caesarSalad,
  },
];

export function computeCustomizedUnitPrice(
  item: DineInMenuItem,
  customization: MenuItemCustomization,
): number {
  const sizePrice = item.sizes?.find((size) => size.id === customization.sizeId)?.price;
  const base = sizePrice ?? item.price;

  const addOnTotal =
    customization.addOnIds?.reduce((sum, addOnId) => {
      const addOn = item.addOns?.find((entry) => entry.id === addOnId);
      return sum + (addOn?.price ?? 0);
    }, 0) ?? 0;

  return base + addOnTotal;
}

export function itemSupportsCustomization(item: DineInMenuItem): boolean {
  return Boolean(
    item.customizable ||
    (item.sizes && item.sizes.length > 0) ||
    (item.addOns && item.addOns.length > 0),
  );
}

export function getDefaultCustomization(item: DineInMenuItem): MenuItemCustomization {
  const defaultSize = item.sizes?.find((size) => size.id === 'single')?.id ?? item.sizes?.[0]?.id;

  return {
    sizeId: defaultSize,
    addOnIds: [],
    cookingPreference: item.cookingPreferences?.[0],
    quantity: 1,
  };
}
