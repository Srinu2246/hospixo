import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { readOrganizationNameFromAccount, resolveEntityScopeLabel } from './sidebarHelpers';
import type { SidebarContext } from '@/app/sidebar';

describe('sidebarHelpers', () => {
  describe('readOrganizationNameFromAccount', () => {
    it('reads organization_name from flat field', () => {
      const account = { organization_name: 'Alpha Hospitals Group' };
      assert.equal(readOrganizationNameFromAccount(account), 'Alpha Hospitals Group');
    });

    it('reads org_name as alternative flat field', () => {
      const account = { org_name: 'Metro Health Org' };
      assert.equal(readOrganizationNameFromAccount(account), 'Metro Health Org');
    });

    it('reads organization.name from nested record', () => {
      const account = { organization: { name: 'Care Corp Global' } };
      assert.equal(readOrganizationNameFromAccount(account), 'Care Corp Global');
    });

    it('returns undefined when no organization fields exist', () => {
      assert.equal(readOrganizationNameFromAccount(null), undefined);
      assert.equal(readOrganizationNameFromAccount({}), undefined);
      assert.equal(readOrganizationNameFromAccount({ first_name: 'John' }), undefined);
    });
  });

  describe('resolveEntityScopeLabel', () => {
    describe('Organization Level', () => {
      it('displays organization name from context', () => {
        const context: SidebarContext = {
          organizationName: 'Global Healthcare Org',
          companyName: 'City Hospital',
          branchName: 'Main Branch',
        };

        const result = resolveEntityScopeLabel({
          level: 'organization',
          context,
        });

        // Must display organization name and NEVER branch or company name
        assert.equal(result, 'Global Healthcare Org');
      });

      it('falls back to account organization name if context is empty', () => {
        const account = { organization_name: 'Apex Health Systems' };
        const context: SidebarContext = {
          companyName: 'East Wing Clinic',
          branchName: 'Downtown',
        };

        const result = resolveEntityScopeLabel({
          level: 'organization',
          context,
          account,
        });

        assert.equal(result, 'Apex Health Systems');
      });

      it('falls back to organizationSlug if names are empty', () => {
        const context: SidebarContext = {
          organizationSlug: 'ORG-APEX',
        };

        const result = resolveEntityScopeLabel({
          level: 'organization',
          context,
        });

        assert.equal(result, 'ORG-APEX');
      });

      it('never displays company or branch name even when organization name is absent', () => {
        const context: SidebarContext = {
          companyName: 'City Hospital',
          branchName: 'Main Branch',
        };

        const result = resolveEntityScopeLabel({
          level: 'organization',
          context,
        });

        assert.equal(result, null);
      });
    });

    describe('Company Level', () => {
      it('displays currently selected company name from context', () => {
        const context: SidebarContext = {
          organizationName: 'Global Healthcare Org',
          companyName: 'City Hospital',
          branchName: 'Main Branch',
        };

        const result = resolveEntityScopeLabel({
          level: 'company',
          context,
        });

        // Must display company name and NEVER branch name or organization name
        assert.equal(result, 'City Hospital');
      });

      it('falls back to resolvedCompanyName if context.companyName is empty', () => {
        const context: SidebarContext = {
          organizationName: 'Global Healthcare Org',
          branchName: 'Main Branch',
        };

        const result = resolveEntityScopeLabel({
          level: 'company',
          context,
          resolvedCompanyName: 'Metro Wellness Ltd',
        });

        assert.equal(result, 'Metro Wellness Ltd');
      });

      it('falls back to companySlug if companyName is empty', () => {
        const context: SidebarContext = {
          companySlug: 'METRO-WELLNESS',
          branchName: 'Main Branch',
        };

        const result = resolveEntityScopeLabel({
          level: 'company',
          context,
        });

        assert.equal(result, 'METRO-WELLNESS');
      });

      it('never displays branch name or organization name even when company name is absent', () => {
        const context: SidebarContext = {
          organizationName: 'Global Healthcare Org',
          branchName: 'Main Branch',
        };

        const result = resolveEntityScopeLabel({
          level: 'company',
          context,
        });

        assert.equal(result, null);
      });
    });

    describe('Branch Level', () => {
      it('displays currently selected branch name from context or resolved', () => {
        const context: SidebarContext = {
          organizationName: 'Global Healthcare Org',
          companyName: 'City Hospital',
          branchName: 'Downtown Central',
        };

        const result = resolveEntityScopeLabel({
          level: 'branch',
          context,
          resolvedBranchName: 'Downtown Central',
        });

        assert.equal(result, 'Downtown Central');
      });

      it('falls back to branchSlug if branchName is empty', () => {
        const context: SidebarContext = {
          branchSlug: 'DTC-01',
        };

        const result = resolveEntityScopeLabel({
          level: 'branch',
          context,
        });

        assert.equal(result, 'DTC-01');
      });

      it('never displays company or organization name even when branch name is absent', () => {
        const context: SidebarContext = {
          organizationName: 'Global Healthcare Org',
          companyName: 'City Hospital',
        };

        const result = resolveEntityScopeLabel({
          level: 'branch',
          context,
        });

        assert.equal(result, null);
      });
    });
  });
});
