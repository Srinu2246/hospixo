import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getPathNavbarLevel, getRoleNavbarLevel, resolveTopNavbarLevel } from './topNavbarHelpers';
import type { SidebarContext } from '@/app/sidebar';

describe('topNavbarHelpers', () => {
  describe('getPathNavbarLevel', () => {
    it('identifies organization paths', () => {
      assert.equal(getPathNavbarLevel('/organization/dashboard'), 'organization');
      assert.equal(getPathNavbarLevel('/organization/companies'), 'organization');
      assert.equal(getPathNavbarLevel('/organization/branches/all-branches'), 'organization');
    });

    it('identifies company paths', () => {
      assert.equal(getPathNavbarLevel('/company/dashboard'), 'company');
      assert.equal(getPathNavbarLevel('/company/branches/all-branches'), 'company');
      assert.equal(getPathNavbarLevel('/company/reports'), 'company');
    });

    it('identifies branch paths', () => {
      assert.equal(getPathNavbarLevel('/branch-manager/dashboard'), 'branch');
      assert.equal(getPathNavbarLevel('/branch-manager/management/cash-counter'), 'branch');
      assert.equal(getPathNavbarLevel('/branch/floor-table-setup'), 'branch');
      assert.equal(getPathNavbarLevel('/pos/point-of-sale/dashboard'), 'branch');
      assert.equal(getPathNavbarLevel('/pos/captain-flow'), 'branch');
      assert.equal(getPathNavbarLevel('/waiter/tables'), 'branch');
      assert.equal(getPathNavbarLevel('/cashier/orders'), 'branch');
      assert.equal(getPathNavbarLevel('/kitchen/orders'), 'branch');
      assert.equal(getPathNavbarLevel('/chef/orders'), 'branch');
    });

    it('identifies scoped routes matching sidebar context', () => {
      const context: SidebarContext = {
        organizationSlug: 'ORG1',
        companySlug: 'COMP1',
        branchSlug: 'BRANCH1',
      };

      assert.equal(getPathNavbarLevel('/BRANCH1/dashboard', context), 'branch');
      assert.equal(getPathNavbarLevel('/COMP1/dashboard', context), 'company');
      assert.equal(getPathNavbarLevel('/ORG1/dashboard', context), 'organization');
    });

    it('returns null for generic routes without entity segment', () => {
      assert.equal(getPathNavbarLevel(''), null);
      assert.equal(getPathNavbarLevel('/dashboard'), null);
      assert.equal(getPathNavbarLevel('/users-and-roles'), null);
    });
  });

  describe('getRoleNavbarLevel', () => {
    it('resolves organization roles', () => {
      assert.equal(getRoleNavbarLevel('organization'), 'organization');
      assert.equal(getRoleNavbarLevel('org_admin'), 'organization');
      assert.equal(getRoleNavbarLevel('super_admin'), 'organization');
    });

    it('resolves company roles', () => {
      assert.equal(getRoleNavbarLevel('company'), 'company');
      assert.equal(getRoleNavbarLevel('company_admin'), 'company');
    });

    it('resolves branch-level operational roles', () => {
      assert.equal(getRoleNavbarLevel('branch_manager'), 'branch');
      assert.equal(getRoleNavbarLevel('waiter'), 'branch');
      assert.equal(getRoleNavbarLevel('cashier'), 'branch');
      assert.equal(getRoleNavbarLevel('kitchen'), 'branch');
      assert.equal(getRoleNavbarLevel('chef'), 'branch');
    });
  });

  describe('resolveTopNavbarLevel', () => {
    it('uses path level when path indicates a hierarchy level', () => {
      const context: SidebarContext = {
        organizationSlug: 'ORG1',
        companySlug: 'COMP1',
        branchSlug: 'BRANCH1',
      };

      // Organization role drilling into company page
      assert.equal(resolveTopNavbarLevel('/company/dashboard', 'org_admin', context), 'company');

      // Company role drilling into branch page
      assert.equal(
        resolveTopNavbarLevel('/branch-manager/dashboard', 'company_admin', context),
        'branch',
      );
    });

    it('falls back to role level on generic routes', () => {
      assert.equal(resolveTopNavbarLevel('/dashboard', 'org_admin'), 'organization');
      assert.equal(resolveTopNavbarLevel('/dashboard', 'company_admin'), 'company');
      assert.equal(resolveTopNavbarLevel('/dashboard', 'branch_manager'), 'branch');
    });
  });
});
