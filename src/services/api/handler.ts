import 'server-only';

import {
  INITIAL_USERS,
  COMPANY_ROLE_TEMPLATES,
  resolveUserRolesMock,
} from '@/lib/mocks/employees/useUserRoles.mocks';
import {
  BRANCH_STAT_CARDS,
  COMPANY_STAT_CARDS,
  ORG_STAT_CARDS,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import { MOCK_DUE_PAYMENTS } from '@/lib/mocks/pos/usePosDuePayments.mocks';
import {
  POS_FLOOR_TABLES,
  POS_LIVE_ORDERS,
  POS_METRIC_CARDS,
} from '@/lib/mocks/pos/usePosDashboard.mocks';
import { MOCK_READY_ORDERS } from '@/lib/mocks/pos/usePosOrders.mocks';
import { MOCK_RESERVATIONS } from '@/lib/mocks/pos/usePosReservations.mocks';
import {
  MOCK_ACTIVE_SHIFT,
  MOCK_CASH_TRANSACTIONS,
  MOCK_SHIFT_METRICS,
  resolveCurrentShiftMock,
} from '@/lib/mocks/pos/usePosCashShift.mocks';
import { MOCK_BRANCHES } from '@/lib/mocks/organization/branches.mocks';
import { MOCK_COMPANIES } from '@/lib/mocks/organization/companies.mocks';
import { resolveRestaurantFloorMock } from '@/lib/mocks/floor-and-table-setup/restaurantFloors.mocks';
import {
  MOCK_KITCHEN_ORDERS,
  resolveKitchenDisplayMock,
} from '@/lib/mocks/kitchen-display/kitchenDisplay.mocks';
import { resolveBranchReportsMock } from '@/lib/mocks/reports/reports.mocks';
import {
  appendMockMenuCategoryAssignment,
  MOCK_MENU_ITEM_TAGS,
  MOCK_RESTAURANT_MENUS,
  resolveBranchMenusMock,
  resolveMenuCategoryAssignmentsMock,
} from '@/lib/mocks/menu/menu.mocks';
import { menuCategoryAssignmentSchema } from '@/lib/schemas/menu/menus/menusSchema';
import { resolveGstRatesMock } from '@/lib/mocks/menu/useGstRates.mocks';
import { MOCK_MENU_CATEGORIES, MOCK_MENU_ITEMS } from '@/lib/mocks/menu/useMenuCreation.mocks';
import { resolveCashRegistersMock } from '@/lib/mocks/pos/useCashCounters.mocks';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

const LIST_MOCKS: Record<string, unknown> = {
  [ApiUrlsV1.auth.login]: {
    success: true,
    message: 'OK',
    data: {
      access_token: 'mock-session',
      refresh_token: 'mock-refresh-token-value-32chars!',
      token_type: 'bearer',
    },
  },
  [ApiUrlsV1.auth.logout]: { success: true, message: 'OK' },
  [ApiUrlsV1.auth.me]: {
    success: true,
    message: 'OK',
    data: {
      id: 94,
      first_name: 'raju',
      last_name: 'raju',
      email: 'raju@gmail.com',
      scope: 'branch',
      roles: ['branch_admin'],
      company_id: 94,
      branch_id: 49,
      org_id: 126,
      must_change_password: false,
    },
  },
  [ApiUrlsV1.pos.pointOfSale.cashAndShift.list]: {
    metrics: MOCK_SHIFT_METRICS,
    activeShift: MOCK_ACTIVE_SHIFT,
    transactions: MOCK_CASH_TRANSACTIONS,
  },
  [ApiUrlsV1.pos.pointOfSale.dashboard.list]: {
    metrics: POS_METRIC_CARDS,
    liveOrders: POS_LIVE_ORDERS,
    tables: POS_FLOOR_TABLES,
  },
  [ApiUrlsV1.pos.pointOfSale.duePayments.list]: MOCK_DUE_PAYMENTS,
  [ApiUrlsV1.pos.pointOfSale.readyList.list]: MOCK_READY_ORDERS,
  [ApiUrlsV1.pos.pointOfSale.reservation.list]: MOCK_RESERVATIONS,
  [ApiUrlsV1.pos.pointOfSale.takeaway.list]: MOCK_MENU_ITEMS,
  [ApiUrlsV1.pos.pointOfSale.kitchenDisplay.list]: MOCK_KITCHEN_ORDERS,
  [ApiUrlsV1.operations.kitchenDisplay.list]: MOCK_KITCHEN_ORDERS,
  [ApiUrlsV1.users.list]: INITIAL_USERS,
  [ApiUrlsV1.roles.list]: INITIAL_USERS.map((user, index) => ({
    id: index + 1,
    name: user.role,
  })),
  [ApiUrlsV1.roles.templates]: COMPANY_ROLE_TEMPLATES,
  [ApiUrlsV1.permissions.grouped]: [],
  [ApiUrlsV1.dashboard.organization.list]: { stats: ORG_STAT_CARDS },
  [ApiUrlsV1.dashboard.company.list]: { stats: COMPANY_STAT_CARDS },
  [ApiUrlsV1.dashboard.branch.list]: { stats: BRANCH_STAT_CARDS },
  [ApiUrlsV1.organization.companies]: MOCK_COMPANIES,
  [ApiUrlsV1.restaurant.branches]: MOCK_BRANCHES,
  [ApiUrlsV1.restaurant.menuCategories.list]: MOCK_MENU_CATEGORIES,
  [ApiUrlsV1.restaurant.menuItems.list]: MOCK_MENU_ITEMS,
  [ApiUrlsV1.restaurant.menuItemTags.list]: MOCK_MENU_ITEM_TAGS,
  [ApiUrlsV1.restaurant.menus.list]: MOCK_RESTAURANT_MENUS,
};

export function isMockApiEnabled(): boolean {
  return process.env.API_MOCK === 'true';
}

/**
 * When true, `/api/v1|v2` BFF routes forward to `API_BASE_URL` on the server.
 * Browser never receives the backend origin — only same-origin `/api/...` paths.
 * Defaults to on when `API_BASE_URL` is set (unless explicitly `false`).
 */
export function isApiProxyEnabled(): boolean {
  if (isMockApiEnabled()) return false;

  const flag = process.env.API_PROXY_ENABLED?.trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'off') return false;
  if (flag === 'true' || flag === '1' || flag === 'on') return true;

  return Boolean(process.env.API_BASE_URL?.trim());
}

export function resolveMock(request: MockRequest): unknown | undefined {
  // Floors, sections, tables, and floor-map under /v1/branches/:id/floors/**
  const restaurant = resolveRestaurantFloorMock(request);
  if (restaurant !== undefined) return restaurant;

  const cashRegisters = resolveCashRegistersMock(request);
  if (cashRegisters !== undefined) return cashRegisters;

  const currentShift = resolveCurrentShiftMock(request);
  if (currentShift !== undefined) return currentShift;

  const kitchen = resolveKitchenDisplayMock(request);
  if (kitchen !== undefined) return kitchen;

  const gstRates = resolveGstRatesMock(request);
  if (gstRates !== undefined) return gstRates;

  const menuCategoryAssignments = resolveMenuCategoryAssignmentsMock(request);
  if (menuCategoryAssignments !== undefined) return menuCategoryAssignments;

  const branchMenus = resolveBranchMenusMock(request);
  if (branchMenus !== undefined) return branchMenus;

  const reports = resolveBranchReportsMock(request);
  if (reports !== undefined) return reports;

  const userRoles = resolveUserRolesMock(request);
  if (userRoles !== undefined) return userRoles;

  const listPath = findListPath(request.path);
  if (!listPath) return undefined;

  if (request.method !== 'GET') {
    if (request.path === ApiUrlsV1.auth.login || request.path === ApiUrlsV1.auth.logout) {
      return LIST_MOCKS[request.path];
    }

    if (
      request.method === 'POST' &&
      request.path === ApiUrlsV1.restaurant.menus.create &&
      isRecord(request.body)
    ) {
      const now = new Date().toISOString();
      const scope = request.body.scope === 'branch' ? 'branch' : 'company';
      const menuType = String(request.body.menu_type ?? 'all');
      return {
        success: true,
        data: {
          id: Date.now(),
          organization_id: 126,
          company_id: 94,
          catalogue_scope: scope,
          branch_id:
            scope === 'branch' && request.body.assign_branch_id != null
              ? Number(request.body.assign_branch_id)
              : null,
          name: String(request.body.name ?? 'Menu'),
          menu: String(request.body.menu ?? 'breakfast'),
          code: String(request.body.code ?? 'MENU'),
          description: request.body.description != null ? String(request.body.description) : null,
          menu_type: menuType,
          display_order: Number(request.body.display_order ?? 0),
          status: 'active',
          branch_assignment_id: null,
          created_at: now,
          updated_at: now,
        },
        message: 'Menu created',
      };
    }

    if (
      request.method === 'POST' &&
      request.path === ApiUrlsV1.restaurant.menuItemTags.create &&
      isRecord(request.body)
    ) {
      const now = new Date().toISOString();
      const scope = request.body.scope === 'branch' ? 'branch' : 'company';
      return {
        success: true,
        data: {
          id: Date.now(),
          organization_id: 126,
          company_id: 94,
          catalogue_scope: scope,
          branch_id:
            scope === 'branch' && request.body.assign_branch_id != null
              ? Number(request.body.assign_branch_id)
              : null,
          name: String(request.body.name ?? 'Tag'),
          code: String(request.body.code ?? 'TAG'),
          status: 'active',
          created_at: now,
          updated_at: now,
        },
        message: 'Menu item tag created',
      };
    }

    if (request.method === 'POST' && request.path === ApiUrlsV1.restaurant.menuItems.create) {
      const fields = formFieldsFromBody(request.body);
      const now = new Date().toISOString();
      const categoryId = Number(fields.category_id) || 1;
      const basePrice = Number(fields.base_price) || 0;
      const nextId = Date.now();
      const taxes = parseJsonArray(fields.taxes);
      const modifier_groups = parseJsonArray(fields.modifier_groups);
      const variants = parseJsonArray(fields.variants);
      const tag_ids = parseJsonArray(fields.tag_ids);
      return {
        success: true,
        data: {
          id: nextId,
          organization_id: 126,
          company_id: 94,
          catalogue_scope: fields.scope === 'branch' ? 'branch' : 'company',
          branch_id:
            fields.scope === 'branch' && fields.assign_branch_id
              ? Number(fields.assign_branch_id)
              : null,
          category_id: categoryId,
          taxes,
          preparation_stations: [],
          modifier_groups,
          name: fields.name ?? 'Menu item',
          code: fields.code ?? null,
          description: fields.description ?? null,
          sku: fields.sku ?? null,
          barcode: fields.barcode ?? null,
          base_price: basePrice,
          profit_margin_percent: fields.profit_margin_percent
            ? Number(fields.profit_margin_percent)
            : null,
          allow_dine_in: fields.allow_dine_in !== 'false',
          allow_takeaway: fields.allow_takeaway !== 'false',
          allow_delivery: fields.allow_delivery !== 'false',
          expose_captain_app: fields.expose_captain_app !== 'false',
          is_favorite: fields.is_favorite === 'true',
          is_combo: fields.is_combo === 'true',
          tag_ids,
          tags: [],
          dietary_type: fields.dietary_type === 'non_veg' ? 'non_veg' : 'veg',
          status: 'active',
          variants,
          images: [],
          created_at: now,
          updated_at: now,
        },
        message: 'Menu item created',
      };
    }

    if (
      request.method === 'POST' &&
      request.path === ApiUrlsV1.restaurant.menuCategories.create &&
      isRecord(request.body)
    ) {
      const now = new Date().toISOString();
      return {
        success: true,
        data: {
          id: Date.now(),
          organization_id: 126,
          company_id: 94,
          catalogue_scope: request.body.scope === 'branch' ? 'branch' : 'company',
          parent_id: typeof request.body.parent_id === 'number' ? request.body.parent_id : null,
          name: String(request.body.name ?? 'Category'),
          description:
            typeof request.body.description === 'string' ? request.body.description : null,
          display_order:
            typeof request.body.display_order === 'number' ? request.body.display_order : 0,
          status: 'active',
          created_at: now,
          updated_at: now,
        },
        message: 'Menu category created',
      };
    }

    const menusListPath = ApiUrlsV1.restaurant.menus.list;
    if (
      request.method === 'POST' &&
      request.path.endsWith('/category-assignments') &&
      request.path.startsWith(`${menusListPath}/`) &&
      isRecord(request.body)
    ) {
      const idSegment = request.path.slice(menusListPath.length + 1).split('/')[0];
      const menuId = Number(idSegment);
      const categoryId = Number(request.body.category_id);
      const category = MOCK_MENU_CATEGORIES.find((row) => row.id === categoryId);
      const now = new Date().toISOString();
      const record = menuCategoryAssignmentSchema.parse({
        id: Date.now(),
        menu_id: Number.isFinite(menuId) ? menuId : 0,
        category_id: Number.isFinite(categoryId) ? categoryId : 0,
        display_order: Number(request.body.display_order ?? 0),
        category: category
          ? { id: category.id, name: category.name, status: category.status }
          : { id: categoryId, name: `Category #${categoryId}`, status: 'active' },
        created_at: now,
        updated_at: now,
      });
      appendMockMenuCategoryAssignment(record);
      return {
        success: true,
        data: record,
        message: 'Menu category assigned',
      };
    }

    if (
      request.method === 'POST' &&
      (request.path.endsWith('/activate') || request.path.endsWith('/deactivate')) &&
      request.path.startsWith(`${menusListPath}/`)
    ) {
      const idSegment = request.path.slice(menusListPath.length + 1).split('/')[0];
      const menuId = Number(idSegment);
      const existing = MOCK_RESTAURANT_MENUS.find((item) => item.id === menuId);
      const now = new Date().toISOString();
      const nextStatus = request.path.endsWith('/activate') ? 'active' : 'inactive';
      return {
        success: true,
        data: {
          id: Number.isFinite(menuId) ? menuId : Date.now(),
          organization_id: existing?.organization_id ?? 126,
          company_id: existing?.company_id ?? 94,
          catalogue_scope: existing?.catalogue_scope ?? 'company',
          branch_id: existing?.branch_id ?? null,
          name: existing?.name ?? 'Menu',
          menu: existing?.menu ?? 'breakfast',
          code: existing?.code ?? 'MENU',
          description: existing?.description ?? null,
          menu_type: existing?.menu_type ?? 'all',
          display_order: existing?.display_order ?? 0,
          status: nextStatus,
          branch_assignment_id: existing?.branch_assignment_id ?? null,
          created_at: existing?.created_at ?? now,
          updated_at: now,
        },
        message: nextStatus === 'active' ? 'Menu activated' : 'Menu deactivated',
      };
    }

    const menuItemsListPath = ApiUrlsV1.restaurant.menuItems.list;
    if (
      request.method === 'POST' &&
      (request.path.endsWith('/activate') || request.path.endsWith('/deactivate')) &&
      request.path.startsWith(`${menuItemsListPath}/`)
    ) {
      const idSegment = request.path.slice(menuItemsListPath.length + 1).split('/')[0];
      const itemId = Number(idSegment);
      const existing = MOCK_MENU_ITEMS.find((item) => item.id === itemId);
      const now = new Date().toISOString();
      const nextStatus = request.path.endsWith('/activate') ? 'active' : 'inactive';
      return {
        success: true,
        data: {
          ...(existing ?? {
            id: itemId,
            organization_id: 126,
            company_id: 94,
            catalogue_scope: 'company',
            branch_id: null,
            category_id: 1,
            taxes: [],
            preparation_stations: [],
            modifier_groups: [],
            name: 'Menu item',
            code: null,
            description: null,
            sku: null,
            barcode: null,
            base_price: 0,
            profit_margin_percent: null,
            allow_dine_in: true,
            allow_takeaway: true,
            allow_delivery: true,
            expose_captain_app: true,
            is_favorite: false,
            is_combo: false,
            tag_ids: [],
            tags: [],
            dietary_type: 'veg',
            variants: [],
            images: [],
            created_at: now,
          }),
          id: Number.isFinite(itemId) ? itemId : Date.now(),
          status: nextStatus,
          updated_at: now,
        },
        message: nextStatus === 'active' ? 'Menu item activated' : 'Menu item deactivated',
      };
    }

    const categoriesListPath = ApiUrlsV1.restaurant.menuCategories.list;
    if (
      request.method === 'POST' &&
      (request.path.endsWith('/activate') || request.path.endsWith('/deactivate')) &&
      request.path.startsWith(`${categoriesListPath}/`)
    ) {
      const idSegment = request.path.slice(categoriesListPath.length + 1).split('/')[0];
      const categoryId = Number(idSegment);
      const existing = MOCK_MENU_CATEGORIES.find((item) => item.id === categoryId);
      const now = new Date().toISOString();
      const nextStatus = request.path.endsWith('/activate') ? 'active' : 'inactive';
      return {
        success: true,
        data: {
          id: Number.isFinite(categoryId) ? categoryId : Date.now(),
          organization_id: existing?.organization_id ?? 126,
          company_id: existing?.company_id ?? 94,
          catalogue_scope: existing?.catalogue_scope ?? 'company',
          parent_id: existing?.parent_id ?? null,
          name: existing?.name ?? 'Category',
          description: existing?.description ?? null,
          display_order: existing?.display_order ?? 0,
          status: nextStatus,
          created_at: existing?.created_at ?? now,
          updated_at: now,
        },
        message: nextStatus === 'active' ? 'Menu category activated' : 'Menu category deactivated',
      };
    }

    if (
      (request.method === 'PUT' || request.method === 'PATCH') &&
      request.path.startsWith(`${categoriesListPath}/`) &&
      isRecord(request.body)
    ) {
      const idSegment = request.path.slice(categoriesListPath.length + 1).split('/')[0];
      const categoryId = Number(idSegment);
      const existing = MOCK_MENU_CATEGORIES.find((item) => item.id === categoryId);
      const now = new Date().toISOString();
      return {
        success: true,
        data: {
          id: Number.isFinite(categoryId) ? categoryId : Date.now(),
          organization_id: existing?.organization_id ?? 126,
          company_id: existing?.company_id ?? 94,
          catalogue_scope: existing?.catalogue_scope ?? 'company',
          parent_id:
            typeof request.body.parent_id === 'number'
              ? request.body.parent_id
              : (existing?.parent_id ?? null),
          name: String(request.body.name ?? existing?.name ?? 'Category'),
          description:
            typeof request.body.description === 'string'
              ? request.body.description
              : (existing?.description ?? null),
          display_order:
            typeof request.body.display_order === 'number'
              ? request.body.display_order
              : (existing?.display_order ?? 0),
          status: request.body.status === 'inactive' ? 'inactive' : 'active',
          created_at: existing?.created_at ?? now,
          updated_at: now,
        },
        message: 'Menu category updated',
      };
    }

    return { success: true, ...(isRecord(request.body) ? request.body : {}) };
  }

  const payload = LIST_MOCKS[listPath];
  if (request.path === listPath) {
    if (
      listPath === ApiUrlsV1.restaurant.menuCategories.list ||
      listPath === ApiUrlsV1.restaurant.menuItems.list ||
      listPath === ApiUrlsV1.restaurant.menuItemTags.list ||
      listPath === ApiUrlsV1.restaurant.menus.list
    ) {
      let items = Array.isArray(payload) ? payload : [];
      if (listPath === ApiUrlsV1.restaurant.menuItemTags.list) {
        const statusFilter = request.params?.status;
        if (typeof statusFilter === 'string' && statusFilter.length > 0) {
          items = items.filter(
            (row) => isRecord(row) && String(row.status ?? 'active') === statusFilter,
          );
        }
      }
      if (listPath === ApiUrlsV1.restaurant.menus.list) {
        const statusFilter = request.params?.status;
        if (typeof statusFilter === 'string' && statusFilter.length > 0) {
          items = items.filter(
            (row) => isRecord(row) && String(row.status ?? 'active') === statusFilter,
          );
        }
        const menuTypeFilter = request.params?.menu_type;
        if (typeof menuTypeFilter === 'string' && menuTypeFilter.length > 0) {
          items = items.filter(
            (row) => isRecord(row) && String(row.menu_type ?? '') === menuTypeFilter,
          );
        }
      }
      const page = Number(request.params?.page) || 1;
      const pageSize = Number(request.params?.page_size) || 15;
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
      };
    }
    return payload;
  }

  const id = request.path.slice(listPath.length + 1).split('/')[0];
  if (Array.isArray(payload)) {
    const match =
      payload.find((item) => isRecord(item) && String(item.id) === decodeURIComponent(id)) ??
      payload[0];
    if (
      listPath === ApiUrlsV1.restaurant.menuCategories.list ||
      listPath === ApiUrlsV1.restaurant.menuItems.list
    ) {
      return { success: true, data: match, message: 'OK' };
    }
    return match;
  }

  return payload;
}

function findListPath(path: string): string | undefined {
  return Object.keys(LIST_MOCKS)
    .sort((left, right) => right.length - left.length)
    .find((listPath) => path === listPath || path.startsWith(`${listPath}/`));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonArray(raw: string | undefined): unknown[] {
  if (!raw?.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formFieldsFromBody(body: unknown): Record<string, string> {
  if (body instanceof FormData) {
    const record: Record<string, string> = {};
    body.forEach((value, key) => {
      if (typeof value === 'string') {
        record[key] = value;
      }
    });
    return record;
  }

  if (isRecord(body)) {
    return Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, value == null ? '' : String(value)]),
    );
  }

  return {};
}
