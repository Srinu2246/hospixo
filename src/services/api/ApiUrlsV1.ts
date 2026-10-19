/**
 * Version 1 endpoint catalog.
 * Paths mirror src/features/<domain>/<module>/<screen>.
 * This file is the only place those paths are defined.
 */

type EndpointResource = {
  list: string;
  create: string;
  detail: (id: string) => string;
  update: (id: string) => string;
  remove: (id: string) => string;
};

function resource(path: string): EndpointResource {
  const item = (id: string) => `${path}/${encodeURIComponent(id)}`;

  return {
    list: path,
    create: path,
    detail: item,
    update: item,
    remove: item,
  };
}

const ApiUrlsV1 = {
  auth: {
    login: '/v1/auth/login',
    logout: '/v1/auth/logout',
    me: '/v1/auth/me',
  },
  pos: {
    pointOfSale: {
      allOrders: resource('/v1/pos/point-of-sale/all-orders'),
      cashAndShift: resource('/v1/pos/point-of-sale/cash-and-shift'),
      dashboard: resource('/v1/pos/point-of-sale/dashboard'),
      dineIn: resource('/v1/pos/point-of-sale/dine-in'),
      duePayments: resource('/v1/pos/point-of-sale/due-payments'),
      readyList: resource('/v1/pos/point-of-sale/ready-list'),
      reservation: resource('/v1/pos/point-of-sale/reservation'),
      tables: resource('/v1/pos/point-of-sale/tables'),
      takeaway: resource('/v1/pos/point-of-sale/takeaway'),
      kitchenDisplay: resource('/v1/kitchen-display'),
    },
  },
  operations: {
    kitchenDisplay: resource('/v1/operations/kitchen-display'),
  },

  /** Live Swagger user APIs; feature UI is under `features/employees/user-roles`. */
  users: resource('/v1/users'),
  roles: {
    ...resource('/v1/roles'),
    templates: '/v1/roles/templates',
  },
  permissions: {
    grouped: '/v1/permissions/grouped',
  },
  dashboard: {
    organization: resource('/v1/dashboard/organization'),
    company: resource('/v1/dashboard/company'),
    branch: resource('/v1/dashboard/branch'),
  },
  organization: {
    companies: '/v1/companies',
    platformOrganizations: '/v1/platform/organizations',
    platformOrganizationsV2: '/v2/platform/organizations',
    platformOrganizationCompaniesV2: '/v2/platform/organizations/{organization_id}/companies',
  },
  restaurant: {
    branches: '/v1/branches',
    preparationStations: '/v1/restaurant/preparation-stations',
    gstRates: '/v1/restaurant/gst-rates',
    menuCategories: resource('/v1/restaurant/menu/categories'),
    menuItems: resource('/v1/restaurant/menu/items'),
    /** GET /v1/restaurant/branches/{branch_id}/menus — restaurant branch menus list */
    branchMenus: {
      /** Prefix for session-bearer matching and nested branch menu paths. */
      root: '/v1/restaurant/branches',
      list: (branchId: number | string) => restaurantBranchMenusPath(branchId),
    },
  },
  kitchen: {
    kitchenBoard: resource('/v1/kitchen-display'),
    branchBoard: (branchId: number | string) => branchKitchenBoardPath(branchId),
    branchStatus: (branchId: number | string, orderId: number | string) =>
      branchKitchenStatusPath(branchId, orderId),
  },
};

export function userAssignmentsPath(userId: number | string): string {
  return `${ApiUrlsV1.users.list}/${encodeURIComponent(String(userId))}/assignments`;
}

export function userStatusPath(userId: number | string): string {
  return `${ApiUrlsV1.users.list}/${encodeURIComponent(String(userId))}/status`;
}

export function userRolesPath(userId: number | string): string {
  return `${ApiUrlsV1.users.list}/${encodeURIComponent(String(userId))}/roles`;
}

export function userRolePath(userId: number | string, userRoleId: number | string): string {
  return `${userRolesPath(userId)}/${encodeURIComponent(String(userRoleId))}`;
}

export function userRolePermissionsPath(
  userId: number | string,
  userRoleId: number | string,
): string {
  return `${userRolePath(userId, userRoleId)}/permissions`;
}

export function rolePermissionsPath(roleId: number | string): string {
  return `${ApiUrlsV1.roles.detail(String(roleId))}/permissions`;
}

export function branchKitchenBoardPath(branchId: number | string): string {
  return `${ApiUrlsV1.restaurant.branches}/${encodeURIComponent(String(branchId))}/kitchen-board`;
}

export function branchKitchenStatusPath(
  branchId: number | string,
  orderId: number | string,
): string {
  return `${ApiUrlsV1.restaurant.branches}/${encodeURIComponent(String(branchId))}/orders/${encodeURIComponent(String(orderId))}/kitchen-status`;
}

/** GET /v1/branches/{branch_id}/orders */
export function branchOrdersPath(branchId: number | string): string {
  return `${ApiUrlsV1.restaurant.branches}/${encodeURIComponent(String(branchId))}/orders`;
}

/** GET /v2/platform/organizations/{organization_id}/companies */
export function organizationCompaniesPath(organizationId: number | string): string {
  return ApiUrlsV1.organization.platformOrganizationCompaniesV2.replace(
    '{organization_id}',
    encodeURIComponent(String(organizationId)),
  );
}

export function organizationCompanyBranchesPath(
  organizationId: number | string,
  companyId: number | string,
): string {
  return `${ApiUrlsV1.organization.platformOrganizations}/${encodeURIComponent(String(organizationId))}/companies/${encodeURIComponent(String(companyId))}/branches`;
}

/** GET /v1/restaurant/branches/{branch_id}/menus — restaurant branch menus list */
export function restaurantBranchMenusPath(branchId: number | string): string {
  return `${ApiUrlsV1.restaurant.branchMenus.root}/${encodeURIComponent(String(branchId))}/menus`;
}

/** GET/POST /v1/restaurant/gst-rates */
export function restaurantGstRatesPath(): string {
  return ApiUrlsV1.restaurant.gstRates;
}

/** GET /v1/restaurant/gst-rates/{gst_rate_id} */
export function restaurantGstRatePath(gstRateId: number | string): string {
  return `${restaurantGstRatesPath()}/${encodeURIComponent(String(gstRateId))}`;
}

/** GET/POST /v1/restaurant/menu/categories */
export function restaurantMenuCategoriesPath(): string {
  return ApiUrlsV1.restaurant.menuCategories.list;
}

/** GET/PATCH /v1/restaurant/menu/categories/{category_id} */
export function restaurantMenuCategoryPath(categoryId: number | string): string {
  return ApiUrlsV1.restaurant.menuCategories.detail(String(categoryId));
}

/** POST /v1/restaurant/menu/categories/{category_id}/activate */
export function restaurantMenuCategoryActivatePath(categoryId: number | string): string {
  return `${restaurantMenuCategoryPath(categoryId)}/activate`;
}

/** POST /v1/restaurant/menu/categories/{category_id}/deactivate */
export function restaurantMenuCategoryDeactivatePath(categoryId: number | string): string {
  return `${restaurantMenuCategoryPath(categoryId)}/deactivate`;
}

/** GET/POST /v1/restaurant/menu/items */
export function restaurantMenuItemsPath(): string {
  return ApiUrlsV1.restaurant.menuItems.list;
}

/** GET /v1/restaurant/menu/items/{item_id} */
export function restaurantMenuItemPath(itemId: number | string): string {
  return ApiUrlsV1.restaurant.menuItems.detail(String(itemId));
}

/** POST /v1/restaurant/menu/items/{item_id}/deactivate */
export function restaurantMenuItemDeactivatePath(itemId: number | string): string {
  return `${restaurantMenuItemPath(itemId)}/deactivate`;
}

export function restaurantFloorsPath(branchId: number): string {
  return `${ApiUrlsV1.restaurant.branches}/${branchId}/floors`;
}

export function restaurantFloorPath(branchId: number, floorId: number): string {
  return `${restaurantFloorsPath(branchId)}/${floorId}`;
}

export function restaurantFloorArchivePath(branchId: number, floorId: number): string {
  return `${restaurantFloorPath(branchId, floorId)}/archive`;
}

export function restaurantFloorRestorePath(branchId: number, floorId: number): string {
  return `${restaurantFloorPath(branchId, floorId)}/restore`;
}

export function restaurantFloorSectionsPath(branchId: number, floorId: number): string {
  return `${restaurantFloorPath(branchId, floorId)}/sections`;
}

export function restaurantFloorSectionPath(
  branchId: number,
  floorId: number,
  sectionId: number,
): string {
  return `${restaurantFloorSectionsPath(branchId, floorId)}/${sectionId}`;
}

export function restaurantFloorSectionArchivePath(
  branchId: number,
  floorId: number,
  sectionId: number,
): string {
  return `${restaurantFloorSectionPath(branchId, floorId, sectionId)}/archive`;
}

export function restaurantSectionTablesPath(
  branchId: number,
  floorId: number,
  sectionId: number,
): string {
  return `${restaurantFloorSectionPath(branchId, floorId, sectionId)}/tables`;
}

export function restaurantSectionTablesBulkPath(
  branchId: number,
  floorId: number,
  sectionId: number,
): string {
  return `${restaurantSectionTablesPath(branchId, floorId, sectionId)}/bulk`;
}

export function restaurantSectionFloorMapPath(
  branchId: number,
  floorId: number,
  sectionId: number,
): string {
  return `${restaurantFloorSectionPath(branchId, floorId, sectionId)}/floor-map`;
}

export function restaurantSectionTablePath(
  branchId: number,
  floorId: number,
  sectionId: number,
  tableId: number,
): string {
  return `${restaurantSectionTablesPath(branchId, floorId, sectionId)}/${tableId}`;
}

export function restaurantSectionTableMovePath(
  branchId: number,
  floorId: number,
  sectionId: number,
  tableId: number,
): string {
  return `${restaurantSectionTablePath(branchId, floorId, sectionId, tableId)}/move`;
}

export function restaurantSectionTableArchivePath(
  branchId: number,
  floorId: number,
  sectionId: number,
  tableId: number,
): string {
  return `${restaurantSectionTablePath(branchId, floorId, sectionId, tableId)}/archive`;
}

export function restaurantSectionTableRestorePath(
  branchId: number,
  floorId: number,
  sectionId: number,
  tableId: number,
): string {
  return `${restaurantSectionTablePath(branchId, floorId, sectionId, tableId)}/restore`;
}

export function restaurantFloorSectionRestorePath(
  branchId: number,
  floorId: number,
  sectionId: number,
): string {
  return `${restaurantFloorSectionPath(branchId, floorId, sectionId)}/restore`;
}

const ENDPOINT_PREFIXES = collectStaticPaths(ApiUrlsV1);

const PUBLIC_ENDPOINTS = new Set<string>([ApiUrlsV1.auth.login]);

export function isPublicEndpoint(path: string): boolean {
  return PUBLIC_ENDPOINTS.has(path);
}

export function isAllowedEndpoint(path: string): boolean {
  const normalized = normalizeEndpointPath(path);
  if (!normalized) return false;

  return ENDPOINT_PREFIXES.some((prefix) => matchesEndpoint(normalized, prefix));
}

/** `{organization_id}` in a catalog path matches one URL segment. */
function matchesEndpoint(path: string, pattern: string): boolean {
  if (!pattern.includes('{')) {
    return path === pattern || path.startsWith(`${pattern}/`);
  }

  const expression = new RegExp(
    `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{[^}]+\\\}/g, '[^/]+')}(?:/|$)`,
  );
  return expression.test(path);
}

function collectStaticPaths(node: unknown, paths: string[] = []): string[] {
  if (typeof node === 'string') {
    paths.push(node);
    return paths;
  }

  if (!node || typeof node !== 'object') {
    return paths;
  }

  for (const value of Object.values(node)) {
    collectStaticPaths(value, paths);
  }

  return paths;
}

function normalizeEndpointPath(path: string): string | null {
  if (!path.startsWith('/') || path.includes('\\') || path.includes('//')) {
    return null;
  }

  const segments = path.split('/');
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    return null;
  }

  return path;
}

export default ApiUrlsV1;
