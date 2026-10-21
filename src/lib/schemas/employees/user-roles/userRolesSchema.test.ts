import test from 'node:test';
import assert from 'node:assert/strict';

import { isMatch, resolveRoleId, readPrimaryUserRoleId } from './userRolesSchema';
import {
  autoEnableRolePermissions,
  resolveAssignmentPermissionsPayload,
} from '@/lib/helpers/employees/userRolesHelpers';
import type { PermissionCategory } from '@/lib/schemas/employees/user-roles/userRolesSchema';

test('userRolesSchema - isMatch compares case-insensitively and handles null/undefined', () => {
  assert.equal(isMatch('Admin', 'admin'), true);
  assert.equal(isMatch('Super Admin', 'super admin'), true);
  assert.equal(isMatch('Admin', 'Admin', { caseSensitive: true }), true);
  assert.equal(isMatch('Admin', 'admin', { caseSensitive: true }), false);
  assert.equal(isMatch(null, 'admin'), false);
  assert.equal(isMatch(undefined, 'admin'), false);
  assert.equal(isMatch('admin', null), false);
});

test('userRolesSchema - resolveRoleId matches by exact name, code, clean alphanumeric, or aliases', () => {
  const catalog = [
    { id: '1', name: 'Branch Admin', code: 'BRANCH_ADMIN' },
    { id: '2', name: 'Cashier / POS Operator', code: 'CASHIER' },
    { id: '3', name: 'Waiter & Captain', code: 'WAITER' },
    { id: '4', name: 'Company Director', code: 'COMPANY_ADMIN' },
  ];

  // Exact match
  assert.equal(resolveRoleId('Branch Admin', catalog), '1');
  assert.equal(resolveRoleId('CASHIER', catalog), '2');

  // Alphanumeric clean match
  assert.equal(resolveRoleId('BranchAdmin', catalog), '1');

  // Alias / keyword matches
  assert.equal(resolveRoleId('Cashier', catalog), '2');
  assert.equal(resolveRoleId('Waiter', catalog), '3');
  assert.equal(resolveRoleId('Company Manager', catalog), '4');

  // Unknown role
  assert.equal(resolveRoleId('Unknown Role', catalog), null);
  assert.equal(resolveRoleId('', catalog), null);
});

test('userRolesSchema - readPrimaryUserRoleId extracts role id from assignments', () => {
  assert.equal(readPrimaryUserRoleId({ role_id: 42 }), '42');
  assert.equal(readPrimaryUserRoleId([{ roleId: 'role-10' }]), 'role-10');
  assert.equal(readPrimaryUserRoleId(null), null);
  assert.equal(readPrimaryUserRoleId({}), null);
});

test('userRolesHelpers - autoEnableRolePermissions enables permissions present in assignedKeys', () => {
  const categories: PermissionCategory[] = [
    {
      id: 'cat-1',
      title: 'Category 1',
      permissions: [
        { id: 'perm-1', code: 'PERM_1', name: 'Perm 1', description: '', enabled: false },
        { id: 'perm-2', code: 'PERM_2', name: 'Perm 2', description: '', enabled: false },
      ],
    },
  ];

  const assigned = new Set<string>(['PERM_1']);
  const result = autoEnableRolePermissions(categories, assigned);

  assert.equal(result[0].permissions[0].enabled, true);
  assert.equal(result[0].permissions[1].enabled, false);
});

test('userRolesHelpers - resolveAssignmentPermissionsPayload generates grants and revokes', async () => {
  const categories: PermissionCategory[] = [
    {
      id: 'cat-1',
      title: 'Category 1',
      permissions: [
        { id: 'perm-1', code: 'PERM_1', name: 'Perm 1', description: '', enabled: true },
        { id: 'perm-2', code: 'PERM_2', name: 'Perm 2', description: '', enabled: false },
      ],
    },
  ];

  // Mock fetcher that returns an inherited permission 'PERM_2'
  const mockFetcher = async () => ({
    inherited_permission_codes: ['PERM_2'],
  });

  const payload = await resolveAssignmentPermissionsPayload(
    'user-1',
    'role-1',
    categories,
    mockFetcher,
  );

  assert.deepEqual(payload.permission_codes, ['PERM_1']);
  assert.deepEqual(payload.assignment_adjustments, [
    { permission_code: 'PERM_1', effect: 'grant' },
    { permission_code: 'PERM_2', effect: 'revoke' },
  ]);
});
