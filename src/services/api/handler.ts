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
import { MOCK_MENU_ITEMS } from '@/lib/mocks/pos/usePosMenu.mocks';
import { MOCK_POS_ORDERS, MOCK_READY_ORDERS } from '@/lib/mocks/pos/usePosOrders.mocks';
import { MOCK_RESERVATIONS } from '@/lib/mocks/pos/usePosReservations.mocks';
import {
  MOCK_ACTIVE_SHIFT,
  MOCK_CASH_TRANSACTIONS,
  MOCK_SHIFT_METRICS,
} from '@/lib/mocks/pos/usePosCashShift.mocks';
import { MOCK_BRANCHES } from '@/lib/mocks/organization/branches.mocks';
import { MOCK_COMPANIES } from '@/lib/mocks/organization/companies.mocks';
import {
  getMockPosTablesData,
  resolveRestaurantFloorMock,
} from '@/lib/mocks/floor-and-table-setup/restaurantFloors.mocks';
import {
  MOCK_KITCHEN_ORDERS,
  resolveKitchenDisplayMock,
} from '@/lib/mocks/kitchen-display/kitchenDisplay.mocks';
import { resolveGstRatesMock } from '@/lib/mocks/menu/useGstRates.mocks';
import {
  resolveMenuCategoriesMock,
  resolveMenuItemsMock,
} from '@/lib/mocks/menu/useMenuCreation.mocks';
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
  [ApiUrlsV1.pos.pointOfSale.allOrders.list]: MOCK_POS_ORDERS,
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
  [ApiUrlsV1.pos.pointOfSale.dineIn.list]: getMockPosTablesData(),
  [ApiUrlsV1.pos.pointOfSale.duePayments.list]: MOCK_DUE_PAYMENTS,
  [ApiUrlsV1.pos.pointOfSale.readyList.list]: MOCK_READY_ORDERS,
  [ApiUrlsV1.pos.pointOfSale.reservation.list]: MOCK_RESERVATIONS,
  [ApiUrlsV1.pos.pointOfSale.tables.list]: getMockPosTablesData(),
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
};

export function isMockApiEnabled(): boolean {
  return process.env.API_MOCK === 'true';
}

export function resolveMock(request: MockRequest): unknown | undefined {
  // Floors, sections, tables, and floor-map under /v1/branches/:id/floors/**
  const restaurant = resolveRestaurantFloorMock(request);
  if (restaurant !== undefined) return restaurant;

  const kitchen = resolveKitchenDisplayMock(request);
  if (kitchen !== undefined) return kitchen;

  const gstRates = resolveGstRatesMock(request);
  if (gstRates !== undefined) return gstRates;

  const menuCategories = resolveMenuCategoriesMock(request);
  if (menuCategories !== undefined) return menuCategories;

  const menuItems = resolveMenuItemsMock(request);
  if (menuItems !== undefined) return menuItems;

  const userRoles = resolveUserRolesMock(request);
  if (userRoles !== undefined) return userRoles;

  const listPath = findListPath(request.path);
  if (!listPath) return undefined;

  if (request.method !== 'GET') {
    if (request.path === ApiUrlsV1.auth.login || request.path === ApiUrlsV1.auth.logout) {
      return LIST_MOCKS[request.path];
    }
    return { success: true, ...(isRecord(request.body) ? request.body : {}) };
  }

  const payload = LIST_MOCKS[listPath];
  if (request.path === listPath) return payload;

  const id = request.path.slice(listPath.length + 1).split('/')[0];
  if (Array.isArray(payload)) {
    return (
      payload.find((item) => isRecord(item) && String(item.id) === decodeURIComponent(id)) ??
      payload[0]
    );
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
