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
    },
  },
  employees: {
    userRoles: resource('/v1/employees/user-roles'),
  },
  dashboard: {
    organization: resource('/v1/dashboard/organization'),
    company: resource('/v1/dashboard/company'),
    branch: resource('/v1/dashboard/branch'),
  },
  restaurant: {
    branches: '/v1/branches',
  },
};

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

  return ENDPOINT_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
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
