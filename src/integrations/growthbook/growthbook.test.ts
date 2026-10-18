import test from 'node:test';
import assert from 'node:assert/strict';
import { GrowthBook } from '@growthbook/growthbook-react';

import type { SidebarSession } from '@/lib/auth/session';

import { buildGrowthBookAttributes, evalFeatureFlag, getGrowthBook } from './growthbookClient';
import { DEFAULT_FEATURE_FLAGS } from './types';

test('GrowthBook - Enabled flags evaluation', () => {
  const gb = new GrowthBook({
    attributes: { id: 'usr-1', role: 'manager' },
  });

  gb.setFeatures({
    'new-test-generation': {
      defaultValue: true,
    },
    'premium-analytics': {
      defaultValue: true,
    },
  });

  assert.equal(gb.isOn('new-test-generation'), true);
  assert.equal(gb.isOn('premium-analytics'), true);
  assert.equal(gb.isOff('new-test-generation'), false);
});

test('GrowthBook - Disabled flags evaluation', () => {
  const gb = new GrowthBook({
    attributes: { id: 'usr-2' },
  });

  gb.setFeatures({
    'new-test-generation': {
      defaultValue: false,
    },
    'legacy-export': {
      defaultValue: false,
    },
  });

  assert.equal(gb.isOn('new-test-generation'), false);
  assert.equal(gb.isOn('legacy-export'), false);
  assert.equal(gb.isOff('new-test-generation'), true);
});

test('GrowthBook - Fallback behavior when flags are missing or undefined', () => {
  const gb = getGrowthBook();
  gb.setFeatures({});

  assert.equal(gb.isOn('non-existent-flag'), false);

  const fallbackConfig = { theme: 'default', limit: 10 };
  const value = gb.getFeatureValue('missing-config-flag', fallbackConfig);
  assert.deepEqual(value, fallbackConfig);

  assert.equal(
    evalFeatureFlag('new-test-generation'),
    DEFAULT_FEATURE_FLAGS['new-test-generation'],
  );
  assert.equal(evalFeatureFlag('unregistered-flag', true), true);
  assert.equal(evalFeatureFlag('unregistered-flag', false), false);
});

test('GrowthBook - Targeting rules based on user/organization context', () => {
  const gb = new GrowthBook();

  gb.setFeatures({
    'new-test-generation': {
      defaultValue: false,
      rules: [
        {
          condition: { companyId: '101' },
          force: true,
        },
        {
          condition: { role: 'super_admin' },
          force: true,
        },
      ],
    },
  });

  gb.setAttributes({ id: 'usr-3', companyId: '101', role: 'waiter' });
  assert.equal(gb.isOn('new-test-generation'), true);

  gb.setAttributes({ id: 'usr-4', companyId: '999', role: 'super_admin' });
  assert.equal(gb.isOn('new-test-generation'), true);

  gb.setAttributes({ id: 'usr-5', companyId: '202', role: 'cashier' });
  assert.equal(gb.isOn('new-test-generation'), false);
});

test('GrowthBook - Dynamic user context changes during session', () => {
  const gb = new GrowthBook({
    attributes: { id: 'usr-dyn', branchId: 'branch-A' },
  });

  gb.setFeatures({
    'branch-beta-feature': {
      defaultValue: false,
      rules: [
        {
          condition: { branchId: 'branch-B' },
          force: true,
        },
      ],
    },
  });

  assert.equal(gb.isOn('branch-beta-feature'), false);

  gb.setAttributes({ id: 'usr-dyn', branchId: 'branch-B' });
  assert.equal(gb.isOn('branch-beta-feature'), true);

  gb.setAttributes({});
  assert.equal(gb.isOn('branch-beta-feature'), false);
});

test('GrowthBook - buildGrowthBookAttributes correctly extracts session data', () => {
  assert.deepEqual(buildGrowthBookAttributes(null), {});
  assert.deepEqual(buildGrowthBookAttributes(undefined), {});

  const mockSession: SidebarSession = {
    role: 'branch_manager',
    context: {
      organizationId: 5,
      companyId: 10,
      branchId: 25,
    },
    user: {
      name: 'Test Manager',
      role: 'Branch Manager',
      email: 'manager@hospixo.com',
    },
    account: {
      id: 42,
      first_name: 'Test',
      last_name: 'Manager',
      email: 'manager@hospixo.com',
      scope: 'branch',
      roles: ['branch_manager'],
      company_id: 10,
      branch_id: 25,
      org_id: 5,
    },
  };

  const attrs = buildGrowthBookAttributes(mockSession);

  assert.equal(attrs.id, '42');
  assert.equal(attrs.userId, '42');
  assert.equal(attrs.email, 'manager@hospixo.com');
  assert.equal(attrs.role, 'branch_manager');
  assert.equal(attrs.scope, 'branch');
  assert.equal(attrs.companyId, '10');
  assert.equal(attrs.branchId, '25');
  assert.equal(attrs.organizationId, '5');
});
