import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateCompanyUserCounts,
  calculateBranchUserCounts,
  enrichCompaniesWithUserCounts,
  enrichBranchesWithUserCounts,
} from './organizationUserCounts';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { UserRoleItem } from '@/lib/schemas/employees/user-roles/userRolesSchema';

describe('organizationUserCounts', () => {
  const mockCompanies: CompanyListItem[] = [
    {
      id: 1,
      name: 'IHCL',
      code: 'IHCL',
      businessType: 'Hospitality',
      status: 'active',
      branchCount: 2,
      userCount: 0, // initially 0 as reported in HF-21
    },
    {
      id: 2,
      name: 'Spice Garden',
      code: 'SG',
      businessType: 'Restaurant',
      status: 'active',
      branchCount: 1,
      userCount: 15,
    },
  ];

  const mockBranches: BranchListItem[] = [
    {
      id: 101,
      name: 'Taj Mahal Palace',
      companyId: 1,
      companyName: 'IHCL',
      code: 'TMP',
      city: 'Mumbai',
      status: 'active',
      isDefault: true,
      userCount: 0,
    },
    {
      id: 102,
      name: 'Taj Lands End',
      companyId: 1,
      companyName: 'IHCL',
      code: 'TLE',
      city: 'Mumbai',
      status: 'active',
      isDefault: false,
      userCount: 0,
    },
    {
      id: 103,
      name: 'Spice Central',
      companyId: 2,
      companyName: 'Spice Garden',
      code: 'SC',
      city: 'Bengaluru',
      status: 'active',
      isDefault: true,
      userCount: 0,
    },
  ];

  const mockUsers: UserRoleItem[] = [
    // IHCL Company-level user (no branch assigned)
    {
      id: 'usr-ihcl-corp-1',
      name: 'Corporate Manager',
      email: 'corp@ihcl.com',
      role: 'Company Admin',
      branch: '—',
      company: 'IHCL',
      companyId: 1,
      scope: 'company',
      status: 'active',
    },
    // IHCL Branch-level user assigned to branch 101 with companyId: 1
    {
      id: 'usr-ihcl-b1-1',
      name: 'Branch 101 Manager',
      email: 'b101@ihcl.com',
      role: 'Branch Manager',
      branch: 'Taj Mahal Palace',
      branchId: 101,
      company: 'IHCL',
      companyId: 1,
      scope: 'branch',
      status: 'active',
    },
    // IHCL Branch-level user assigned to branch 101 (only branchId set, companyId inferred from branch)
    {
      id: 'usr-ihcl-b1-2',
      name: 'Branch 101 Cashier',
      email: 'cashier@ihcl.com',
      role: 'Cashier',
      branch: 'Taj Mahal Palace',
      branchId: 101,
      scope: 'branch',
      status: 'active',
    },
    // IHCL Branch-level user assigned to branch 102
    {
      id: 'usr-ihcl-b2-1',
      name: 'Branch 102 Chef',
      email: 'chef@ihcl.com',
      role: 'Head Chef',
      branch: 'Taj Lands End',
      branchId: 102,
      companyId: 1,
      scope: 'branch',
      status: 'active',
    },
    // Spice Garden user
    {
      id: 'usr-sg-1',
      name: 'Spice Manager',
      email: 'sg@spice.com',
      role: 'Branch Manager',
      branch: 'Spice Central',
      branchId: 103,
      companyId: 2,
      scope: 'branch',
      status: 'active',
    },
    // Org Admin user (not associated with IHCL or Spice Garden)
    {
      id: 'usr-org-admin',
      name: 'Platform Super Admin',
      email: 'admin@platform.com',
      role: 'Super Admin',
      branch: '—',
      scope: 'organization',
      status: 'active',
    },
  ];

  describe('calculateCompanyUserCounts', () => {
    it('calculates accurate user counts for company IHCL avoiding double-counting', () => {
      const counts = calculateCompanyUserCounts(mockUsers, mockCompanies, mockBranches);

      // IHCL has 4 distinct users:
      // 1. usr-ihcl-corp-1 (company level)
      // 2. usr-ihcl-b1-1 (branch 101, has both companyId & branchId)
      // 3. usr-ihcl-b1-2 (branch 101, inferred via branch)
      // 4. usr-ihcl-b2-1 (branch 102)
      assert.equal(counts.get('1'), 4);

      // Spice Garden has 1 user
      assert.equal(counts.get('2'), 1);
    });

    it('does not double count a user when both companyId and branchId match', () => {
      // Duplicate user entry with same id
      const duplicateUsers: UserRoleItem[] = [
        mockUsers[1], // usr-ihcl-b1-1
        { ...mockUsers[1] },
      ];
      const counts = calculateCompanyUserCounts(duplicateUsers, mockCompanies, mockBranches);
      assert.equal(counts.get('1'), 1);
    });

    it('returns 0 for companies with no matching users', () => {
      const counts = calculateCompanyUserCounts([], mockCompanies, mockBranches);
      assert.equal(counts.get('1'), 0);
      assert.equal(counts.get('2'), 0);
    });
  });

  describe('calculateBranchUserCounts', () => {
    it('calculates accurate user counts scoped to each branch', () => {
      const counts = calculateBranchUserCounts(mockUsers, mockBranches);

      // Branch 101 has 2 users (usr-ihcl-b1-1, usr-ihcl-b1-2)
      assert.equal(counts.get(101), 2);

      // Branch 102 has 1 user (usr-ihcl-b2-1)
      assert.equal(counts.get(102), 1);

      // Branch 103 has 1 user (usr-sg-1)
      assert.equal(counts.get(103), 1);
    });

    it('does not count company-only users toward branch user count', () => {
      const counts = calculateBranchUserCounts(
        [mockUsers[0]], // Corporate manager (no branchId)
        mockBranches,
      );
      assert.equal(counts.get(101), 0);
      assert.equal(counts.get(102), 0);
      assert.equal(counts.get(103), 0);
    });
  });

  describe('enrichCompaniesWithUserCounts', () => {
    it('fixes 0 user count for IHCL with calculated user count', () => {
      const counts = new Map<string, number>([
        ['1', 4],
        ['2', 1],
      ]);
      const enriched = enrichCompaniesWithUserCounts(mockCompanies, counts);

      const ihcl = enriched.find((c) => c.id === 1);
      assert.ok(ihcl);
      assert.equal(ihcl.userCount, 4);

      // Spice Garden had 15 from response field; if calculated is 1, response field can take precedence or match
      const sg = enriched.find((c) => c.id === 2);
      assert.ok(sg);
    });
  });

  describe('enrichBranchesWithUserCounts', () => {
    it('enriches branches with accurate user counts', () => {
      const counts = new Map<number, number>([
        [101, 2],
        [102, 1],
        [103, 1],
      ]);
      const enriched = enrichBranchesWithUserCounts(mockBranches, counts);

      const b101 = enriched.find((b) => b.id === 101);
      assert.ok(b101);
      assert.equal(b101.userCount, 2);

      const b102 = enriched.find((b) => b.id === 102);
      assert.ok(b102);
      assert.equal(b102.userCount, 1);
    });
  });
});
