import {
  menuCategoryResponseListSchema,
  type MenuCategoryResponse,
  type StatusBasic,
} from '@/lib/schemas/menu/menuCategoriesSchema';
import {
  menuCatalogItemListSchema,
  type MenuCatalogItem,
} from '@/lib/schemas/menu/menuCreationSchema';
import { restaurantMenuCategoriesPath } from '@/services/api/ApiUrlsV1';
import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

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

/** Seed catalog items for Menu Creation list / detail views. */
export const MOCK_MENU_ITEMS: MenuCatalogItem[] = menuCatalogItemListSchema.parse([
  {
    id: 'item_001',
    name: 'Paneer Tikka',
    categoryId: '1',
    categoryName: 'Starters',
    basePrice: 249,
    dietary: 'Veg',
    status: 'Available',
    code: 'PNT',
    orderTypes: ['Dine In', 'Take Away', 'Delivery'],
    tags: ['chef-special', 'spicy', 'Set As Favorite', 'gluten-free'],
    imageUrl:
      'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=600&auto=format&fit=crop&q=80',
    description: 'Grilled cottage cheese with spices.',
  },
  {
    id: 'item_002',
    name: 'Chicken Tikka',
    categoryId: '1',
    categoryName: 'Starters',
    basePrice: 299,
    dietary: 'Non-Veg',
    status: 'Available',
    code: 'CKT',
    orderTypes: ['Dine In', 'Take Away'],
    tags: ['spicy'],
    imageUrl:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_003',
    name: 'Butter Chicken',
    categoryId: '2',
    categoryName: 'Main Course',
    basePrice: 349,
    dietary: 'Non-Veg',
    status: 'Available',
    code: 'BTC',
    orderTypes: ['Dine In', 'Take Away', 'Delivery'],
    tags: ['chef-special'],
    imageUrl:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'item_004',
    name: 'Dal Makhani',
    categoryId: '2',
    categoryName: 'Main Course',
    basePrice: 229,
    dietary: 'Veg',
    status: 'Available',
    code: 'DLM',
    orderTypes: ['Dine In', 'Take Away', 'Delivery'],
    tags: ['eco-item'],
  },
  {
    id: 'item_005',
    name: 'Butter Naan',
    categoryId: '3',
    categoryName: 'Breads',
    basePrice: 49,
    dietary: 'Veg',
    status: 'Available',
    code: 'BTN',
    orderTypes: ['Dine In', 'Take Away'],
    tags: [],
  },
  {
    id: 'item_006',
    name: 'Garlic Naan',
    categoryId: '3',
    categoryName: 'Breads',
    basePrice: 59,
    dietary: 'Veg',
    status: 'Available',
    code: 'GLN',
    orderTypes: ['Dine In', 'Take Away'],
    tags: ['chef-special'],
  },
  {
    id: 'item_007',
    name: 'Mango Lassi',
    categoryId: '4',
    categoryName: 'Beverages',
    basePrice: 99,
    dietary: 'Veg',
    status: 'Out of Stock',
    code: 'MGL',
    orderTypes: ['Dine In', 'Take Away'],
    tags: ['eco-item'],
  },
  {
    id: 'item_008',
    name: 'Masala Chai',
    categoryId: '4',
    categoryName: 'Beverages',
    basePrice: 49,
    dietary: 'Veg',
    status: 'Available',
    code: 'MSC',
    orderTypes: ['Dine In', 'Take Away'],
    tags: [],
  },
  {
    id: 'item_009',
    name: 'Gulab Jamun',
    categoryId: '5',
    categoryName: 'Desserts',
    basePrice: 89,
    dietary: 'Veg',
    status: 'Hidden',
    code: 'GLJ',
    orderTypes: ['Dine In', 'Take Away'],
    tags: ['chef-special'],
  },
  {
    id: 'item_010',
    name: 'Veg Biryani',
    categoryId: '2',
    categoryName: 'Main Course',
    basePrice: 279,
    dietary: 'Veg',
    status: 'Available',
    code: 'VBR',
    orderTypes: ['Dine In', 'Take Away', 'Delivery'],
    tags: ['spicy', 'Set As Combo', 'chef-special', 'vegan'],
  },
  {
    id: 'item_011',
    name: 'Tandoori Roti',
    categoryId: '3',
    categoryName: 'Breads',
    basePrice: 29,
    dietary: 'Veg',
    status: 'Inactive',
    code: 'TDR',
    orderTypes: ['Dine In'],
    tags: [],
    imageUrl:
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    description: 'Traditional crisp whole wheat flatbread baked in a clay tandoor.',
  },
]);

export function resolveMenuCategoriesMock(request: MockRequest): unknown | undefined {
  const listPath = restaurantMenuCategoriesPath();
  if (!request.path.startsWith(listPath)) {
    return undefined;
  }

  // GET /v1/restaurant/menu/categories
  if (request.method === 'GET' && request.path === listPath) {
    const status = request.params?.status as StatusBasic | undefined;
    const page = Math.max(1, Number(request.params?.page ?? 1));
    const pageSize = Math.max(1, Number(request.params?.page_size ?? 15));

    const filtered = MOCK_MENU_CATEGORIES.filter((cat) => {
      if (status && cat.status !== status) return false;
      return true;
    });

    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      success: true as const,
      data: {
        items: paginated,
        total: filtered.length,
        page,
        page_size: pageSize,
      },
      message: 'OK',
      request_id: 'mock-menu-categories',
    };
  }

  // GET /v1/restaurant/menu/categories/{id}
  if (request.method === 'GET' && request.path.startsWith(`${listPath}/`)) {
    const idSegment = request.path.slice(listPath.length + 1).split('/')[0];
    const category = MOCK_MENU_CATEGORIES.find(
      (c) => String(c.id) === decodeURIComponent(idSegment),
    );
    if (!category) return undefined;
    return {
      success: true as const,
      data: category,
      message: 'OK',
      request_id: 'mock-menu-categories',
    };
  }

  return undefined;
}
