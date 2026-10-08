import { describe, expect, it } from 'vitest';

import { flowPaths } from '@/config/shell/flow-paths';
import { routes } from '@/config/routes';
import {
  floorCreatePath,
  floorDetailPath,
  floorSetupPickerPath,
  floorTableSetupPath,
  isPasswordChangeRequiredError,
  isSafeAppPath,
  profileChangePasswordPath,
} from '@/features/floor-table-setup/lib/paths';

describe('floor-table-setup paths', () => {
  it('uses the centralized branch path', () => {
    expect(floorTableSetupPath()).toBe(flowPaths.branch.floorTableSetup);
    expect(floorCreatePath()).toBe(`${flowPaths.branch.floorTableSetup}/create`);
    expect(floorDetailPath('ground')).toBe(`${flowPaths.branch.floorTableSetup}/ground`);
    expect(floorDetailPath('ground', 'floor')).toBe(
      `${flowPaths.branch.floorTableSetup}/ground?tab=floor`,
    );
    expect(floorTableSetupPath(12)).toBe(`${flowPaths.branch.floorTableSetup}?outlet=12`);
    expect(floorCreatePath(12, '9')).toBe(
      `${flowPaths.branch.floorTableSetup}/create?outlet=12&floorId=9`,
    );
    expect(isSafeAppPath('/branch/floor-table-setup/create')).toBe(true);
    expect(isSafeAppPath('//evil.example')).toBe(false);
    expect(floorSetupPickerPath({ roles: ['branch_manager'], scope: 'branch' })).toContain(
      `${routes.dashboard.branch}?next=`,
    );
    expect(floorSetupPickerPath({ roles: ['org_admin'], scope: 'organisation' })).toContain(
      `${routes.dashboard.organisation}?next=`,
    );
  });

  it('sends first-login users to profile change-password', () => {
    expect(
      isPasswordChangeRequiredError('Password change is required before accessing this resource.'),
    ).toBe(true);
    expect(profileChangePasswordPath()).toContain('/profile?changePassword=1');
    expect(profileChangePasswordPath()).toContain('next=');
  });
});
