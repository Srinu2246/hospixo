import { describe, expect, it } from 'vitest';

import {
  canCreateRoleTemplate,
  getCreatableRoleTemplates,
  getDefaultRoleTemplateId,
} from './roles';

describe('role creation permissions', () => {
  it('lets organisation create every template including managers', () => {
    expect(canCreateRoleTemplate('organisation', 'organisation-manager')).toBe(true);
    expect(canCreateRoleTemplate('organisation', 'company-manager')).toBe(true);
    expect(canCreateRoleTemplate('organisation', 'branch-manager')).toBe(true);
    expect(getCreatableRoleTemplates('organisation')).toHaveLength(10);
  });

  it('lets company create company/branch roles except company manager', () => {
    expect(canCreateRoleTemplate('company', 'organisation-manager')).toBe(false);
    expect(canCreateRoleTemplate('company', 'company-manager')).toBe(false);
    expect(canCreateRoleTemplate('company', 'branch-manager')).toBe(true);
    expect(canCreateRoleTemplate('company', 'cashier')).toBe(true);
    expect(getCreatableRoleTemplates('company').some((t) => t.id === 'company-manager')).toBe(
      false,
    );
  });

  it('lets branch create branch roles except branch manager', () => {
    expect(canCreateRoleTemplate('branch', 'company-manager')).toBe(false);
    expect(canCreateRoleTemplate('branch', 'branch-manager')).toBe(false);
    expect(canCreateRoleTemplate('branch', 'store-manager')).toBe(true);
    expect(canCreateRoleTemplate('branch', 'general-staff')).toBe(true);
  });

  it('blocks operational roles from creating templates', () => {
    expect(canCreateRoleTemplate('counter', 'cashier')).toBe(false);
    expect(canCreateRoleTemplate('captain', 'general-staff')).toBe(false);
    expect(canCreateRoleTemplate('kitchen', 'kitchen-staff')).toBe(false);
    expect(getDefaultRoleTemplateId('counter')).toBeNull();
  });

  it('picks level-appropriate defaults', () => {
    expect(getDefaultRoleTemplateId('organisation')).toBe('organisation-manager');
    expect(getDefaultRoleTemplateId('company')).toBe('branch-manager');
    expect(getDefaultRoleTemplateId('branch')).toBe('store-manager');
  });
});
