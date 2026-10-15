export type MenuCategory = 'all' | 'starters' | 'mains' | 'desserts' | 'beverages';

export interface ItemSizeOption {
  id: string;
  name: string;
  price: number;
}

export interface ItemAddOnOption {
  id: string;
  name: string;
  price: number;
}

export type CookingPreference = 'Mild' | 'Medium' | 'Spicy';

export interface PosMenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  categorySection: string;
  basePrice: number;
  imageUrl?: string;
  isPopular?: boolean;
  sizes: ItemSizeOption[];
  addOns: ItemAddOnOption[];
  cookingPreferences: CookingPreference[];
}

export interface CartCustomization {
  selectedSizes: ItemSizeOption[];
  selectedAddOns: ItemAddOnOption[];
  cookingPreference: CookingPreference;
}

export interface CartItem {
  cartId: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  customization?: CartCustomization;
  itemBadges?: string[];
  isExisting?: boolean;
  disableDelete?: boolean;
  originalQuantity?: number;
}

export const MOCK_MENU_ITEMS: PosMenuItem[] = [
  // Biryani's / Mains
  {
    id: 'pasta-carbonara',
    name: 'Pasta Carbonara',
    category: 'mains',
    categorySection: "BIRYANI'S",
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'mini', name: 'Mini', price: 199 },
      { id: 'single', name: 'Single', price: 299 },
      { id: 'double', name: 'Double', price: 449 },
      { id: 'family-pack', name: 'Family Pack', price: 899 },
    ],
    addOns: [
      { id: 'extra-raita', name: 'Extra Raita', price: 30 },
      { id: 'extra-curry', name: 'Extra Curry', price: 40 },
      { id: 'extra-chicken', name: 'Extra Chicken', price: 90 },
      { id: 'extra-egg', name: 'Extra Egg', price: 25 },
      { id: 'double-masala', name: 'Double Masala', price: 20 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    category: 'mains',
    categorySection: "BIRYANI'S",
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'single', name: 'Single (8")', price: 320 },
      { id: 'medium', name: 'Medium (10")', price: 480 },
      { id: 'large', name: 'Large (12")', price: 620 },
    ],
    addOns: [
      { id: 'extra-cheese', name: 'Extra Cheese', price: 60 },
      { id: 'jalapenos', name: 'Jalapenos', price: 35 },
      { id: 'mushrooms', name: 'Fresh Mushrooms', price: 45 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },
  {
    id: 'chicken-biryani-single',
    name: 'Chicken Biryani - Single',
    category: 'mains',
    categorySection: "BIRYANI'S",
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'mini', name: 'Mini', price: 250 },
      { id: 'single', name: 'Single', price: 480 },
      { id: 'family-pack', name: 'Family Pack', price: 890 },
    ],
    addOns: [
      { id: 'extra-salan', name: 'Extra Mirchi Ka Salan', price: 40 },
      { id: 'extra-raita', name: 'Extra Raita', price: 30 },
      { id: 'boiled-egg', name: 'Extra Boiled Egg', price: 25 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },
  {
    id: 'chicken-biryani-regular',
    name: 'Chicken Biryani - Regular',
    category: 'mains',
    categorySection: "BIRYANI'S",
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'regular', name: 'Regular', price: 480 },
      { id: 'double', name: 'Double', price: 720 },
    ],
    addOns: [
      { id: 'extra-raita', name: 'Extra Raita', price: 30 },
      { id: 'extra-egg', name: 'Extra Egg', price: 25 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },
  {
    id: 'chicken-biryani-full',
    name: 'Chicken Biryani - Full',
    category: 'mains',
    categorySection: "BIRYANI'S",
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'full', name: 'Full Platter', price: 480 },
      { id: 'jumbo', name: 'Jumbo Feast', price: 950 },
    ],
    addOns: [
      { id: 'extra-chicken', name: 'Extra Chicken Piece', price: 90 },
      { id: 'double-masala', name: 'Double Masala', price: 20 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },
  {
    id: 'mutton-single',
    name: 'Mutton - Single',
    category: 'mains',
    categorySection: "BIRYANI'S",
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'single', name: 'Single', price: 480 },
      { id: 'double', name: 'Double', price: 820 },
    ],
    addOns: [
      { id: 'extra-salan', name: 'Extra Salan', price: 40 },
      { id: 'extra-raita', name: 'Extra Raita', price: 30 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },

  // Starters
  {
    id: 'chicken-wings',
    name: 'Chicken Wings',
    category: 'starters',
    categorySection: 'STARTERS',
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1527477321055-436158623821?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: '6-pcs', name: '6 Pcs', price: 290 },
      { id: '12-pcs', name: '12 Pcs', price: 480 },
    ],
    addOns: [
      { id: 'bbq-dip', name: 'Smoky BBQ Dip', price: 40 },
      { id: 'peri-peri-seasoning', name: 'Extra Peri Peri', price: 25 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },
  {
    id: 'chicken-lollipops',
    name: 'Chicken Lollipops',
    category: 'starters',
    categorySection: 'STARTERS',
    basePrice: 480,
    imageUrl:
      'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: '5-pcs', name: '5 Pcs', price: 320 },
      { id: '8-pcs', name: '8 Pcs', price: 480 },
    ],
    addOns: [
      { id: 'schezwan-sauce', name: 'Schezwan Dip', price: 35 },
      { id: 'garlic-mayo', name: 'Garlic Mayo', price: 30 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    category: 'starters',
    categorySection: 'STARTERS',
    basePrice: 340,
    imageUrl:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'regular', name: 'Regular (6 Pcs)', price: 340 },
      { id: 'platter', name: 'Platter (10 Pcs)', price: 520 },
    ],
    addOns: [
      { id: 'mint-chutney', name: 'Extra Mint Chutney', price: 20 },
      { id: 'butter-toss', name: 'Extra Butter Toss', price: 35 },
    ],
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  },

  // Desserts
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun with Ice Cream',
    category: 'desserts',
    categorySection: 'DESSERTS',
    basePrice: 180,
    imageUrl:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'single', name: '2 Pcs', price: 120 },
      { id: 'with-ice-cream', name: '2 Pcs with Vanilla', price: 180 },
    ],
    addOns: [
      { id: 'extra-scoop', name: 'Extra Scoop Ice Cream', price: 50 },
      { id: 'pista-topping', name: 'Dry Fruit Nuts', price: 30 },
    ],
    cookingPreferences: ['Mild'],
  },

  // Beverages
  {
    id: 'fresh-lime-soda',
    name: 'Fresh Lime Soda',
    category: 'beverages',
    categorySection: 'BEVERAGES',
    basePrice: 90,
    imageUrl:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=160&q=80',
    sizes: [
      { id: 'sweet', name: 'Sweet', price: 90 },
      { id: 'salted', name: 'Salted', price: 90 },
      { id: 'mixed', name: 'Mixed', price: 100 },
    ],
    addOns: [{ id: 'mint-leaves', name: 'Fresh Mint', price: 15 }],
    cookingPreferences: ['Mild'],
  },
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    cartId: 'cart-1',
    menuItemId: 'pasta-carbonara',
    name: 'Pasta Carbonara',
    basePrice: 480,
    unitPrice: 480,
    quantity: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
    itemBadges: ['2 Items', 'Large'],
  },
  {
    cartId: 'cart-2',
    menuItemId: 'pasta-carbonara',
    name: 'Pasta Carbonara',
    basePrice: 480,
    unitPrice: 480,
    quantity: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
    itemBadges: ['2 Items', 'Large'],
  },
];
