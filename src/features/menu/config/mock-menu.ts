import type { MenuCategory, MenuItem, MenuItemTag } from '../types/menu';

export const sampleFoodImages = [
  {
    name: 'Paneer Tikka',
    url: 'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Biryani',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Naan / Bread',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rice / Pulao',
    url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chicken Tikka',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dal / Curry',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Beverages / Lassi',
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Appetizers / Rolls',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
  },
];

export const allAvailableTags = [
  'spicy',
  'chef-special',
  'eco-item',
  'no-spicy',
  'vegan',
  'extra-spicy',
  'low spicy',
  'Set As Favorite',
  'extra-masala',
  'Set As Combo',
];

export function slugifyTagName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function createBranchTagDefinitions(): MenuItemTag[] {
  return allAvailableTags.map((name) => ({
    id: slugifyTagName(name),
    name,
    code: name.toUpperCase().replace(/[\s-]+/g, '_'),
    status: 'Active' as const,
  }));
}

export const initialMockCategories: MenuCategory[] = [
  { id: 'cat_main_course', name: 'Main Course', status: 'Active', displayOrder: 1 },
  { id: 'cat_starters', name: 'Starters', status: 'Active', displayOrder: 2 },
  { id: 'cat_breads', name: 'Breads', status: 'Active', displayOrder: 3 },
  { id: 'cat_rice', name: 'Rice', status: 'Active', displayOrder: 4 },
  { id: 'cat_beverages', name: 'Beverages', status: 'Active', displayOrder: 5 },
];

export const initialMockMenuItems: MenuItem[] = [
  {
    id: 'item_001',
    name: 'Paneer Tikka',
    onlineDisplayName: 'Paneer Tikka Masala',
    code: 'PNT',
    categoryId: 'cat_starters',
    categoryName: 'Starters',
    basePrice: 249,
    profitMargin: '10%',
    gst: '5%',
    dietary: 'Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App'],
    tags: ['chef-special', 'spicy'],
    variants: [
      { id: 'v1', size: 'Mini', price: 149, status: 'Active' },
      { id: 'v2', size: 'Single', price: 249, status: 'Active' },
      { id: 'v3', size: 'Double', price: 389, status: 'Active' },
      { id: 'v4', size: 'Family Pack', price: 589, status: 'Active' },
    ],
    modifiers: [
      { id: 'm1', name: 'Extra Roti', price: 10 },
      { id: 'm2', name: 'Extra Gravy', price: 50 },
      { id: 'm3', name: 'Egg', price: 20 },
    ],
    image:
      'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=600&auto=format&fit=crop&q=80',
    description:
      'Soft cottage cheese cubes marinated in aromatic spices and grilled in a tandoor. Served with mint chutney and fresh onion rings. A classic Indian starter that never goes out of style.',
  },
  {
    id: 'item_002',
    name: 'Chicken Biryani',
    onlineDisplayName: 'Hyderabadi Chicken Biryani',
    code: 'CHB',
    categoryId: 'cat_main_course',
    categoryName: 'Main Course',
    basePrice: 349,
    profitMargin: '15%',
    gst: '5%',
    dietary: 'Non-Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App', 'Online order'],
    tags: ['chef-special', 'extra-masala'],
    variants: [
      { id: 'v1', size: 'Single', price: 349, status: 'Active' },
      { id: 'v2', size: 'Double', price: 599, status: 'Active' },
    ],
    modifiers: [
      { id: 'm1', name: 'Extra Raita', price: 30 },
      { id: 'm2', name: 'Extra Salan', price: 40 },
    ],
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    description:
      'Fragrant basmati rice cooked with tender spiced chicken and herbs in authentic dum style.',
  },
  {
    id: 'item_003',
    name: 'Butter Naan',
    onlineDisplayName: 'Butter Naan',
    code: 'BTN',
    categoryId: 'cat_breads',
    categoryName: 'Breads',
    basePrice: 49,
    profitMargin: '20%',
    gst: '5%',
    dietary: 'Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App'],
    tags: ['Set As Favorite'],
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    description: 'Traditional soft leavened Indian flatbread brushed with fresh butter.',
  },
  {
    id: 'item_004',
    name: 'Jeera Rice',
    onlineDisplayName: 'Jeera Rice Bowl',
    code: 'JRR',
    categoryId: 'cat_rice',
    categoryName: 'Rice',
    basePrice: 129,
    profitMargin: '18%',
    gst: '5%',
    dietary: 'Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App'],
    tags: ['low spicy'],
    image:
      'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&auto=format&fit=crop&q=80',
    description: 'Aromatic basmati rice tempered with roasted cumin seeds and ghee.',
  },
  {
    id: 'item_005',
    name: 'Chicken Tikka',
    onlineDisplayName: 'Tandoori Chicken Tikka',
    code: 'CKT',
    categoryId: 'cat_starters',
    categoryName: 'Starters',
    basePrice: 279,
    profitMargin: '14%',
    gst: '5%',
    dietary: 'Non-Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App'],
    tags: ['spicy', 'chef-special'],
    image:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    description: 'Boneless chicken marinated in tandoori spices and roasted to perfection.',
  },
  {
    id: 'item_006',
    name: 'Dal Makhani',
    onlineDisplayName: 'Creamy Dal Makhani',
    code: 'DLM',
    categoryId: 'cat_main_course',
    categoryName: 'Main Course',
    basePrice: 199,
    profitMargin: '15%',
    gst: '5%',
    dietary: 'Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App'],
    tags: ['Set As Favorite'],
    image:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    description: 'Slow-cooked creamy black lentils simmered with butter and spices.',
  },
  {
    id: 'item_007',
    name: 'Tandoori Roti',
    onlineDisplayName: 'Tandoori Roti',
    code: 'TDR',
    categoryId: 'cat_breads',
    categoryName: 'Breads',
    basePrice: 29,
    profitMargin: '25%',
    gst: '5%',
    dietary: 'Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App'],
    tags: ['eco-item'],
    image:
      'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
    description: 'Whole wheat bread baked in a traditional clay oven.',
  },
  {
    id: 'item_008',
    name: 'Mango Lassi',
    onlineDisplayName: 'Sweet Mango Lassi',
    code: 'MGL',
    categoryId: 'cat_beverages',
    categoryName: 'Beverages',
    basePrice: 99,
    profitMargin: '30%',
    gst: '5%',
    dietary: 'Veg',
    orderTypes: ['Delivery', 'Take Away', 'Dine In'],
    exposeIn: ['Captain App', 'Online order'],
    tags: ['Set As Favorite'],
    image:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
    description: 'Traditional refreshing yogurt drink blended with sweet Alphonso mangoes.',
  },
];
