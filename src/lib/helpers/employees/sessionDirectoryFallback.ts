import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';

export type SessionDirectoryHints = {
  companyId?: number;
  companyName?: string;
  branchId?: number;
  branchName?: string;
};

/** When list APIs return 403, keep create-user flows usable from sidebar/session ids. */
export function enrichDirectoryWithSession(
  companies: readonly CompanyListItem[],
  branches: readonly BranchListItem[],
  hints: SessionDirectoryHints,
): { companies: CompanyListItem[]; branches: BranchListItem[] } {
  let nextCompanies = [...companies];
  let nextBranches = [...branches];

  const companyId = hints.companyId;
  if (
    companyId != null &&
    !nextCompanies.some((company) => String(company.id) === String(companyId))
  ) {
    nextCompanies = [
      ...nextCompanies,
      {
        id: companyId,
        name: hints.companyName?.trim() || `Company #${companyId}`,
        code: null,
        businessType: null,
        status: 'active',
        branchCount: nextBranches.length,
        userCount: 0,
      },
    ];
  }

  const branchId = hints.branchId;
  if (branchId != null && !nextBranches.some((branch) => String(branch.id) === String(branchId))) {
    nextBranches = [
      ...nextBranches,
      {
        id: branchId,
        name: hints.branchName?.trim() || `Branch #${branchId}`,
        companyId: companyId ?? 0,
        companyName: hints.companyName ?? null,
        code: null,
        city: null,
        status: 'active',
      },
    ];
  }

  return { companies: nextCompanies, branches: nextBranches };
}
