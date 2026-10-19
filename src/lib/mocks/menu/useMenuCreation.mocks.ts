import {
  menuCategoryResponseListSchema,
  type MenuCategoryResponse,
  type StatusBasic,
} from '@/lib/schemas/menu/menuCategoriesSchema';
import {
  menuItemResponseListSchema,
  type DietaryTypeApi,
  type MenuItemResponse,
} from '@/lib/schemas/menu/menuItemsSchema';

const ORGANIZATION_ID = 126;
const COMPANY_ID = 94;

/** Session / menu filter options for the Menu Creation toolbar dropdown. */
export const MENU_SESSION_OPTIONS = [
  { id: 'session-wise', label: 'Session Wise Menu' },
  { id: 'all-day', label: 'All-Day Dining' },
  { id: 'breakfast', label: 'Breakfast Specials' },
  { id: 'dinner', label: 'Dinner Menu' },
] as const;

/** Seed categories for Menu Creation layout matching GET /v1/restaurant/menu/categories. */
export const MOCK_MENU_CATEGORIES: MenuCategoryResponse[] = menuCategoryResponseListSchema.parse([
  {
    id: 1,
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    catalogue_scope: 'company',
    parent_id: null,
    name: 'Starters',
    description: 'Appetizers and snacks',
    display_order: 1,
    status: 'active',
    created_at: '2026-10-12T10:00:00.000Z',
    updated_at: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 2,
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    catalogue_scope: 'company',
    parent_id: null,
    name: 'Main Course',
    description: 'Hearty meals and curries',
    display_order: 2,
    status: 'active',
    created_at: '2026-10-12T10:00:00.000Z',
    updated_at: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 3,
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    catalogue_scope: 'company',
    parent_id: null,
    name: 'Breads',
    description: 'Fresh tandoori rotis and naans',
    display_order: 3,
    status: 'active',
    created_at: '2026-10-12T10:00:00.000Z',
    updated_at: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 4,
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    catalogue_scope: 'company',
    parent_id: null,
    name: 'Beverages',
    description: 'Cold and hot beverages',
    display_order: 4,
    status: 'active',
    created_at: '2026-10-12T10:00:00.000Z',
    updated_at: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 5,
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    catalogue_scope: 'company',
    parent_id: null,
    name: 'Desserts',
    description: 'Sweets and ice creams',
    display_order: 5,
    status: 'inactive',
    created_at: '2026-10-12T10:00:00.000Z',
    updated_at: '2026-10-12T10:00:00.000Z',
  },
]);

const CREATED_AT = '2026-10-12T10:00:00.000Z';

function menuItem(input: {
  id: number;
  categoryId: number;
  name: string;
  code: string;
  basePrice: number;
  dietary: DietaryTypeApi;
  status: StatusBasic;
  description?: string;
  imageUrl?: string;
  allowDelivery?: boolean;
  isFavorite?: boolean;
  isCombo?: boolean;
  tagNames?: readonly string[];
  variants?: Array<{ id: number; name: string; price: number; isDefault?: boolean }>;
  modifiers?: Array<{ id: number; name: string; min?: number; max?: number }>;
}): MenuItemResponse {
  const tagNames = input.tagNames ?? [];
  const tags = tagNames.map((name, index) => ({
    id: input.id * 100 + index + 1,
    name,
    code: name.toUpperCase().replace(/\s+/g, '_'),
  }));

  return {
    id: input.id,
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    catalogue_scope: 'company',
    branch_id: null,
    category_id: input.categoryId,
    taxes: [],
    preparation_stations: [],
    modifier_groups: (input.modifiers ?? []).map((modifier, index) => ({
      id: input.id * 1000 + index + 1,
      modifier_group_id: modifier.id,
      override_min_select: null,
      override_max_select: null,
      display_order: index,
      modifier_group: {
        id: modifier.id,
        name: modifier.name,
        min_select: modifier.min ?? 0,
        max_select: modifier.max ?? 1,
        is_required: (modifier.min ?? 0) > 0,
      },
    })),
    name: input.name,
    code: input.code,
    description: input.description ?? null,
    sku: input.code,
    barcode: null,
    base_price: input.basePrice,
    profit_margin_percent: null,
    allow_dine_in: true,
    allow_takeaway: true,
    allow_delivery: input.allowDelivery ?? true,
    expose_captain_app: true,
    is_favorite: input.isFavorite ?? false,
    is_combo: input.isCombo ?? false,
    tag_ids: tags.map((tag) => tag.id),
    tags,
    dietary_type: input.dietary,
    status: input.status,
    variants: (input.variants ?? []).map((variant, index) => ({
      id: variant.id,
      organization_id: ORGANIZATION_ID,
      company_id: COMPANY_ID,
      catalogue_scope: 'company' as const,
      branch_id: null,
      item_id: input.id,
      name: variant.name,
      sku: null,
      price_adjustment: variant.price - input.basePrice,
      final_price: variant.price,
      display_order: index,
      is_default: variant.isDefault ?? index === 0,
      status: 'active' as const,
      created_at: CREATED_AT,
      updated_at: CREATED_AT,
    })),
    images: input.imageUrl
      ? [
          {
            id: input.id * 10 + 1,
            organization_id: ORGANIZATION_ID,
            company_id: COMPANY_ID,
            branch_id: null,
            catalogue_scope: 'company' as const,
            item_id: input.id,
            storage_key: null,
            url: input.imageUrl,
            mime_type: 'image/jpeg',
            sort_order: 0,
            is_primary: true,
            status: 'active' as const,
            created_at: CREATED_AT,
            updated_at: CREATED_AT,
          },
        ]
      : [],
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
  };
}

/** Seed items for Menu Creation + dine-in matching GET /v1/restaurant/menu/items. */
export const MOCK_MENU_ITEMS: MenuItemResponse[] = menuItemResponseListSchema.parse([
  menuItem({
    id: 1,
    categoryId: 1,
    name: 'Paneer Tikka',
    code: 'PNT',
    basePrice: 249,
    dietary: 'veg',
    status: 'active',
    description: 'Grilled cottage cheese with spices.',
    imageUrl:
      'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=600&auto=format&fit=crop&q=80',
    isFavorite: true,
    tagNames: ['chef-special', 'spicy', 'gluten-free'],
    variants: [
      { id: 101, name: 'Regular', price: 249, isDefault: true },
      { id: 102, name: 'Platter', price: 399 },
    ],
    modifiers: [
      { id: 11, name: 'Mint Chutney', max: 2 },
      { id: 12, name: 'Butter Toss', max: 1 },
    ],
  }),
  menuItem({
    id: 2,
    categoryId: 1,
    name: 'Chicken Tikka',
    code: 'CKT',
    basePrice: 299,
    dietary: 'non_veg',
    status: 'active',
    allowDelivery: false,
    imageUrl:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    tagNames: ['spicy'],
    variants: [
      { id: 201, name: '6 Pcs', price: 299, isDefault: true },
      { id: 202, name: '12 Pcs', price: 480 },
    ],
  }),
  menuItem({
    id: 3,
    categoryId: 2,
    name: 'Butter Chicken',
    code: 'BTC',
    basePrice: 349,
    dietary: 'non_veg',
    status: 'active',
    imageUrl:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    tagNames: ['chef-special'],
    variants: [
      { id: 301, name: 'Half', price: 249 },
      { id: 302, name: 'Full', price: 349, isDefault: true },
    ],
  }),
  menuItem({
    id: 4,
    categoryId: 2,
    name: 'Dal Makhani',
    code: 'DLM',
    basePrice: 229,
    dietary: 'veg',
    status: 'active',
    tagNames: ['eco-item'],
  }),
  menuItem({
    id: 5,
    categoryId: 3,
    name: 'Butter Naan',
    code: 'BTN',
    basePrice: 49,
    dietary: 'veg',
    status: 'active',
    allowDelivery: false,
  }),
  menuItem({
    id: 6,
    categoryId: 3,
    name: 'Garlic Naan',
    code: 'GLN',
    basePrice: 59,
    dietary: 'veg',
    status: 'active',
    allowDelivery: false,
    tagNames: ['chef-special'],
  }),
  menuItem({
    id: 7,
    categoryId: 4,
    name: 'Mango Lassi',
    code: 'MGL',
    basePrice: 99,
    dietary: 'veg',
    status: 'inactive',
    allowDelivery: false,
    tagNames: ['eco-item'],
  }),
  menuItem({
    id: 8,
    categoryId: 4,
    name: 'Masala Chai',
    code: 'MSC',
    basePrice: 49,
    dietary: 'veg',
    status: 'active',
    allowDelivery: false,
  }),
  menuItem({
    id: 9,
    categoryId: 5,
    name: 'Gulab Jamun',
    code: 'GLJ',
    basePrice: 89,
    dietary: 'veg',
    status: 'inactive',
    allowDelivery: false,
    tagNames: ['chef-special'],
  }),
  menuItem({
    id: 10,
    categoryId: 2,
    name: 'Veg Biryani',
    code: 'VBR',
    basePrice: 279,
    dietary: 'veg',
    status: 'active',
    isCombo: true,
    tagNames: ['spicy', 'chef-special', 'vegan'],
    variants: [
      { id: 1001, name: 'Single', price: 279, isDefault: true },
      { id: 1002, name: 'Family Pack', price: 699 },
    ],
  }),
  menuItem({
    id: 11,
    categoryId: 3,
    name: 'Tandoori Roti',
    code: 'TDR',
    basePrice: 29,
    dietary: 'veg',
    status: 'inactive',
    allowDelivery: false,
    description: 'Traditional crisp whole wheat flatbread baked in a clay tandoor.',
    imageUrl:
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
  }),
]);
