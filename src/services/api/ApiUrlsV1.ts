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
    register: '/v1/auth/register',
    forgotPassword: '/v1/auth/forgot-password',
    resetPassword: '/v1/auth/reset-password',
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
};

const ENDPOINT_PREFIXES = collectStaticPaths(ApiUrlsV1);

const PUBLIC_ENDPOINTS = new Set<string>([
  ApiUrlsV1.auth.login,
  ApiUrlsV1.auth.register,
  ApiUrlsV1.auth.forgotPassword,
  ApiUrlsV1.auth.resetPassword,
]);

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
