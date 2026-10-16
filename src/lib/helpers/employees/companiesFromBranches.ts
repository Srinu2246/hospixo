import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';

/** Build a company pick-list from branch rows when GET /v1/companies is forbidden or empty. */
export function companiesFromBranches(branches: readonly BranchListItem[]): CompanyListItem[] {
  const counts = new Map<string, { item: CompanyListItem; branchCount: number }>();

  for (const branch of branches) {
    const companyId = branch.companyId;
    if (companyId === '' || companyId == null) continue;

    const key = String(companyId);
    const existing = counts.get(key);
    if (existing) {
      existing.branchCount += 1;
      if (branch.companyName?.trim()) {
        existing.item.name = branch.companyName.trim();
      }
      continue;
    }

    counts.set(key, {
      branchCount: 1,
      item: {
        id: companyId,
        name: branch.companyName?.trim() || `Company #${companyId}`,
        code: null,
        businessType: null,
        status: 'active',
        branchCount: 1,
        userCount: 0,
      },
    });
  }

  return [...counts.values()].map(({ item, branchCount }) => ({
    ...item,
    branchCount,
  }));
}
