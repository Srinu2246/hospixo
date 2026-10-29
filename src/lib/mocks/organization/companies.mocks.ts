import {
  companyListSchema,
  type CompanyListItem,
} from '@/lib/schemas/organization/companies/companyListSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
};

export type { CompanyListItem };

export const MOCK_COMPANIES: CompanyListItem[] = companyListSchema.parse([
  {
    id: 12,
    name: 'Al Baik Foods Ltd',
    code: 'ABF',
    businessType: 'Restaurant',
    status: 'active',
    branchCount: 4,
    userCount: 28,
  },
  {
    id: 18,
    name: 'Spice Garden Group',
    code: 'SGG',
    businessType: 'Restaurant',
    status: 'active',
    branchCount: 2,
    userCount: 15,
  },
  {
    id: 21,
    name: 'Urban Bites Co',
    code: 'UBC',
    businessType: 'Cafe',
    status: 'inactive',
    branchCount: 1,
    userCount: 6,
  },
]);

/**
 * GET /v2/platform/organizations/{organization_id}/companies
 * and GET /v1/companies
 */
export function resolveOrganizationCompaniesMock(request: MockRequest): unknown | undefined {
  if (request.method !== 'GET') return undefined;

  const isPlatformCompanies = /^\/v2\/platform\/organizations\/[^/]+\/companies\/?$/.test(
    request.path,
  );
  if (!isPlatformCompanies && request.path !== ApiUrlsV1.organization.companies) {
    return undefined;
  }

  return {
    success: true,
    data: MOCK_COMPANIES,
    total_pages: 1,
    total: MOCK_COMPANIES.length,
    page: 1,
    page_size: 100,
  };
}
