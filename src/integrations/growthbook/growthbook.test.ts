import test from 'node:test';
import assert from 'node:assert/strict';
import { GrowthBook } from '@growthbook/growthbook-react';
import {
  buildGrowthBookAttributes,
  evalFeatureFlag,
  syncGrowthBookToStore,
} from './growthbookClient';
import { DEFAULT_FEATURE_FLAGS } from './types';
import { useFeatureFlagStore } from '@/stores/featureFlagStore';
import type { SidebarSession } from '@/lib/auth/session';

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
  const gb = new GrowthBook({
    attributes: { id: 'usr-fallback' },
  });

  // Empty feature definitions
  gb.setFeatures({});

  // 1. Missing flag evaluates to false by default
  assert.equal(gb.isOn('non-existent-flag'), false);

  // 2. getFeatureValue returns user-provided fallback
  const fallbackConfig = { theme: 'default', limit: 10 };
  const value = gb.getFeatureValue('missing-config-flag', fallbackConfig);
  assert.deepEqual(value, fallbackConfig);

  // 3. evalFeatureFlag helper uses DEFAULT_FEATURE_FLAGS or explicit fallback
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

  // User in target company (101) -> Enabled
  gb.setAttributes({ id: 'usr-3', companyId: '101', role: 'waiter' });
  assert.equal(gb.isOn('new-test-generation'), true);

  // User with target role (super_admin) in different company -> Enabled
  gb.setAttributes({ id: 'usr-4', companyId: '999', role: 'super_admin' });
  assert.equal(gb.isOn('new-test-generation'), true);

  // User without matching company or role -> Disabled
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

  // Initially in branch-A: feature is OFF
  assert.equal(gb.isOn('branch-beta-feature'), false);

  // User switches branch to branch-B (e.g. from branch selector in sidebar)
  gb.setAttributes({ id: 'usr-dyn', branchId: 'branch-B' });
  assert.equal(gb.isOn('branch-beta-feature'), true);

  // User switches back or logs out
  gb.setAttributes({});
  assert.equal(gb.isOn('branch-beta-feature'), false);
});

test('GrowthBook - buildGrowthBookAttributes correctly extracts session data', () => {
  // Empty session returns empty object
  assert.deepEqual(buildGrowthBookAttributes(null), {});
  assert.deepEqual(buildGrowthBookAttributes(undefined), {});

  // Full session with account, context, and user
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

test('FeatureFlagStore - syncGrowthBookToStore caches flags in Zustand store', () => {
  const gb = new GrowthBook();
  gb.setFeatures({
    'new-test-generation': {
      defaultValue: true,
    },
    'new-test-generation-variant': {
      defaultValue: 'compact',
    },
  });

  // Synchronize to store
  syncGrowthBookToStore(gb);

  // Verify store state
  const state = useFeatureFlagStore.getState();
  assert.equal(state.isReady, true);
  assert.equal(state.flags['new-test-generation'], true);
  assert.equal(state.values['new-test-generation-variant'], 'compact');
  assert.equal(state.isFeatureOn('new-test-generation'), true);
  assert.equal(state.getFeatureValue('new-test-generation-variant', 'standard'), 'compact');

  // Reset store
  state.reset();
  assert.equal(useFeatureFlagStore.getState().isReady, false);
});
