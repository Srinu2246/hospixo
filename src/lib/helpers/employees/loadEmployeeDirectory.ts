import { enrichDirectoryWithSession } from '@/lib/helpers/employees/sessionDirectoryFallback';
import { companiesFromBranches } from '@/lib/helpers/employees/companiesFromBranches';
import { loadBranchDirectory } from '@/lib/helpers/organizationBranches';
import { loadCompanyById, loadOrganizationCompanies } from '@/lib/helpers/organizationCompanies';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { QueryParams } from '@/services/api/types';
import type { SessionDirectoryHints } from '@/lib/helpers/employees/sessionDirectoryFallback';

type GetJson = (path: string, params?: QueryParams) => Promise<unknown>;

export type LoadEmployeeDirectoryInput = {
  organizationId?: number;
  companyId?: number;
  session: SessionDirectoryHints;
};

export type EmployeeDirectoryData = {
  companies: CompanyListItem[];
  branches: BranchListItem[];
};

/** Same branch loading path as All Branches, with company/session fallbacks for Users & Roles. */
export async function loadEmployeeDirectory(
  input: LoadEmployeeDirectoryInput,
  get: GetJson,
): Promise<EmployeeDirectoryData> {
  const { organizationId, companyId, session } = input;

  const branches = await loadBranchDirectory(organizationId, companyId, get).catch(() => []);

  let companies: CompanyListItem[] = [];
  if (companyId == null && organizationId != null) {
    companies = await loadOrganizationCompanies(organizationId, get).catch(() => []);
  }

  if (companies.length === 0 && branches.length > 0) {
    companies = companiesFromBranches(branches);
  }

  if (companyId != null && !companies.some((c) => String(c.id) === String(companyId))) {
    const detail = await loadCompanyById(companyId, get).catch(() => null);
    if (detail) companies = [...companies, detail];
  }

  return enrichDirectoryWithSession(companies, branches, {
    companyId: companyId ?? session.companyId,
    companyName:
      session.companyName ?? companies.find((c) => String(c.id) === String(companyId))?.name,
    branchId: session.branchId,
    branchName: session.branchName,
  });
}
