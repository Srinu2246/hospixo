import {
  parseMenuAssignments,
  restaurantMenuRecordSchema,
  type MenuAssignment,
  type MenuCategoryAssignment,
  type RestaurantMenuRecord,
} from '@/lib/schemas/menu/menus/menusSchema';
import {
  menuItemTagDefinitionSchema,
  type MenuItemTagDefinition,
} from '@/lib/schemas/menu/menuItemTagsSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import type { HttpMethod, QueryParams } from '@/services/api/types';

export type { MenuAssignment };

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

// ——— Menus list (branch assignments) ———

export const MENU_STATUS_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;

export type MenuStatusFilter = (typeof MENU_STATUS_FILTER_OPTIONS)[number]['id'];

/** GET /v1/restaurant/branches/{branch_id}/menus */
export const MOCK_MENUS: MenuAssignment[] = parseMenuAssignments({
  success: true,
  data: {
    items: [
      {
        id: 19,
        organization_id: 126,
        company_id: 94,
        branch_id: 49,
        menu_id: 13,
        display_order: 0,
        is_default: true,
        status: 'active',
        menu: {
          id: 13,
          organization_id: 126,
          company_id: 94,
          catalogue_scope: 'company',
          branch_id: null,
          name: 'All Day',
          code: 'DEFAULT',
          description: 'Default company menu with all active categories',
          menu_type: 'all',
          display_order: 0,
          status: 'active',
          branch_assignment_id: null,
          created_at: '2026-10-07T20:57:45.441832Z',
          updated_at: '2026-10-07T20:57:45.441832Z',
        },
        created_at: '2026-10-09T09:28:38.785713Z',
        updated_at: '2026-10-09T09:28:38.785713Z',
      },
      {
        id: 20,
        organization_id: 126,
        company_id: 94,
        branch_id: 49,
        menu_id: 15,
        display_order: 0,
        is_default: false,
        status: 'active',
        menu: {
          id: 15,
          organization_id: 126,
          company_id: 94,
          catalogue_scope: 'branch',
          branch_id: 49,
          name: 'Breakfast',
          code: 'BKFAST',
          description: null,
          menu_type: 'all',
          display_order: 0,
          status: 'active',
          branch_assignment_id: null,
          created_at: '2026-10-09T09:47:38.011583Z',
          updated_at: '2026-10-09T09:47:38.011583Z',
        },
        created_at: '2026-10-09T09:47:38.011583Z',
        updated_at: '2026-10-09T09:47:38.011583Z',
      },
    ],
    total: 2,
    page: 1,
    page_size: 15,
  },
  message: 'Branch menus retrieved',
  request_id: '6286218c-c40e-4665-837a-0ad716639d23',
});

// ——— Company catalogue menus ———

/** GET /v1/restaurant/menus */
export const MOCK_RESTAURANT_MENUS: RestaurantMenuRecord[] = restaurantMenuRecordSchema
  .array()
  .parse([
    {
      id: 13,
      organization_id: 126,
      company_id: 94,
      catalogue_scope: 'company',
      branch_id: null,
      name: 'All day',
      menu: 'all_day',
      code: 'DEFAULT',
      description: 'Default company menu with all active categories',
      menu_type: 'all',
      display_order: 0,
      status: 'active',
      branch_assignment_id: null,
      created_at: '2026-10-07T20:57:45.441832Z',
      updated_at: '2026-10-07T20:57:45.441832Z',
    },
    {
      id: 15,
      organization_id: 126,
      company_id: 94,
      catalogue_scope: 'branch',
      branch_id: 49,
      name: 'Breakfast',
      menu: 'breakfast',
      code: 'BKFAST',
      description: null,
      menu_type: 'all',
      display_order: 0,
      status: 'active',
      branch_assignment_id: null,
      created_at: '2026-10-09T09:47:38.011583Z',
      updated_at: '2026-10-09T09:47:38.011583Z',
    },
    {
      id: 16,
      organization_id: 126,
      company_id: 94,
      catalogue_scope: 'branch',
      branch_id: 64,
      name: 'Dinner',
      menu: 'dinner',
      code: 'DINNER',
      description: null,
      menu_type: 'all',
      display_order: 1,
      status: 'active',
      branch_assignment_id: null,
      created_at: '2026-10-10T10:00:00.000000Z',
      updated_at: '2026-10-10T10:00:00.000000Z',
    },
    {
      id: 17,
      organization_id: 126,
      company_id: 94,
      catalogue_scope: 'branch',
      branch_id: 64,
      name: 'Lunch',
      menu: 'lunch',
      code: 'LUNCH',
      description: null,
      menu_type: 'all',
      display_order: 2,
      status: 'active',
      branch_assignment_id: null,
      created_at: '2026-10-10T10:05:00.000000Z',
      updated_at: '2026-10-10T10:05:00.000000Z',
    },
    {
      id: 18,
      organization_id: 126,
      company_id: 94,
      catalogue_scope: 'branch',
      branch_id: 64,
      name: 'Soups',
      menu: 'snacks',
      code: 'SOUPS',
      description: null,
      menu_type: 'all',
      display_order: 3,
      status: 'active',
      branch_assignment_id: null,
      created_at: '2026-10-10T10:10:00.000000Z',
      updated_at: '2026-10-10T10:10:00.000000Z',
    },
  ]);

// ——— Menu item tags ———

const MENU_ITEM_TAG_CREATED_AT = '2026-10-12T10:00:00.000Z';

/** GET /v1/restaurant/menu/item-tags */
export const MOCK_MENU_ITEM_TAGS: MenuItemTagDefinition[] = [
  menuItemTagDefinitionSchema.parse({
    id: 1,
    organization_id: 126,
    company_id: 94,
    branch_id: null,
    catalogue_scope: 'company',
    name: 'spicy',
    code: 'SPICY',
    status: 'active',
    created_at: MENU_ITEM_TAG_CREATED_AT,
    updated_at: MENU_ITEM_TAG_CREATED_AT,
  }),
  menuItemTagDefinitionSchema.parse({
    id: 2,
    organization_id: 126,
    company_id: 94,
    branch_id: null,
    catalogue_scope: 'company',
    name: 'chef-special',
    code: 'CHEF_SPECIAL',
    status: 'active',
    created_at: MENU_ITEM_TAG_CREATED_AT,
    updated_at: MENU_ITEM_TAG_CREATED_AT,
  }),
  menuItemTagDefinitionSchema.parse({
    id: 3,
    organization_id: 126,
    company_id: 94,
    branch_id: null,
    catalogue_scope: 'company',
    name: 'vegan',
    code: 'VEGAN',
    status: 'active',
    created_at: MENU_ITEM_TAG_CREATED_AT,
    updated_at: MENU_ITEM_TAG_CREATED_AT,
  }),
  menuItemTagDefinitionSchema.parse({
    id: 4,
    organization_id: 126,
    company_id: 94,
    branch_id: 49,
    catalogue_scope: 'branch',
    name: 'gluten-free',
    code: 'GLUTEN_FREE',
    status: 'active',
    created_at: MENU_ITEM_TAG_CREATED_AT,
    updated_at: MENU_ITEM_TAG_CREATED_AT,
  }),
];

// ——— Category assignments (in-memory for mocked POST/GET) ———

const assignmentsByMenuId = new Map<number, MenuCategoryAssignment[]>();

export function appendMockMenuCategoryAssignment(assignment: MenuCategoryAssignment): void {
  const menuId = assignment.menu_id;
  const list = assignmentsByMenuId.get(menuId) ?? [];
  if (list.some((row) => row.category_id === assignment.category_id)) return;
  assignmentsByMenuId.set(menuId, [...list, assignment]);
}

const CATEGORY_ASSIGNMENTS_PATH_RE = /^\/v1\/restaurant\/menus\/(\d+)\/category-assignments$/;

function parseMenuIdFromCategoryAssignmentsPath(path: string): number | undefined {
  const match = CATEGORY_ASSIGNMENTS_PATH_RE.exec(path);
  if (!match) return undefined;
  const menuId = Number(match[1]);
  return Number.isFinite(menuId) && menuId > 0 ? menuId : undefined;
}

/** GET/POST /v1/restaurant/menus/{menu_id}/category-assignments (GET only in resolver). */
export function resolveMenuCategoryAssignmentsMock(request: MockRequest): unknown | undefined {
  const menuId = parseMenuIdFromCategoryAssignmentsPath(request.path);
  if (menuId == null) return undefined;

  if (request.method === 'GET') {
    const search =
      typeof request.params?.search === 'string' ? request.params.search.trim().toLowerCase() : '';
    const categoryId = Number(request.params?.category_id);
    let items = assignmentsByMenuId.get(menuId) ?? [];
    if (Number.isFinite(categoryId) && categoryId > 0) {
      items = items.filter((row) => row.category_id === categoryId);
    }
    if (search) {
      items = items.filter((row) => {
        const haystack = [row.category?.name, String(row.category_id)].join(' ').toLowerCase();
        return haystack.includes(search);
      });
    }
    const page = Number(request.params?.page ?? 1) || 1;
    const pageSize = Number(request.params?.page_size ?? 15) || 15;
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);
    return {
      success: true,
      data: {
        items: pageItems,
        total: items.length,
        page,
        page_size: pageSize,
      },
      message: 'OK',
      request_id: 'mock-menu-category-assignments',
    };
  }

  if (
    request.method === 'POST' &&
    request.path === `${ApiUrlsV1.restaurant.menus.list}/${menuId}/category-assignments`
  ) {
    return undefined;
  }

  return undefined;
}

// ——— Branch menus list + assignment activate/deactivate ———

const BRANCH_MENUS_PATH_RE = /^\/v1\/restaurant\/branches\/\d+\/menus$/;
const BRANCH_MENU_STATUS_RE =
  /^\/v1\/restaurant\/branches\/(\d+)\/menus\/(\d+)\/(activate|deactivate)$/;

function branchMenusOk<T>(data: T, message = 'Branch menus retrieved') {
  return { success: true as const, data, message, request_id: 'mock-branch-menus' };
}

/** GET branch menus; POST branch menu activate/deactivate. */
export function resolveBranchMenusMock(request: MockRequest): unknown | undefined {
  const statusMatch = BRANCH_MENU_STATUS_RE.exec(request.path);
  if (request.method === 'POST' && statusMatch) {
    const assignmentId = Number(statusMatch[2]);
    const nextStatus = statusMatch[3] === 'activate' ? 'active' : 'inactive';
    const existing = MOCK_MENUS.find((row) => row.id === assignmentId);
    const now = new Date().toISOString();
    if (existing) {
      existing.status = nextStatus;
      existing.updated_at = now;
      existing.menu = { ...existing.menu, status: nextStatus, updated_at: now };
    }
    return {
      success: true,
      data: existing ?? {
        id: assignmentId,
        organization_id: 126,
        company_id: 94,
        branch_id: Number(statusMatch[1]),
        menu_id: assignmentId,
        display_order: 0,
        is_default: false,
        status: nextStatus,
        menu: {
          id: assignmentId,
          name: 'Menu',
          status: nextStatus,
          menu_type: 'all',
          display_order: 0,
        },
        created_at: now,
        updated_at: now,
      },
      message: nextStatus === 'active' ? 'Branch menu activated' : 'Branch menu deactivated',
    };
  }

  if (request.method !== 'GET' || !BRANCH_MENUS_PATH_RE.test(request.path)) return undefined;

  const status =
    typeof request.params?.status === 'string' ? request.params.status.toLowerCase() : '';
  const search =
    typeof request.params?.search === 'string' ? request.params.search.trim().toLowerCase() : '';
  const filtered = MOCK_MENUS.filter((row) => {
    if (status && status !== 'all' && row.status.toLowerCase() !== status) return false;
    if (!search) return true;
    const { name, code, menu_type: menuType } = row.menu;
    return (
      name.toLowerCase().includes(search) ||
      (code ?? '').toLowerCase().includes(search) ||
      (menuType ?? '').toLowerCase().includes(search)
    );
  });

  const page = Number(request.params?.page ?? 1) || 1;
  const pageSize = Number(request.params?.page_size ?? 15) || 15;
  const start = (page - 1) * pageSize;

  return branchMenusOk({
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    page_size: pageSize,
  });
}
