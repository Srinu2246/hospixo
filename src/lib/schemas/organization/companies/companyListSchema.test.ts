import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { parseCompanyList, type CompanyListItem } from './companyListSchema';
import {
  countBranchesByCompany,
  mergeCompaniesWithBranchCounts,
} from '@/lib/helpers/organizationCompanies';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import {
  MOCK_COMPANIES,
  resolveOrganizationCompaniesMock,
} from '@/lib/mocks/organization/companies.mocks';

describe('HF-19 companyListSchema and branch count integration', () => {
  describe('parseCompanyList', () => {
    it('parses companies from a standard envelope', () => {
      const payload = {
        success: true,
        data: [
          {
            id: 10,
            name: 'Acme Dining',
            code: 'ACME',
            business_type: 'Restaurant',
            status: 'active',
            user_count: 5,
          },
        ],
      };
      const items = parseCompanyList(payload);
      assert.equal(items.length, 1);
      assert.equal(items[0].id, 10);
      assert.equal(items[0].name, 'Acme Dining');
      assert.equal(items[0].branchCount, 0);
      assert.equal(items[0].userCount, 5);
    });

    it('maps branchCount from total_branches, totalBranches, and branches array', () => {
      const payload = [
        { id: 1, name: 'C1', total_branches: 3 },
        { id: 2, name: 'C2', totalBranches: 5 },
        { id: 3, name: 'C3', branches: [{ id: 101 }, { id: 102 }] },
        { id: 4, name: 'C4', branch_count: 7 },
      ];
      const items = parseCompanyList(payload);
      assert.equal(items.length, 4);
      assert.equal(items[0].branchCount, 3);
      assert.equal(items[1].branchCount, 5);
      assert.equal(items[2].branchCount, 2);
      assert.equal(items[3].branchCount, 7);
    });

    it('defaults branchCount to 0 when no branch count info is present in company payload', () => {
      const payload = [{ id: 100, name: 'Empty Branches Co', status: 'active' }];
      const items = parseCompanyList(payload);
      assert.equal(items.length, 1);
      assert.equal(items[0].branchCount, 0);
    });
  });

  describe('countBranchesByCompany', () => {
    it('groups branch counts accurately by companyId', () => {
      const branches: BranchListItem[] = [
        {
          id: 101,
          name: 'Downtown',
          companyId: 12,
          companyName: 'Al Baik Foods Ltd',
          code: 'DT',
          city: 'Hyderabad',
          status: 'active',
          isDefault: true,
        },
        {
          id: 102,
          name: 'Westside',
          companyId: 12,
          companyName: 'Al Baik Foods Ltd',
          code: 'WS',
          city: 'Mumbai',
          status: 'active',
          isDefault: false,
        },
        {
          id: 103,
          name: 'Marina Bay',
          companyId: 18,
          companyName: 'Spice Garden Group',
          code: 'MB',
          city: 'Chennai',
          status: 'active',
          isDefault: true,
        },
      ];

      const counts = countBranchesByCompany(branches);
      assert.equal(counts.get('12'), 2);
      assert.equal(counts.get('18'), 1);
      assert.equal(counts.get('99'), undefined);
    });

    it('ignores branches with invalid or non-positive companyId', () => {
      const branches = [
        {
          id: 201,
          name: 'Orphan Branch',
          companyId: 0,
          companyName: 'Company',
          code: 'NONE',
          city: 'Delhi',
          status: 'active' as const,
          isDefault: false,
        },
      ];
      const counts = countBranchesByCompany(branches);
      assert.equal(counts.size, 0);
    });
  });

  describe('mergeCompaniesWithBranchCounts', () => {
    it('accurately attaches branch counts for companies with branches and companies with none', () => {
      const companies: CompanyListItem[] = [
        {
          id: 12,
          name: 'Al Baik Foods Ltd',
          code: 'ABF',
          businessType: 'Restaurant',
          status: 'active',
          branchCount: 0,
          userCount: 20,
        },
        {
          id: 18,
          name: 'Spice Garden Group',
          code: 'SGG',
          businessType: 'Restaurant',
          status: 'active',
          branchCount: 0,
          userCount: 15,
        },
        {
          id: 99,
          name: 'New Brand No Branches',
          code: 'NONE',
          businessType: 'Bakery',
          status: 'active',
          branchCount: 0,
          userCount: 2,
        },
      ];

      const branches: BranchListItem[] = [
        {
          id: 101,
          name: 'Downtown',
          companyId: 12,
          companyName: 'Al Baik Foods Ltd',
          code: 'DT',
          city: 'Hyderabad',
          status: 'active',
          isDefault: true,
        },
        {
          id: 102,
          name: 'Westside',
          companyId: 12,
          companyName: 'Al Baik Foods Ltd',
          code: 'WS',
          city: 'Mumbai',
          status: 'active',
          isDefault: false,
        },
        {
          id: 103,
          name: 'Marina Bay',
          companyId: 18,
          companyName: 'Spice Garden Group',
          code: 'MB',
          city: 'Chennai',
          status: 'active',
          isDefault: true,
        },
      ];

      const merged = mergeCompaniesWithBranchCounts(companies, branches);

      assert.equal(merged.length, 3);

      const company12 = merged.find((c) => String(c.id) === '12');
      assert.ok(company12);
      assert.equal(company12.branchCount, 2);
      assert.equal(company12.name, 'Al Baik Foods Ltd');
      assert.equal(company12.userCount, 20);

      const company18 = merged.find((c) => String(c.id) === '18');
      assert.ok(company18);
      assert.equal(company18.branchCount, 1);
      assert.equal(company18.name, 'Spice Garden Group');

      // Company with NO live branches must have branchCount: 0
      const company99 = merged.find((c) => String(c.id) === '99');
      assert.ok(company99);
      assert.equal(company99.branchCount, 0);
      assert.equal(company99.name, 'New Brand No Branches');
    });

    it('handles empty branch list gracefully', () => {
      const companies: CompanyListItem[] = [
        {
          id: 1,
          name: 'Solo Company',
          code: 'SC',
          businessType: 'Cafe',
          status: 'active',
          branchCount: 0,
          userCount: 1,
        },
      ];

      const merged = mergeCompaniesWithBranchCounts(companies, []);
      assert.equal(merged.length, 1);
      assert.equal(merged[0].branchCount, 0);
    });
  });

  describe('resolveOrganizationCompaniesMock', () => {
    it('matches /v2/platform/organizations/:id/companies', () => {
      const response = resolveOrganizationCompaniesMock({
        method: 'GET',
        path: '/v2/platform/organizations/126/companies',
      }) as { success: boolean; data: CompanyListItem[] } | undefined;

      assert.ok(response);
      assert.equal(response.success, true);
      assert.equal(response.data.length, MOCK_COMPANIES.length);
    });

    it('matches /v1/companies', () => {
      const response = resolveOrganizationCompaniesMock({
        method: 'GET',
        path: '/v1/companies',
      }) as { success: boolean; data: CompanyListItem[] } | undefined;

      assert.ok(response);
      assert.equal(response.success, true);
    });

    it('returns undefined for non-GET or non-matching paths', () => {
      assert.equal(
        resolveOrganizationCompaniesMock({
          method: 'POST',
          path: '/v2/platform/organizations/126/companies',
        }),
        undefined,
      );
      assert.equal(
        resolveOrganizationCompaniesMock({
          method: 'GET',
          path: '/v1/other-endpoint',
        }),
        undefined,
      );
    });
  });
});
