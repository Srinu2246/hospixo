import {
  branchListSchema,
  type BranchListItem,
} from '@/lib/schemas/organization/branches/branchListSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
};

export type { BranchListItem };

export const MOCK_BRANCHES: BranchListItem[] = branchListSchema.parse([
  {
    id: 101,
    name: 'Downtown Central',
    companyId: 12,
    companyName: 'Al Baik Foods Ltd',
    code: 'DTC',
    city: 'Hyderabad',
    status: 'active',
    isDefault: true,
  },
  {
    id: 102,
    name: 'Westside Mall',
    companyId: 12,
    companyName: 'Al Baik Foods Ltd',
    code: 'WSM',
    city: 'Bengaluru',
    status: 'active',
    isDefault: false,
  },
  {
    id: 103,
    name: 'Marina Bay',
    companyId: 18,
    companyName: 'Spice Garden Group',
    code: 'MRB',
    city: 'Chennai',
    status: 'active',
    isDefault: true,
  },
  {
    id: 104,
    name: 'Harbor Front',
    companyId: 21,
    companyName: 'Urban Bites Co',
    code: 'HBF',
    city: 'Mumbai',
    status: 'inactive',
    isDefault: false,
  },
]);

/** GET /v1/branches?company_id&search&status&page&page_size */
export function resolveBranchesMock(request: MockRequest): unknown | undefined {
  if (request.method !== 'GET' || request.path !== ApiUrlsV1.restaurant.branches) {
    return undefined;
  }

  const companyId = Number(request.params?.company_id);
  const search =
    typeof request.params?.search === 'string' ? request.params.search.trim().toLowerCase() : '';
  const status = typeof request.params?.status === 'string' ? request.params.status.trim() : '';
  const page = Number(request.params?.page) || 1;
  const pageSize = Number(request.params?.page_size) || 15;

  let items = [...MOCK_BRANCHES];
  if (Number.isFinite(companyId) && companyId > 0) {
    items = items.filter((branch) => branch.companyId === companyId);
  }
  if (status === 'active' || status === 'inactive') {
    items = items.filter((branch) => branch.status === status);
  }
  if (search) {
    items = items.filter((branch) => {
      const haystack = [branch.name, branch.code, branch.city, branch.companyName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  const start = (page - 1) * pageSize;
  return {
    success: true,
    data: {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      page_size: pageSize,
    },
    message: 'OK',
  };
}
