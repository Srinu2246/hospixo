import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  passwordSchema,
  userRoleFormSchema,
  buildCreateUserStepOneSchema,
  staffProfileSchema,
  usernameSchema,
  phoneSchema,
  personNameSchema,
  emailSchema,
} from './userRolesSchema';

describe('userRolesSchema validation rules', () => {
  describe('passwordSchema (centralized)', () => {
    it('accepts valid password with 8+ chars, uppercase, digit, and special char', () => {
      const valid = passwordSchema.safeParse('Hospixo@2026');
      assert.equal(valid.success, true);
    });

    it('rejects passwords under 8 characters', () => {
      const result = passwordSchema.safeParse('Adm@1');
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('at least 8 characters')));
    });

    it('rejects passwords exceeding 72 characters (bcrypt limit)', () => {
      const longPassword = 'A@1' + 'a'.repeat(75);
      const result = passwordSchema.safeParse(longPassword);
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('cannot exceed 72 characters')));
    });

    it('rejects passwords missing an uppercase letter', () => {
      const result = passwordSchema.safeParse('hospixo@2026');
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('uppercase letter')));
    });

    it('rejects passwords missing a digit', () => {
      const result = passwordSchema.safeParse('Hospixo@Secret');
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('digit')));
    });

    it('rejects passwords missing a special character', () => {
      const result = passwordSchema.safeParse('Hospixo2026');
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('special character')));
    });
  });

  describe('personNameSchema (centralized)', () => {
    const schema = buildCreateUserStepOneSchema([]);

    it('accepts valid names with letters, spaces, hyphens, and apostrophes', () => {
      const valid = schema.safeParse({
        firstName: 'Mary-Ann',
        lastName: "O'Hara",
        phoneNumber: '9876543210',
        email: 'mary.ann@hospixo.com',
        username: 'mary_ann',
        password: 'Password@123',
        company: 'Main Org',
        branch: 'Downtown',
        role: 'Captain',
        sendInviteImmediately: true,
        personalMessage: 'Welcome',
      });
      assert.equal(valid.success, true);
    });

    it('rejects names with numbers or symbols', () => {
      const result = schema.safeParse({
        firstName: 'John123',
        lastName: 'Doe@!',
        phoneNumber: '9876543210',
        email: 'john.doe@hospixo.com',
        username: 'john_doe',
        password: 'Password@123',
        company: 'Main Org',
        branch: 'Downtown',
        role: 'Captain',
        sendInviteImmediately: true,
        personalMessage: 'Welcome',
      });
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some(
          (i) => i.path.includes('firstName') && i.message.includes('only contain letters'),
        ),
      );
      assert.ok(
        result.error.issues.some(
          (i) => i.path.includes('lastName') && i.message.includes('only contain letters'),
        ),
      );
    });

    it('rejects names exceeding 50 characters', () => {
      const result = personNameSchema.safeParse('A'.repeat(55));
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('cannot exceed 50 characters')));
    });

    it('rejects whitespace-only names', () => {
      const result = schema.safeParse({
        firstName: '   ',
        lastName: 'Doe',
        phoneNumber: '9876543210',
        email: 'john.doe@hospixo.com',
        username: 'john_doe',
        password: 'Password@123',
        company: 'Main Org',
        branch: 'Downtown',
        role: 'Captain',
        sendInviteImmediately: true,
        personalMessage: 'Welcome',
      });
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.path.includes('firstName')));
    });
  });

  describe('phoneSchema (centralized E.164 standard)', () => {
    it('accepts valid numeric phone numbers of sufficient length', () => {
      const valid = phoneSchema.safeParse('9876543210');
      assert.equal(valid.success, true);
    });

    it('rejects phone numbers containing letters', () => {
      const result = phoneSchema.safeParse('98765abc');
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('contain only numbers')));
    });

    it('rejects phone numbers exceeding 15 digits (E.164 upper bound)', () => {
      const result = phoneSchema.safeParse('1234567890123456');
      assert.equal(result.success, false);
      assert.ok(result.error.issues.some((i) => i.message.includes('cannot exceed 15 digits')));
    });
  });

  describe('usernameSchema (centralized)', () => {
    it('accepts valid usernames with alphanumeric, dots, hyphens, and underscores', () => {
      assert.equal(usernameSchema.safeParse('john.doe_01').success, true);
      assert.equal(usernameSchema.safeParse('captain-marcus').success, true);
    });

    it('rejects usernames containing spaces or special characters', () => {
      const withSpace = usernameSchema.safeParse('john doe');
      assert.equal(withSpace.success, false);
      assert.ok(
        withSpace.error.issues.some((i) =>
          i.message.includes('only contain letters, numbers, dots, and hyphens'),
        ),
      );

      const withSymbol = usernameSchema.safeParse('john@doe!');
      assert.equal(withSymbol.success, false);
    });

    it('rejects usernames under 3 or over 30 characters', () => {
      assert.equal(usernameSchema.safeParse('ab').success, false);
      assert.equal(usernameSchema.safeParse('a'.repeat(35)).success, false);
    });
  });

  describe('emailSchema (centralized)', () => {
    it('trims leading/trailing spaces and validates format', () => {
      const result = emailSchema.safeParse('  sarah@hospixo.com  ');
      assert.equal(result.success, true);
      assert.equal(result.data, 'sarah@hospixo.com');
    });

    it('rejects invalid emails', () => {
      assert.equal(emailSchema.safeParse('sarah-not-email').success, false);
    });
  });

  describe('userRoleFormSchema (modal quick add/edit)', () => {
    it('validates user role form values', () => {
      const valid = userRoleFormSchema.safeParse({
        name: 'Sarah Jenkins',
        email: 'sarah@hospixo.com',
        role: 'Captain',
        branch: 'Main Branch',
        status: 'active',
      });
      assert.equal(valid.success, true);
    });
  });

  describe('staffProfileSchema password handling', () => {
    it('accepts empty/omitted password during profile update', () => {
      const result = staffProfileSchema.safeParse({
        firstName: 'Alex',
        lastName: 'Smith',
        email: 'alex@hospixo.com',
        phoneNumber: '9876543210',
        countryCode: '+91',
        username: 'alex_smith',
        password: '',
        userStatus: true,
        roleName: 'Store Manager',
      });
      assert.equal(result.success, true);
    });

    it('enforces 8+ chars complexity if password is provided', () => {
      const invalid = staffProfileSchema.safeParse({
        firstName: 'Alex',
        lastName: 'Smith',
        email: 'alex@hospixo.com',
        phoneNumber: '9876543210',
        countryCode: '+91',
        username: 'alex_smith',
        password: 'short',
        userStatus: true,
        roleName: 'Store Manager',
      });
      assert.equal(invalid.success, false);
      assert.ok(invalid.error.issues.some((i) => i.path.includes('password')));
    });
  });
});

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
