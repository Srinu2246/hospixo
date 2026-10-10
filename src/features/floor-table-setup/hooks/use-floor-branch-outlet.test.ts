import { describe, expect, it } from 'vitest';

import { resolveActiveFloorBranchId } from './use-floor-branch-outlet';

describe('resolveActiveFloorBranchId', () => {
  it('pins captain flow to the authenticated user branch', () => {
    expect(resolveActiveFloorBranchId('/captain/orders', 17, 'all', 24)).toBe(17);
  });

  it('does not fall back to a selected branch when a captain has no assigned branch', () => {
    expect(resolveActiveFloorBranchId('/captain/ready', null, '24', 24)).toBeNull();
  });

  it('preserves selected branch scope for non-captain workspaces', () => {
    expect(resolveActiveFloorBranchId('/branch/orders', 17, '24', 31)).toBe(24);
  });

  it('falls back to the assigned branch when no outlet is selected', () => {
    expect(resolveActiveFloorBranchId('/branch/ready', 42, null, null)).toBe(42);
  });
});
