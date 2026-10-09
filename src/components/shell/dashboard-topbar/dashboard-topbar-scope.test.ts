import { describe, expect, it } from 'vitest';

import type { DashboardOutlet } from '@/features/dashboard/types';

import { resolveCurrentBranchName } from './dashboard-topbar-scope';

const outlets: DashboardOutlet[] = [
  { id: 'all', name: 'All Branches' },
  { id: '17', name: 'Downtown' },
  { id: '24', name: 'Airport' },
];

describe('resolveCurrentBranchName', () => {
  it('uses the assigned branch even when the global filter is set to all', () => {
    expect(resolveCurrentBranchName(outlets, 'all', { branch_id: 17 }, true)).toBe('Downtown');
  });

  it('does not show all branches when an assigned branch is missing', () => {
    expect(resolveCurrentBranchName(outlets, 'all', null, true)).toBe('Your branch');
  });

  it('preserves the selected all-branches label for switchable workspaces', () => {
    expect(resolveCurrentBranchName(outlets, 'all', null)).toBe('All Branches');
  });
});
