import { MOCK_MENUS } from '@/lib/mocks/menu/useMenus.mocks';
import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

function ok<T>(data: T, message = 'Branch menus retrieved') {
  return { success: true as const, data, message, request_id: 'mock-branch-menus' };
}

const MENUS_PATH_RE = /^\/v1\/restaurant\/branches\/\d+\/menus$/;

/**
 * Mock resolver for GET /v1/restaurant/branches/{branch_id}/menus.
 */
export function resolveBranchMenusMock(request: MockRequest): unknown | undefined {
  if (request.method !== 'GET' || !MENUS_PATH_RE.test(request.path)) return undefined;

  const status =
    typeof request.params?.status === 'string' ? request.params.status.toLowerCase() : '';
  const items =
    status && status !== 'all'
      ? MOCK_MENUS.filter((row) => row.status.toLowerCase() === status)
      : MOCK_MENUS;

  const page = Number(request.params?.page ?? 1) || 1;
  const pageSize = Number(request.params?.page_size ?? 15) || 15;

  return ok({
    items,
    total: items.length,
    page,
    page_size: pageSize,
  });
}
