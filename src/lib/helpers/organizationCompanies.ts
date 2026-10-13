import ApiUrlsV1, { organizationCompaniesPath } from '@/services/api/ApiUrlsV1';
import {
  parseCompanyList,
  type CompanyListItem,
} from '@/lib/schemas/organization/companies/companyListSchema';
import { ApiError, type QueryParams } from '@/services/api/types';

type GetJson = (path: string, params?: QueryParams) => Promise<unknown>;

/**
 * Load every company for an organization.
 * Tries the platform organisation path first, then the tenant companies list.
 */
export async function loadOrganizationCompanies(
  organizationId: number | undefined,
  get: GetJson,
): Promise<CompanyListItem[]> {
  if (organizationId != null) {
    try {
      const items = parseCompanyList(await get(organizationCompaniesPath(organizationId)));
      if (items.length > 0) return items;
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error;
    }
  }

  const scoped = organizationId != null ? { organization_id: organizationId } : undefined;

  try {
    return parseCompanyList(await get(ApiUrlsV1.organization.companies, scoped));
  } catch (error) {
    if (organizationId == null || !isMissingEndpoint(error)) throw error;
  }

  return parseCompanyList(await get(ApiUrlsV1.organization.companies, { org_id: organizationId }));
}

function isMissingEndpoint(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 403 || error.status === 404);
}
